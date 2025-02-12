import type { SubscriptionEntity } from '@/app/api/_shared/domain/subscription/subscription.entity';
import type { SubscriptionRepository } from '@/app/api/_shared/domain/subscription/subscription.repository';
import type { DrizzleClient } from '@/lib/db/drizzle';

type Inject = {
  db: DrizzleClient;
  subscriptionRepository: SubscriptionRepository;
};

type Input = {
  userId: string;
};

type Output = {
  subscriptions: SubscriptionEntity[];
};

const run = ({ subscriptionRepository }: Inject) => {
  return async (p: Input): Promise<Output> => {
    const subscriptions = await subscriptionRepository.findManyInUse({ userId: p.userId });
    return { subscriptions };
  };
};

export const GetSubscriptionsUsecase = { run };
