import { randomUUID } from 'node:crypto';
import { SubscriptionStatusEnum } from '@/enums/subscription/subscriptionStatus.enum';
import type { SelectSubscription } from '@/lib/db/schema';
import { type SubscriptionEntity, subscriptionModelBaseSchema } from './subscription.entity';

const getStatus = (e: SubscriptionEntity) => {
  if (getIsExpired(e)) return SubscriptionStatusEnum.Expired;
  if (getIsCancelled(e)) return SubscriptionStatusEnum.Cancelled;
  return SubscriptionStatusEnum.Active;
};

const getIsInUse = (e: SubscriptionEntity) => (now: Date) => {
  return !getIsExpired(e)(now);
};

const getIsCancelled = (e: SubscriptionEntity) => {
  return e.cancelledAt !== null;
};

const getIsExpired = (e: SubscriptionEntity) => (now: Date) => {
  return e.expiredAt < now;
};

type SubscriptionCreateProps = Pick<
  SubscriptionEntity,
  'userId' | 'name' | 'price' | 'currency' | 'cycle' | 'startedAt' | 'cancelledAt' | 'expiredAt' | 'description'
>;
const create = (p: SubscriptionCreateProps): SubscriptionEntity => {
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

const update =
  (e: SubscriptionEntity) =>
  (props: Partial<SubscriptionEntity>): SubscriptionEntity => {
    return { ...e, ...props };
  };

const parseEntity = (data: SelectSubscription) => {
  return subscriptionModelBaseSchema.parse(data);
};

export const Subscription = {
  getStatus,
  getIsInUse,
  getIsCancelled,
  getIsExpired,
  create,
  update,
  parseEntity,
};
