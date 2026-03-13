import { match } from 'ts-pattern';

export const CurrencyEnum = {
  Jpy: 'Jpy',
  Usd: 'Usd',
} as const;
export type CurrencyEnum = (typeof CurrencyEnum)[keyof typeof CurrencyEnum];

export const getCurrentPrefix = (currency: CurrencyEnum): string =>
  match(currency)
    .with(CurrencyEnum.Jpy, () => '¥')
    .with(CurrencyEnum.Usd, () => '$')
    .exhaustive();
