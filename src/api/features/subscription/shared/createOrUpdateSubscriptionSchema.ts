import { subscriptionInputSchema } from '@/shared/domain/subscription/subscription.validation';

export const createOrUpdateSubscriptionInputSchema = subscriptionInputSchema;
export type CreateOrUpdateSubscriptionInput = import('@/shared/domain/subscription/subscription.validation').SubscriptionInput;
