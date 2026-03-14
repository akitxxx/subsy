import { Effect } from 'effect';
import type { UserEntity, UserRepository } from '@/api/shared/domain/user';
import { type InternalServerError, NotFoundError } from '@/api/shared/error';
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
  (): Effect.Effect<Output, NotFoundError | InternalServerError> =>
    Effect.gen(function* () {
      const user = yield* userRepository.findCurrentUserById({ id: sessionUser.id });

      if (!user) {
        console.error('ユーザーが見つかりません', { sessionUserId: sessionUser.id });
        return yield* Effect.fail(new NotFoundError('ユーザーが見つかりません'));
      }

      return { user };
    });

export const GetCurrentUserUsecase = { run };
