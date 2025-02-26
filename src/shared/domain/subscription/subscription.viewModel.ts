import { subscriptionModelBaseSchema } from '@/api/shared/domain/subscription/subscription.entity';
import { SubscriptionStatusEnum } from '@/shared/enums/subscription/subscriptionStatus.enum';
import { z } from 'zod';

// ViewModel
export const subscriptionViewModelSchema = subscriptionModelBaseSchema.extend({
  status: z.nativeEnum(SubscriptionStatusEnum),
  nextPaymentAt: z.coerce.date(),
  isInUse: z.boolean(),
  isCancelled: z.boolean(),
  isExpired: z.boolean(),
});

export type SubscriptionViewModel = z.infer<typeof subscriptionViewModelSchema>;

// ForCreateModel
const subscriptionCreateModelSchema = subscriptionModelBaseSchema.pick({
  name: true,
  price: true,
  currency: true,
  cycle: true,
  startedAt: true,
  cancelledAt: true,
  description: true,
});
export type SubscriptionCreateModel = z.infer<typeof subscriptionCreateModelSchema>;
