import type { SupabaseClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';
import { Effect } from 'effect';
import type { UserRepository } from '@/api/shared/domain/user';
import { CreateUserDomainService } from '@/api/shared/domain/user/createUser.domainService';
import { InternalServerError } from '@/api/shared/error/errors';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import { userAuthsTable, usersTable } from '@/api/shared/lib/db/schema';
import { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';

type Inject = {
  supabase: SupabaseClient;
  authCode: string;
  db: DrizzleClient;
  userRepository: UserRepository;
};

const run =
  ({ db, supabase, authCode, userRepository }: Inject) =>
  (): Effect.Effect<void, InternalServerError> =>
    Effect.gen(function* () {
      const { data, error } = yield* Effect.promise(() => supabase.auth.exchangeCodeForSession(authCode));

      if (error) return yield* Effect.fail(new InternalServerError(error.message));
      if (!data) return yield* Effect.fail(new InternalServerError('No session data'));

      const users = yield* Effect.tryPromise({
        try: () =>
          db
            .select({ id: usersTable.id })
            .from(userAuthsTable)
            .innerJoin(usersTable, eq(userAuthsTable.userId, usersTable.id))
            .where(eq(userAuthsTable.providerId, data.user.id)),
        catch: () => new InternalServerError('ユーザー検索に失敗しました'),
      });

      const user = users[0];
      if (user) return;

      yield* CreateUserDomainService.run({ userRepository })({
        provider: ProviderEnum.Google,
        providerId: data.user.id,
      });
    });

export const OAuthCallbackUsecase = { run };
