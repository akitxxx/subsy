import type { SubscriptionEntity } from '@/api/shared/domain/subscription';
import { Subscription } from '@/api/shared/domain/subscription';
import type { SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import { DateUtils } from '@/shared/utils/date.util';

export const mapSubscriptionEntityToViewModel = (entity: SubscriptionEntity): SubscriptionViewModel => {
  const now = DateUtils.create.now();
  return {
    ...entity,
    status: Subscription.getStatus(entity),
    nextPaymentAt: Subscription.getNextPaymentAt(entity)(now),
    isInUse: Subscription.getIsInUse(entity)(now),
    isCancelled: Subscription.getIsCancelled(entity),
    isExpired: Subscription.getIsExpired(entity)(now),
  };
};

export const mapSubscriptionEntitiesToViewModels = (entities: SubscriptionEntity[]): SubscriptionViewModel[] => {
  return entities.map(mapSubscriptionEntityToViewModel);
};
