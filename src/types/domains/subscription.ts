import { z } from 'zod';
import { SubscriptionCycleEnum } from './../enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from './../enums/subscription/subscriptionStatus.enum';

// Base
const subscriptionBaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.nativeEnum(SubscriptionStatusEnum),
  name: z.string(),
  price: z.string(),
  cycle: z.nativeEnum(SubscriptionCycleEnum),
  startedAt: z.coerce.date(),
  cancelledAt: z.coerce.date().nullable(),
  expiredAt: z.coerce.date(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const activeSubscriptionSchema = subscriptionBaseSchema.extend({
  status: z.literal(SubscriptionStatusEnum.Active),
});

export type Subscription = z.infer<typeof subscriptionBaseSchema>;

// CreateProps
const subscriptionCreatePropsSchema = subscriptionBaseSchema.pick({
  name: true,
  price: true,
  cycle: true,
  startedAt: true,
  cancelledAt: true,
  expiredAt: true,
  description: true,
});
export type SubscriptionCreateProps = z.infer<typeof subscriptionCreatePropsSchema>;
