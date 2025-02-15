export const CurrencyEnum = {
  JPY: 'JPY',
  USD: 'USD',
} as const;
export type CurrencyEnum = (typeof CurrencyEnum)[keyof typeof CurrencyEnum];
