import type { WebhookEvent, messagingApi } from '@line/bot-sdk';

/**
 * LINEサービスの型定義
 */

/**
 * LINEサービスの設定オプション
 */
export interface LineClientOptions {
  channelAccessToken?: string;
  channelSecret?: string;
}

/**
 * LINEメッセージの応答型
 */
export type LineMessageResponse = messagingApi.PushMessageResponse | messagingApi.ReplyMessageResponse;

/**
 * LINE Webhookペイロード型
 */
export type LineWebhookPayload = {
  destination: string;
  events: WebhookEvent[];
};

/**
 * メッセージ送信のパラメータ型
 */
export interface SendMessageParams {
  userId: string;
  message: string | string[];
}

/**
 * メッセージの返信パラメータ型
 */
export interface ReplyMessageParams {
  replyToken: string;
  message: string | string[];
}
