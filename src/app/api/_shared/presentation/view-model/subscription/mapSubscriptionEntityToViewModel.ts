import type { SubscriptionEntity } from '@/app/api/_shared/domain/subscription/subscription.entity';
import { Subscription } from '@/app/api/_shared/domain/subscription/subscription.logic';
import type { SubscriptionViewModel } from '@/domain/subscription/subscription.viewModel';

export const mapSubscriptionEntityToViewModel = (entity: SubscriptionEntity): SubscriptionViewModel => {
  const now = new Date();
  return {
    ...entity,
    status: Subscription.getStatus(entity),
    nextPaymentAt: Subscription.getNextPaymentAt(entity),
    isInUse: Subscription.getIsInUse(entity)(now),
    isCancelled: Subscription.getIsCancelled(entity),
    isExpired: Subscription.getIsExpired(entity)(now),
  };
};

export const mapSubscriptionEntitiesToViewModels = (entities: SubscriptionEntity[]): SubscriptionViewModel[] => {
  return entities.map(mapSubscriptionEntityToViewModel);
};
