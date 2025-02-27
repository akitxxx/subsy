/**
 * 通貨変換ユーティリティ
 *
 * このモジュールでは通貨の変換と為替レートの取得のためのAPIを提供します。
 */

import { CurrencyEnum } from '@/shared/enums/currency.enum';

/**
 * 為替レートを取得する
 * 
 * @param from - 変換元の通貨
 * @param to - 変換先の通貨
 * @returns 為替レート
 */
const getExchangeRate = async (from: CurrencyEnum, to: CurrencyEnum): Promise<number> => {
  try {
    // 同じ通貨の場合は1を返す
    if (from === to) return 1;

    const response = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
    
    if (!response.ok) {
      console.error('為替レートの取得に失敗しました', response.statusText);
      // 失敗した場合のフォールバック値（USD to JPY）
      return from === CurrencyEnum.USD && to === CurrencyEnum.JPY ? 150 : 1;
    }

    const data = await response.json();
    return data.rates[to];
  } catch (error) {
    console.error('為替レートの取得中にエラーが発生しました', error);
    // エラー時のフォールバック値（USD to JPY）
    return from === CurrencyEnum.USD && to === CurrencyEnum.JPY ? 150 : 1;
  }
};

/**
 * USDからJPYに変換する
 * 
 * @param usdAmount - USD金額（セント単位）
 * @returns JPY金額
 */
const convertUsdToJpy = async (usdAmount: number): Promise<number> => {
  const rate = await getExchangeRate(CurrencyEnum.USD, CurrencyEnum.JPY);
  // USDはセント単位で保存されているため、100で割って変換する
  return Math.floor((usdAmount / 100) * rate);
};

export const CurrencyUtils = {
  getExchangeRate,
  convertUsdToJpy,
};
