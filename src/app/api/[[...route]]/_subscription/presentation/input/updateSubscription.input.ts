import type { z } from 'zod';
import { createSubscriptionInputSchema } from './createSubscription.input';

export const updateSubscriptionInputSchema = createSubscriptionInputSchema;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionInputSchema>;
