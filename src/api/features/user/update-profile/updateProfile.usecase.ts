import type { UserEntity } from '@/api/shared/domain/user';
import { User } from '@/api/shared/domain/user/user.logic';
import type { UserRepository } from '@/api/shared/domain/user/user.repository';
import { NotFoundError } from '@/api/shared/error';
import type { SessionUser } from '@/api/shared/types/sessionUser';

type Inject = {
  sessionUser: SessionUser;
  userRepository: UserRepository;
};

type Input = {
  nickname: string;
};

type Output = {
  user: UserEntity;
};

const run =
  ({ sessionUser, userRepository }: Inject) =>
  async ({ nickname }: Input): Promise<Output> => {
    const user = await userRepository.findCurrentUserById({ id: sessionUser.id });
    if (!user) throw new NotFoundError('ユーザーが見つかりません');

    const updatedUser = User.updateProfile(user)({ nickname });

    await userRepository.update({ entity: updatedUser });

    return { user: updatedUser };
  };

export const UpdateProfileUsecase = { run };
