export const SubscriptionStatusEnum = {
  Active: 'Active', // 自動更新ON
  Cancelled: 'Cancelled', // 自動更新OFFだがまだ利用中
  Expired: 'Expired', // 期限切れして利用終了
} as const;
export type SubscriptionStatusEnum = (typeof SubscriptionStatusEnum)[keyof typeof SubscriptionStatusEnum];
