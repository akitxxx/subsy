export const SubscriptionCycleEnum = {
  OneMonth: 'OneMonth',
  ThreeMonths: 'ThreeMonths',
  SixMonths: 'SixMonths',
  OneYear: 'OneYear',
} as const;
export type SubscriptionCycleEnum = (typeof SubscriptionCycleEnum)[keyof typeof SubscriptionCycleEnum];
