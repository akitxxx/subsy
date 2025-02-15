export const CurrencyEnum = {
  JPY: 'JPY',
  USD: 'USD',
} as const;
export type Currency = (typeof CurrencyEnum)[keyof typeof CurrencyEnum];
