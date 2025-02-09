import type { UserEntity } from '@/app/api/_shared/domain/user/user.entity';
import type { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { NotFoundError, UnauthorizedError } from '@/app/api/_shared/lib/error';
import type { DrizzleClient } from '@/lib/db/drizzle';
import type { User } from '@supabase/supabase-js';

type Inject = {
  authUser: User;
  db: DrizzleClient;
  userRepository: UserRepository;
};

type Output = {
  user: UserEntity;
};

const run =
  ({ authUser, db, userRepository }: Inject) =>
  async (): Promise<Output> => {
    const user = await userRepository.findCurrentUserByAuthProviderId({ authProviderId: authUser.id });

    if (!user) {
      console.error('ユーザーが見つかりません', { authUserId: authUser?.id });
      throw new NotFoundError('ユーザーが見つかりません');
    }

    return { user };
  };

export const GetCurrentUserUsecase = { run };
