import type { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';
import { User } from './user.logic';
import type { UserRepository } from './user.repository';

type Inject = {
  userRepository: UserRepository;
};

type Input = {
  nickname: string;
  provider: ProviderEnum;
  providerId: string;
};

const run =
  ({ userRepository }: Inject) =>
  async (input: Input) => {
    const newUser = User.newUser({
      nickname: input.nickname,
      userAuth: { provider: input.provider, providerId: input.providerId },
    });

    await userRepository.create({ entity: newUser });
  };

export const CreateUserDomainService = { run };
