import type { SubscriptionRepository } from '@/api/shared/domain/subscription/subscription.repository';
import type { UserRepository } from '@/api/shared/domain/user/user.repository';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { LineService } from '@/api/shared/lib/line';
import type { OpenAIService } from '@/api/shared/lib/openai';
import type { MessageEvent, TextMessage, WebhookEvent } from '@line/bot-sdk';
import { executeFunctionByName } from './executionFunctionByName.workflow';

type Inject = {
  db: DrizzleClient;
  userRepository: UserRepository;
  subscriptionRepository: SubscriptionRepository;
  lineService: LineService;
  openAiService: OpenAIService;
};

type Input = {
  payload: LineWebhookPayload;
};

type Output = {
  success: boolean;
};

/**
 * LINE Webhookを処理するユースケース
 */
const run =
  (inject: Inject) =>
  async ({ payload }: Input): Promise<Output> => {
    console.dir({ 'LineWebhookUsecase.run': payload }, { depth: null });

    // ペイロードのバリデーション
    if (!payload || !payload.events || !Array.isArray(payload.events)) {
      console.error('無効なLINE Webhookペイロード', payload);
      return { success: false };
    }

    // イベントごとに処理
    for (const event of payload.events) {
      try {
        // メッセージイベントだけを処理
        if (!('message' in event && event.message.type === 'text')) return { success: false };

        await handleMessageEvent({ inject, event: event as MessageEvent });
      } catch (error) {
        console.error('LINE Webhookイベント処理エラー:', error);
      }
    }

    return { success: true };
  };

// ==========

const sendMessage = async (lineService: LineService, event: MessageEvent, message: string) => {
  if (!message || !event.replyToken) {
    console.error('not found message or replyToken', { message, event });
    return;
  }
  await lineService.replyMessage({ replyToken: event.replyToken, message });
};

/**
 * メッセージイベントを処理する
 */
const handleMessageEvent = async ({
  inject: { db, lineService, openAiService, userRepository, subscriptionRepository },
  event,
}: { inject: Inject; event: MessageEvent }) => {
  try {
    // 基本的な検証
    const validationResult = validateMessageEvent(event);
    if (!validationResult) {
      console.log('メッセージの検証に失敗しました', { event, validationResult });
      return;
    }

    const { userId: lineUserId, messageText } = validationResult;

    // userレコード取得
    const user = await userRepository.findByLineUserId({ lineUserId });
    if (!user) {
      // TODO: signup
      return;
    }

    // サブスクリプション一覧取得
    const subscriptions = await subscriptionRepository.findManyByUserId({ userId: user.id });

    // OpenAI APIでメッセージをパース
    const result = await openAiService.parseSubscriptionIntent({ userMessage: messageText, subscriptions });

    // 対応する機能がなかった場合はメッセージを返す
    if (!result.functionCall) {
      await sendMessage(lineService, event, 'サブスクリプションに関する操作を指定してください。');
      return;
    }

    // 機能に応じた処理を実行して返信メッセージを取得
    const responseMessage = await executeFunctionByName(db, result.functionCall);

    // 結果をLINEで返信
    await sendMessage(lineService, event, responseMessage);
  } catch (error) {
    console.error('OpenAI API呼び出しエラー:', error);
    await handleError(lineService, event);
  }
};

/**
 * メッセージイベントのバリデーション
 */
const validateMessageEvent = (event: MessageEvent): { isValid: boolean; userId: string; messageText: string } | null => {
  // ユーザーID取得
  const userId = event.source.userId;
  if (!userId) return null;

  // テキストメッセージのみ処理
  if (event.message.type !== 'text') return null;

  const messageText = (event.message as TextMessage).text;
  if (!messageText) return null;

  return { isValid: true, userId, messageText };
};

/**
 * エラーハンドリング
 */
const handleError = async (lineService: LineService, event: MessageEvent): Promise<void> => {
  await lineService.replyMessage({
    replyToken: event.replyToken,
    message: '申し訳ありません、処理中にエラーが発生しました。しばらく経ってからもう一度お試しください。',
  });
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
