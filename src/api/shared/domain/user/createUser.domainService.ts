import type { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';
import type { UserEntity } from './user.entity';
import { User } from './user.logic';
import type { UserRepository } from './user.repository';

type Inject = {
  userRepository: UserRepository;
};

type Input = {
  provider: ProviderEnum;
  providerId: string;
};

const run =
  ({ userRepository }: Inject) =>
  async (input: Input): Promise<UserEntity> => {
    const newUser = User.newUser({
      userAuth: { provider: input.provider, providerId: input.providerId },
    });

    return await userRepository.create({ entity: newUser });
  };

export const CreateUserDomainService = { run };
