import type { SubscriptionRepository } from '@/api/shared/domain/subscription';
import type { SessionUser } from '@/api/shared/types/sessionUser';

type Inject = {
  sessionUser: SessionUser;
  subscriptionRepository: SubscriptionRepository;
};

type Input = {
  subscriptionId: string;
};

const run =
  ({ sessionUser, subscriptionRepository }: Inject) =>
  async ({ subscriptionId }: Input) => {
    await subscriptionRepository.delete({ id: subscriptionId, userId: sessionUser.id });
  };

export const DeleteSubscriptionUsecase = { run };
