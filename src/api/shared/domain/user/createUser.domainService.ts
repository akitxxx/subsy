import { Effect } from 'effect';
import type { InternalServerError } from '@/api/shared/error/errors';
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
  (input: Input): Effect.Effect<{ id: string }, InternalServerError> => {
    const newUser = User.newUser({
      userAuth: { provider: input.provider, providerId: input.providerId },
    });

    return Effect.map(userRepository.create({ entity: newUser }), () => ({ id: newUser.id }));
  };

export const CreateUserDomainService = { run };
