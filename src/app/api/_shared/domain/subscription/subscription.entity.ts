import { randomUUID } from 'node:crypto';
import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from '@/enums/subscription/subscriptionStatus.enum';
import type { InsertSubscription, SelectSubscription } from '@/lib/db/schema';
import { z } from 'zod';

// Base
export const subscriptionModelBaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  price: z.string(),
  cycle: z.nativeEnum(SubscriptionCycleEnum),
  startedAt: z.coerce.date(),
  cancelledAt: z.coerce.date().nullable(),
  expiredAt: z.coerce.date(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
}) satisfies z.ZodType<SelectSubscription>;

// Entity
export type SubscriptionEntity = z.infer<typeof subscriptionModelBaseSchema>;

// Model
export const subscriptionModelSchema = subscriptionModelBaseSchema.extend({
  status: z.nativeEnum(SubscriptionStatusEnum),
  isInUse: z.boolean(),
  isCancelled: z.boolean(),
  isExpired: z.boolean(),
});

export type SubscriptionModel = z.infer<typeof subscriptionModelSchema>;
