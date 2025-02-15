import { CurrencyEnum } from '@/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import type { SelectSubscription } from '@/lib/db/schema';
import { z } from 'zod';

// BaseSchema
export const subscriptionModelBaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  price: z.string(),
  currency: z.nativeEnum(CurrencyEnum),
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
