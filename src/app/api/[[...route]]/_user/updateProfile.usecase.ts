import { User } from '@/app/api/_shared/domain/user/user.entity';
import type { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { NotFoundError } from '@/app/api/_shared/lib/error';
import type { SelectUser } from '@/lib/db/schema';
import type { SessionUser } from '@/types/api/sessionUser';

type Inject = {
  authUser: SessionUser;
  userRepository: UserRepository;
};

type Input = {
  nickname: string;
};

type Output = {
  user: Omit<SelectUser, 'deletedAt'>;
};

const run =
  ({ authUser, userRepository }: Inject) =>
  async ({ nickname }: Input): Promise<Output> => {
    const user = await userRepository.findCurrentUserByAuthProviderId({ authProviderId: authUser.id });
    if (!user) throw new NotFoundError('ユーザーが見つかりません');

    const updatedUser = User.updateProfile(user)({ nickname });

    await userRepository.update({ user: updatedUser });

    return { user: updatedUser };
  };

export const UpdateProfileUsecase = { run };
