/**
 * 金額操作ユーティリティ
 *
 * このモジュールでは通貨に応じた金額表示と変換のためのAPIを提供します。
 */

import { CurrencyEnum } from '@/shared/enums/currency.enum';

/**
 * 通貨ごとの表示フォーマット
 */
const formatters = {
  /**
   * 日本円のフォーマット
   */
  formatJPY: (numericValue: number): string => {
    return numericValue.toLocaleString('ja-JP');
  },

  /**
   * 米ドルのフォーマット
   */
  formatUSD: (numericValue: number): string => {
    const dollars = Math.floor(numericValue / 100);
    const cents = numericValue % 100;
    const paddedCents = cents.toString().padStart(2, '0');
    return `${dollars.toLocaleString('en-US')}.${paddedCents}`;
  },
};

/**
 * 表示
 */
const display = {
  /**
   * 金額を表示用にフォーマット
   */
  format: (price: string, currency: CurrencyEnum): string => {
    if (!price) return '';
    const numericValue = Number(price);
    if (Number.isNaN(numericValue)) return price;

    if (currency === CurrencyEnum.Jpy) {
      return formatters.formatJPY(numericValue);
    }

    // USDの場合（セントからドルに変換して表示）
    return formatters.formatUSD(numericValue);
  },
};

/**
 * 入力処理
 */
const input = {
  /**
   * 入力値を数値のみに変換
   */
  parse: (input: string, currency: CurrencyEnum): string => {
    const unformatted = input.replace(/,/g, '');
    return unformatted.replace(/\D/g, '');
  },

  /**
   * 通貨変更時の金額変換処理
   */
  handleCurrencyChange: (currentPrice: string, newCurrency: CurrencyEnum, oldCurrency: CurrencyEnum): string => {
    if (!currentPrice) return '';

    if (newCurrency === CurrencyEnum.Jpy && oldCurrency === CurrencyEnum.Usd) {
      // USDからJPYへの変換（セントからの変換）
      return Math.floor(Number(currentPrice) / 100).toString();
    }

    if (newCurrency === CurrencyEnum.Usd && oldCurrency === CurrencyEnum.Jpy) {
      // JPYからUSDへの変換（セントに変換）
      return (Number(currentPrice) * 100).toString();
    }

    return currentPrice;
  },

  /**
   * USD入力の特殊処理（小数点対応）
   */
  handleUsdPriceInput: (rawValue: string): string => {
    // カンマと通貨記号を除去
    const cleaned = rawValue.replace(/[$,]/g, '');

    // 空入力の場合
    if (!cleaned) return '';

    // 数値とドット以外を除去
    const validInput = cleaned.replace(/[^\d.]/g, '');
    const parts = validInput.split('.');

    // ドル部分を処理
    const dollars = parts[0] ? Number.parseInt(parts[0], 10) : 0;

    // セント部分を処理
    let cents = 0;
    if (parts.length > 1 && parts[1]) {
      cents = Number.parseInt(`${parts[1]}00`.slice(0, 2), 10);
    }

    return (dollars * 100 + cents).toString();
  },
};

/**
 * 通貨変換
 */
const conversion = {
  /**
   * USDからJPYへの変換
   */
  usdToJpy: (usdAmount: number): number => {
    // 簡易的な変換レート: 1ドル = 150円
    return usdAmount * 150;
  },

  /**
   * JPYからUSDへの変換
   */
  jpyToUsd: (jpyAmount: number): number => {
    // 簡易的な変換レート: 150円 = 1ドル
    return jpyAmount / 150;
  },
};

// 公開API
export const PriceUtils = {
  display,
  input,
  conversion,
};
