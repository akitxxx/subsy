import type { SubscriptionEntity } from '@/app/api/_shared/domain/subscription/subscription.entity';
import type { SubscriptionRepository } from '@/app/api/_shared/domain/subscription/subscription.repository';
import { DateUtils } from '@/lib/date.util';
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
    const now = DateUtils.getNow();
    const subscriptions = await subscriptionRepository.findManyInUse({ userId: p.userId, now });
    return { subscriptions };
  };
};

export const GetSubscriptionsUsecase = { run };
