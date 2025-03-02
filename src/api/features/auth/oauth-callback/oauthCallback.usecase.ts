import { User } from '@/api/shared/domain/user';
import type { UserRepository } from '@/api/shared/domain/user';
import { CreateUserDomainService } from '@/api/shared/domain/user/createUser.domainService';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import { userAuthsTable, usersTable } from '@/api/shared/lib/db/schema';
import { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';
import type { SupabaseClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';

type Inject = {
  supabase: SupabaseClient;
  authCode: string;
  db: DrizzleClient;
  userRepository: UserRepository;
};

type Output = {
  error: Error | null;
};

const run =
  ({ db, supabase, authCode, userRepository }: Inject) =>
  async (): Promise<Output> => {
    const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);

    if (error) return { error };

    const [user] = await db
      .select({ id: usersTable.id })
      .from(userAuthsTable)
      .innerJoin(usersTable, eq(userAuthsTable.userId, usersTable.id))
      .where(eq(userAuthsTable.providerId, data.user.id));

    if (user) return { error: null };

    // DBにUserレコードがなければ作成する
    if (!user) {
      await CreateUserDomainService.run({ userRepository })({
        provider: ProviderEnum.Google, // TODO: プロバイダーによって変える
        providerId: data.user.id,
      });
    }

    return { error: null };
  };

export const OAuthCallbackUsecase = { run };
