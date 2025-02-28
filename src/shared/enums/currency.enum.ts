export const CurrencyEnum = {
  Jpy: 'Jpy',
  Usd: 'Usd',
} as const;
export type CurrencyEnum = (typeof CurrencyEnum)[keyof typeof CurrencyEnum];
