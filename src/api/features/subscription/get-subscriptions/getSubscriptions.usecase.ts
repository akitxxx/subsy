import type { SubscriptionEntity } from '@/api/shared/domain/subscription';
import type { SubscriptionRepository } from '@/api/shared/domain/subscription';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import { DateUtils } from '@/shared/utils/date.util';

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
    const now = DateUtils.create.now();
    const subscriptions = await subscriptionRepository.findManyInUse({ userId: p.userId, now });
    return { subscriptions };
  };
};

export const GetSubscriptionsUsecase = { run };
