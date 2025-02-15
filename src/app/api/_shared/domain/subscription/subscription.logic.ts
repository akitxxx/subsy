import { randomUUID } from 'node:crypto';
import { SubscriptionStatusEnum } from '@/enums/subscription/subscriptionStatus.enum';
import type { SubscriptionModel } from './subscription.entity';

const getIsInUse = (model: SubscriptionModel) => {
  return status === SubscriptionStatusEnum.Active;
};

const getIsCancelled = (status: SubscriptionStatusEnum) => {
  return status === SubscriptionStatusEnum.Cancelled;
};

type SubscriptionCreateProps = Pick<
  SubscriptionModel,
  'userId' | 'name' | 'price' | 'cycle' | 'startedAt' | 'cancelledAt' | 'expiredAt' | 'description'
>;
const newSubscription = (p: SubscriptionCreateProps): SubscriptionModel => {
  const now = new Date();
  return {
    id: randomUUID(),
    userId: p.userId,
    name: p.name,
    price: p.price,
    cycle: p.cycle,
    startedAt: p.startedAt,
    cancelledAt: p.cancelledAt ?? null,
    expiredAt: p.expiredAt,
    description: p.description ?? null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    status: SubscriptionStatusEnum.Active,
    isInUse: true,
    isCancelled: false,
    isExpired: false,
  };
};

export const Subscription = {
  newSubscription,
};
