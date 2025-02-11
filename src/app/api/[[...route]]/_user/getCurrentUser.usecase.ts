import type { UserEntity } from '@/app/api/_shared/domain/user/user.entity';
import type { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { NotFoundError, UnauthorizedError } from '@/app/api/_shared/lib/error';
import type { DrizzleClient } from '@/lib/db/drizzle';
import type { SessionUser } from '@/types/api/sessionUser';

type Inject = {
  sessionUser: SessionUser;
  db: DrizzleClient;
  userRepository: UserRepository;
};

type Output = {
  user: UserEntity;
};

const run =
  ({ sessionUser, db, userRepository }: Inject) =>
  async (): Promise<Output> => {
    const user = await userRepository.findCurrentUserById({ id: sessionUser.id });

    if (!user) {
      console.error('ユーザーが見つかりません', { sessionUserId: sessionUser.id });
      throw new NotFoundError('ユーザーが見つかりません');
    }

    return { user };
  };

export const GetCurrentUserUsecase = { run };
