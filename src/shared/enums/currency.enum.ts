export const CurrencyEnum = {
  Jpy: 'Jpy',
  Usd: 'Usd',
} as const;
export type CurrencyEnum = (typeof CurrencyEnum)[keyof typeof CurrencyEnum];

export const getCurrentPrefix = (currency: CurrencyEnum): string => {
  switch (currency) {
    case CurrencyEnum.Jpy:
      return '¥';
    case CurrencyEnum.Usd:
      return '$';
  }
};
