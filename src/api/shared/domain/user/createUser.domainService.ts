import { Effect } from 'effect';
import type { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';
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
  async (input: Input) => {
    const newUser = User.newUser({
      userAuth: { provider: input.provider, providerId: input.providerId },
    });

    await Effect.runPromise(userRepository.create({ entity: newUser }));
  };

export const CreateUserDomainService = { run };
