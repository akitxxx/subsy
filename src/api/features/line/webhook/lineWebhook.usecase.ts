import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { LineService } from '@/api/shared/lib/line';
import type { OpenAIService } from '@/api/shared/lib/openai';
import type { DeleteSubscriptionFunctionArgs, SubscriptionFunctionArgs, UpdateSubscriptionFunctionArgs } from '@/api/shared/lib/openai';
import type { MessageEvent, TextMessage, WebhookEvent } from '@line/bot-sdk';

type Inject = {
  db: DrizzleClient;
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
  ({ db, lineService, openAiService }: Inject) =>
  async ({ payload }: Input): Promise<Output> => {
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

        await handleMessageEvent(db, lineService, openAiService, event as MessageEvent);
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
const handleMessageEvent = async (db: DrizzleClient, lineService: LineService, openAiService: OpenAIService, event: MessageEvent) => {
  try {
    // 基本的な検証
    const validationResult = validateMessageEvent(event);
    if (!validationResult.isValid || !validationResult.messageText) {
      console.log('メッセージの検証に失敗しました', { event, validationResult });
      return;
    }

    const { userId, messageText } = validationResult;

    // TODO
    // 開発環境ではログを出力して終了
    if (isDevelopmentEnvironment()) {
      console.log('開発環境のため処理をスキップします', { event });
      return;
    }

    // OpenAI APIでメッセージをパース
    const result = await parseMessageWithOpenAI(openAiService, messageText);

    // 機能に応じた処理を実行して返信メッセージを取得
    if (!result.functionCall) {
      console.log('functionCallが不足しています', { result });
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
const validateMessageEvent = (event: MessageEvent): { isValid: boolean; userId?: string; messageText?: string } => {
  // ユーザーID取得
  const userId = event.source.userId;
  if (!userId) return { isValid: false };

  // テキストメッセージのみ処理
  if (event.message.type !== 'text') return { isValid: false };

  const messageText = (event.message as TextMessage).text;
  if (!messageText) return { isValid: false };

  return { isValid: true, userId, messageText };
};

/**
 * 開発環境かどうかを判定
 */
const isDevelopmentEnvironment = (): boolean => {
  return process.env.NEXT_PUBLIC_APP_ENV === 'development';
};

/**
 * OpenAI APIでメッセージを解析
 */
const parseMessageWithOpenAI = async (openAiService: OpenAIService, messageText: string) => {
  const result = await openAiService.parseSubscriptionIntent(messageText);

  // resultがnullまたはundefinedでないことを確認
  if (!result?.functionCall) {
    console.error('OpenAI APIの戻り値が不正です', { result, messageText });
    throw new Error('エラーが発生しました');
  }

  return result;
};

/**
 * 機能名に応じた処理を実行
 */
const executeFunctionByName = async (db: DrizzleClient, functionCall: { name: string; args: unknown }): Promise<string> => {
  const { name, args } = functionCall;

  switch (name) {
    case 'createSubscription':
      return handleCreateSubscription(db, args as SubscriptionFunctionArgs);
    case 'getSubscriptions':
      return handleGetSubscriptions(db);
    case 'updateSubscription':
      return handleUpdateSubscription(db, args as UpdateSubscriptionFunctionArgs);
    case 'deleteSubscription':
      return handleDeleteSubscription(db, args as DeleteSubscriptionFunctionArgs);
    default:
      throw new Error(`未知の機能: ${name}`);
  }
};

/**
 * サブスクリプション作成処理
 */
const handleCreateSubscription = async (db: DrizzleClient, args: SubscriptionFunctionArgs): Promise<string> => {
  console.log('サブスクリプション作成:', args);
  // TODO: 実際のサブスクリプション作成処理を実装
  return `「${args.name}」のサブスクリプションを登録しました。金額: ${args.price}${args.currency}/月`;
};

/**
 * サブスクリプション取得処理
 */
const handleGetSubscriptions = async (db: DrizzleClient): Promise<string> => {
  console.log('サブスクリプション取得');
  // TODO: 実際のサブスクリプション取得処理を実装
  return 'あなたのサブスクリプション一覧です。\n' + '（ここには実際のサブスクリプション情報が表示されます）';
};

/**
 * サブスクリプション更新処理
 */
const handleUpdateSubscription = async (db: DrizzleClient, args: UpdateSubscriptionFunctionArgs): Promise<string> => {
  console.log('サブスクリプション更新:', args);
  // TODO: 実際のサブスクリプション更新処理を実装
  return 'サブスクリプション情報を更新しました。';
};

/**
 * サブスクリプション削除処理
 */
const handleDeleteSubscription = async (db: DrizzleClient, args: DeleteSubscriptionFunctionArgs): Promise<string> => {
  console.log('サブスクリプション削除:', args.id);
  // TODO: 実際のサブスクリプション削除処理を実装
  return 'サブスクリプションを削除しました。';
};

/**
 * エラーハンドリング
 */
const handleError = async (lineService: LineService, event: MessageEvent): Promise<void> => {
  if (event.replyToken) {
    await lineService.replyMessage({
      replyToken: event.replyToken,
      message: '申し訳ありません、処理中にエラーが発生しました。しばらく経ってからもう一度お試しください。',
    });
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
