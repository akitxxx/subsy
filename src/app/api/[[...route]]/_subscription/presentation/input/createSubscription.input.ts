import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from '@/enums/subscription/subscriptionStatus.enum';
import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  name: z.string(),
  price: z.string(),
  cycle: z.nativeEnum(SubscriptionCycleEnum),
  startedAt: z.coerce.date(),
  expiredAt: z.coerce.date(),
  description: z.string().optional(),
  status: z.nativeEnum(SubscriptionStatusEnum),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
