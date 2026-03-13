import { Effect } from 'effect';
import type { UserEntity, UserRepository } from '@/api/shared/domain/user';
import { NotFoundError } from '@/api/shared/error';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { SessionUser } from '@/api/shared/types/sessionUser';

type Inject = {
  sessionUser: SessionUser;
  db: DrizzleClient;
  userRepository: UserRepository;
};

type Output = {
  user: UserEntity;
};

const run =
  ({ sessionUser, db: _db, userRepository }: Inject) =>
  (): Effect.Effect<Output, NotFoundError> =>
    Effect.gen(function* () {
      const user = yield* Effect.tryPromise({
        try: () => userRepository.findCurrentUserById({ id: sessionUser.id }),
        catch: () => new NotFoundError('ユーザーが見つかりません'),
      });

      if (!user) {
        console.error('ユーザーが見つかりません', { sessionUserId: sessionUser.id });
        return yield* Effect.fail(new NotFoundError('ユーザーが見つかりません'));
      }

      return { user };
    });

export const GetCurrentUserUsecase = { run };
