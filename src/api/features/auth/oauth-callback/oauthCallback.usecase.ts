import type { SupabaseClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';
import { Effect } from 'effect';
import type { UserRepository } from '@/api/shared/domain/user';
import { CreateUserDomainService } from '@/api/shared/domain/user/createUser.domainService';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import { userAuthsTable, usersTable } from '@/api/shared/lib/db/schema';
import { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';

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
  (): Effect.Effect<Output, never> =>
    Effect.gen(function* () {
      const sessionResult = yield* Effect.tryPromise({
        try: () => supabase.auth.exchangeCodeForSession(authCode),
        catch: (e) => e as Error,
      }).pipe(Effect.catchAll((e) => Effect.succeed({ data: null, error: e })));

      if (sessionResult.error) return { error: sessionResult.error as Error };

      const data = sessionResult.data;
      if (!data) return { error: new Error('No session data') };

      const users = yield* Effect.tryPromise({
        try: () =>
          db
            .select({ id: usersTable.id })
            .from(userAuthsTable)
            .innerJoin(usersTable, eq(userAuthsTable.userId, usersTable.id))
            .where(eq(userAuthsTable.providerId, data.user.id)),
        catch: (e) => e as Error,
      }).pipe(Effect.catchAll(() => Effect.succeed([] as { id: string }[])));

      const user = users[0];
      if (user) return { error: null };

      // DBにUserレコードがなければ作成する
      yield* Effect.tryPromise({
        try: () =>
          CreateUserDomainService.run({ userRepository })({
            provider: ProviderEnum.Google, // TODO: プロバイダーによって変える
            providerId: data.user.id,
          }),
        catch: (e) => e as Error,
      }).pipe(Effect.catchAll(() => Effect.succeed(undefined)));

      return { error: null };
    });

export const OAuthCallbackUsecase = { run };
