export const SubscriptionStatusEnum = {
  Active: 'Active',
  Canceled: 'Canceled',
  Expired: 'Expired',
} as const;
export type SubscriptionStatusEnum = (typeof SubscriptionStatusEnum)[keyof typeof SubscriptionStatusEnum];
