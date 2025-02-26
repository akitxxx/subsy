import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { z } from 'zod';

export const createOrUpdateSubscriptionInputSchema = z.object({
  name: z.string(),
  price: z.string(),
  currency: z.nativeEnum(CurrencyEnum),
  cycle: z.nativeEnum(SubscriptionCycleEnum),
  startedAt: z.coerce.date(),
  cancelledAt: z.coerce.date().nullable(),
  description: z.string().nullable(),
});
export type CreateOrUpdateSubscriptionInput = z.infer<typeof createOrUpdateSubscriptionInputSchema>;
