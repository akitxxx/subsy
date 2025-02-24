/**
 * サブスクリプション関連のユーティリティ関数
 */

import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';

/**
 * サブスクリプションサイクルを人間が読みやすい日本語表記に変換する
 * @param cycle サブスクリプションサイクル値
 * @returns 日本語表記されたサイクル文字列
 */
export const formatCycle = (cycle: string): string => {
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
};
