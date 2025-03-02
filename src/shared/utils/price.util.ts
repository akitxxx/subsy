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

  /**
   * APIから最新の為替レートを取得
   *
   * FrankfurterAPIを使用
   * @see https://www.frankfurter.app/
   */
  fetchLatestRate: async (): Promise<{ [key: string]: number } | null> => {
    try {
      // FrankfurterAPIは無料で制限なしで使用可能
      const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=JPY');
      const data = await response.json();

      return data.rates;
    } catch (error) {
      console.error('為替レート取得エラー:', error);
      return null;
    }
  },

  /**
   * APIを使って最新のレートでUSDからJPYへ変換
   */
  usdToJpyWithLiveRate: async (usdAmount: number): Promise<number> => {
    try {
      const rates = await conversion.rateCache.getRates();

      if (rates?.JPY) {
        return usdAmount * rates.JPY;
      }

      // APIが失敗した場合はフォールバック
      return conversion.usdToJpy(usdAmount);
    } catch (error) {
      console.error('為替換算エラー:', error);
      // 例外発生時はフォールバック
      return conversion.usdToJpy(usdAmount);
    }
  },

  /**
   * APIを使って最新のレートでJPYからUSDへ変換
   */
  jpyToUsdWithLiveRate: async (jpyAmount: number): Promise<number> => {
    try {
      const rates = await conversion.rateCache.getRates();

      if (rates?.JPY) {
        return jpyAmount / rates.JPY;
      }

      // APIが失敗した場合はフォールバック
      return conversion.jpyToUsd(jpyAmount);
    } catch (error) {
      console.error('為替換算エラー:', error);
      // 例外発生時はフォールバック
      return conversion.jpyToUsd(jpyAmount);
    }
  },

  /**
   * 為替レートをキャッシュするためのオブジェクト
   */
  rateCache: {
    rates: null as { [key: string]: number } | null,
    timestamp: 0,
    // キャッシュの有効期限（1時間）
    expirationTime: 60 * 60 * 1000,

    /**
     * キャッシュされたレートを取得（期限切れの場合は更新）
     */
    async getRates(): Promise<{ [key: string]: number } | null> {
      const now = Date.now();

      // キャッシュが期限切れまたは未設定の場合、更新
      if (!this.rates || now - this.timestamp > this.expirationTime) {
        this.rates = await conversion.fetchLatestRate();
        this.timestamp = now;
      }

      return this.rates;
    },
  },
};

// 公開API
export const PriceUtils = {
  display,
  input,
  conversion,
};
