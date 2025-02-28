import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import { openAiService } from '@/api/shared/lib/openai';
import type { DeleteSubscriptionFunctionArgs } from '@/api/shared/lib/openai';

type Inject = {
  db: DrizzleClient;
  payload: LineWebhookPayload;
};

type Output = {
  success: boolean;
};

/**
 * LINE Webhookを処理するユースケース
 */
const run =
  ({ db, payload }: Inject) =>
  async (): Promise<Output> => {
    // ペイロードのバリデーション
    if (!payload || !payload.events || !Array.isArray(payload.events)) {
      console.error('無効なLINE Webhookペイロード', payload);
      return { success: false };
    }

    // イベントごとに処理
    for (const event of payload.events) {
      try {
        // メッセージイベントだけを処理
        if (event.type === 'message' && 'message' in event && event.message.type === 'text') {
          await handleMessageEvent(db, event);
        }
      } catch (error) {
        console.error('LINE Webhookイベント処理エラー:', error);
      }
    }

    return { success: true };
  };

/**
 * メッセージイベントを処理する
 */
const handleMessageEvent = async (db: DrizzleClient, event: LineMessageEvent) => {
  const userId = event.source.userId;
  if (!userId) return;

  const messageText = event.message.text;
  if (!messageText) return;

  try {
    // OpenAI APIでメッセージをパースし、適切な操作を決定
    const result = await openAiService.parseSubscriptionIntent(messageText);

    if (result.functionCall) {
      const { name, args } = result.functionCall;

      // 各関数に応じた処理を実行
      switch (name) {
        case 'createSubscription': {
          // 本番環境では実際にDBにサブスクリプションを作成する処理を実装
          console.log('サブスクリプション作成:', args);
          // TODO: 実際のサブスクリプション作成処理を実装
          break;
        }

        case 'getSubscriptions': {
          // 本番環境では実際にDBからサブスクリプションを取得する処理を実装
          console.log('サブスクリプション取得');
          // TODO: 実際のサブスクリプション取得処理を実装
          break;
        }

        case 'updateSubscription': {
          // 本番環境では実際にDBのサブスクリプションを更新する処理を実装
          console.log('サブスクリプション更新:', args);
          // TODO: 実際のサブスクリプション更新処理を実装
          break;
        }

        case 'deleteSubscription': {
          // 本番環境では実際にDBからサブスクリプションを削除する処理を実装
          const deleteArgs = args as DeleteSubscriptionFunctionArgs;
          console.log('サブスクリプション削除:', deleteArgs.id);
          // TODO: 実際のサブスクリプション削除処理を実装
          break;
        }
      }
    }
  } catch (error) {
    console.error('OpenAI API呼び出しエラー:', error);
  }
};

export const LineWebhookUsecase = { run };

// ==========

// LINE Webhookのイベントタイプ定義
interface LineEventBase {
  type: string;
  timestamp: number;
  source: {
    type: string;
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  replyToken?: string;
  mode: string;
}

// LINE メッセージイベント
interface LineMessageEvent extends LineEventBase {
  type: 'message';
  message: {
    id: string;
    type: string;
    text?: string;
  };
}

// その他の具体的なイベントタイプは必要に応じて追加

// LINE Webhookのイベント型
type LineEvent = LineMessageEvent | LineEventBase;

// LINE Webhookのペイロード型
type LineWebhookPayload = {
  destination: string;
  events: LineEvent[];
};
