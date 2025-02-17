import { z } from 'zod';
import { createSubscriptionInputSchema } from './createSubscription.input';

const { expiredAt, ...rest } = createSubscriptionInputSchema.shape;
export const updateSubscriptionInputSchema = z.object(rest);
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionInputSchema>;
