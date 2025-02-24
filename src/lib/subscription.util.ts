/**
 * サブスクリプション操作ユーティリティ
 *
 * このモジュールではサブスクリプション関連の操作と表示のためのAPIを提供します。
 */

import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';

/**
 * 表示
 */
const display = {
  /**
   * サブスクリプションサイクルを人間が読みやすい日本語表記に変換する
   * @param cycle サブスクリプションサイクル値
   * @returns 日本語表記されたサイクル文字列
   */
  formatCycle: (cycle: string): string => {
    switch (cycle) {
      case SubscriptionCycleEnum.OneMonth:
        return '1ヶ月';
      case SubscriptionCycleEnum.ThreeMonths:
        return '3ヶ月';
      case SubscriptionCycleEnum.SixMonths:
        return '6ヶ月';
      case SubscriptionCycleEnum.OneYear:
        return '1年';
      default:
        return cycle; // 未知の値はそのまま返す
    }
  },
};

/**
 * 計算
 */
const calculate = {
  /**
   * サイクルに基づいた月数を取得する
   * @param cycle サブスクリプションサイクル値
   * @returns 月数
   */
  getMonthsFromCycle: (cycle: SubscriptionCycleEnum): number => {
    switch (cycle) {
      case SubscriptionCycleEnum.OneMonth:
        return 1;
      case SubscriptionCycleEnum.ThreeMonths:
        return 3;
      case SubscriptionCycleEnum.SixMonths:
        return 6;
      case SubscriptionCycleEnum.OneYear:
        return 12;
      default:
        return 0;
    }
  },
};

// 公開API
export const SubscriptionUtils = {
  display,
  calculate,
};
