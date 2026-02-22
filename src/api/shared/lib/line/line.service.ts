import { validateSignature as lineValidateSignature, messagingApi, type TextMessage } from '@line/bot-sdk';
import type { LineClientOptions, ReplyMessageParams, SendMessageParams } from './line.types';

/**
 * LINE Messaging APIクライアントを作成する
 */
const _createMessagingApiClient = (options?: LineClientOptions): messagingApi.MessagingApiClient => {
  return new messagingApi.MessagingApiClient({
    channelAccessToken: options?.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  });
};

/**
 * テキストメッセージを構築する
 */
const _createTextMessages = (messages: string | string[]): TextMessage[] => {
  if (typeof messages === 'string') {
    return [{ type: 'text', text: messages }];
  }
  return messages.map((text) => ({ type: 'text', text }));
};

/**
 * ユーザーにメッセージを送信する
 * @param params 送信パラメータ
 * @param options クライアントオプション（指定しない場合は環境変数を使用）
 * @returns LINEからのレスポンス
 */
const sendMessage =
  (client: messagingApi.MessagingApiClient) =>
  async (params: SendMessageParams, _options?: LineClientOptions): Promise<messagingApi.PushMessageResponse> => {
    try {
      const messages = _createTextMessages(params.message);
      return await client.pushMessage({
        to: params.userId,
        messages: messages,
      });
    } catch (error) {
      console.error('LINEメッセージ送信エラー:', error);
      throw error;
    }
  };

/**
 * メッセージに返信する
 * @param params 返信パラメータ
 * @param options クライアントオプション（指定しない場合は環境変数を使用）
 * @returns LINEからのレスポンス
 */
const replyMessage =
  (client: messagingApi.MessagingApiClient) =>
  async (params: ReplyMessageParams, _options?: LineClientOptions): Promise<messagingApi.ReplyMessageResponse> => {
    try {
      const messages = _createTextMessages(params.message);
      return await client.replyMessage({
        replyToken: params.replyToken,
        messages: messages,
      });
    } catch (error) {
      console.error('LINE返信エラー:', error);
      throw error;
    }
  };

/**
 * Webhookイベントのシグネチャを検証する
 * @param signature リクエストヘッダーのx-line-signature
 * @param body リクエストボディ
 * @param channelSecret チャンネルシークレット（指定しない場合は環境変数を使用）
 * @returns 検証結果
 */
const validateSignature = (signature: string | undefined, body: string, channelSecret?: string): boolean => {
  if (!signature) return false;
  try {
    const secret = channelSecret || process.env.LINE_CHANNEL_SECRET || '';
    return lineValidateSignature(body, secret, signature);
  } catch (error) {
    console.error('LINEシグネチャ検証エラー:', error);
    return false;
  }
};

// ==========

/**
 * LINE サービス
 * LINE Messaging API を使用するための関数群
 */
export const LineService = {
  new: () => {
    const client = _createMessagingApiClient();

    return {
      sendMessage: sendMessage(client),
      replyMessage: replyMessage(client),
      validateSignature,
    };
  },
};
export type LineService = ReturnType<typeof LineService.new>;
