import type { SubscriptionEntity } from '@/app/api/_shared/domain/subscription/subscription.entity';
import { Subscription } from '@/app/api/_shared/domain/subscription/subscription.logic';

export const parseSubscriptionViewModel = (entity: SubscriptionEntity) => {
  return {
    ...entity,
    status: Subscription.getStatus(entity),
    isInUse: Subscription.getIsInUse(entity),
    isCancelled: Subscription.getIsCancelled(entity),
    isExpired: Subscription.getIsExpired(entity),
  };
};

export const parseSubscriptionsViewModel = (entities: SubscriptionEntity[]) => {
  return entities.map(parseSubscriptionViewModel);
};
