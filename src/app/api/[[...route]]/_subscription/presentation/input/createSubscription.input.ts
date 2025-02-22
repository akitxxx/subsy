import { CurrencyEnum } from '@/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import { z } from 'zod';

export const createSubscriptionInputSchema = z.object({
  name: z.string(),
  price: z.string(),
  currency: z.nativeEnum(CurrencyEnum),
  cycle: z.nativeEnum(SubscriptionCycleEnum),
  startedAt: z.coerce.date(),
  cancelledAt: z.coerce.date().nullable(),
  description: z.string().nullable(),
});
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionInputSchema>;
