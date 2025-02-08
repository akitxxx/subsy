import type { DrizzleClient } from '@/lib/db/drizzle';
import { userAuthsTable, usersTable } from '@/lib/db/schema';
import { ProviderEnum } from '@/types/enums/provider.enum';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';

type Inject = {
  db: DrizzleClient;
  supabase: SupabaseClient;
  authCode: string;
};

type Output = {
  error: Error | null;
};

const run =
  ({ db, supabase, authCode }: Inject) =>
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
      await db.transaction(async (tx) => {
        const [user] = await tx
          .insert(usersTable)
          .values({
            nickname: data.user.email ?? '',
          })
          .returning();
        await tx.insert(userAuthsTable).values({
          userId: user.id,
          provider: ProviderEnum.Google,
          providerId: data.user.id,
        });
      });
    }

    return { error: null };
  };

export const OAuthCallbackUsecase = { run };
