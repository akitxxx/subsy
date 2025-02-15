import { randomUUID } from 'node:crypto';
import { SubscriptionStatusEnum } from '@/enums/subscription/subscriptionStatus.enum';
import type { SelectSubscription } from '@/lib/db/schema';
import { type SubscriptionEntity, subscriptionModelBaseSchema } from './subscription.entity';

const getStatus = (model: SubscriptionEntity) => {
  if (getIsExpired(model)) return SubscriptionStatusEnum.Expired;
  if (getIsCancelled(model)) return SubscriptionStatusEnum.Cancelled;
  return SubscriptionStatusEnum.Active;
};

const getIsInUse = (model: SubscriptionEntity) => (now: Date) => {
  return !getIsExpired(model)(now);
};

const getIsCancelled = (model: SubscriptionEntity) => {
  return model.cancelledAt !== null;
};

const getIsExpired = (model: SubscriptionEntity) => (now: Date) => {
  return model.expiredAt < now;
};

type SubscriptionCreateProps = Pick<
  SubscriptionEntity,
  'userId' | 'name' | 'price' | 'currency' | 'cycle' | 'startedAt' | 'cancelledAt' | 'expiredAt' | 'description'
>;
const newSubscription = (p: SubscriptionCreateProps): SubscriptionEntity => {
  const now = new Date();
  return {
    id: randomUUID(),
    userId: p.userId,
    name: p.name,
    price: p.price,
    currency: p.currency,
    cycle: p.cycle,
    startedAt: p.startedAt,
    cancelledAt: p.cancelledAt ?? null,
    expiredAt: p.expiredAt,
    description: p.description ?? null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};

const parseEntity = (data: SelectSubscription) => {
  return subscriptionModelBaseSchema.parse(data);
};

export const Subscription = {
  getStatus,
  getIsInUse,
  getIsCancelled,
  getIsExpired,
  newSubscription,
  parseEntity,
};
