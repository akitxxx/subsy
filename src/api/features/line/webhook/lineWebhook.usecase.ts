import type { MessageEvent, TextMessage } from '@line/bot-sdk';
import { Effect } from 'effect';
import type { SubscriptionRepository } from '@/api/shared/domain/subscription/subscription.repository';
import { CreateUserDomainService } from '@/api/shared/domain/user/createUser.domainService';
import type { UserRepository } from '@/api/shared/domain/user/user.repository';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { LineService } from '@/api/shared/lib/line';
import type { OpenAIService } from '@/api/shared/lib/openai';
import { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';
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
  ({ payload }: Input): Effect.Effect<Output> =>
    Effect.gen(function* () {
      console.dir({ 'LineWebhookUsecase.run': payload }, { depth: null });

      // ペイロードのバリデーション
      if (!payload || !payload.events || !Array.isArray(payload.events)) {
        console.error('無効なLINE Webhookペイロード', payload);
        return { success: false };
      }

      // イベントごとに処理
      yield* processEvents(inject, payload.events);

      return { success: true };
    });

const processEvents = (inject: Inject, events: LineEvent[]): Effect.Effect<void> =>
  Effect.forEach(
    events,
    (event) => {
      if (!('message' in event && event.message.type === 'text')) return Effect.void;
      return handleMessageEvent({ inject, event: event as MessageEvent });
    },
    { discard: true },
  );

// ==========

const sendMessage = (lineService: LineService, event: MessageEvent, message: string): Effect.Effect<void> => {
  if (!message || !event.replyToken) {
    console.error('not found message or replyToken', { message, event });
    return Effect.void;
  }
  return Effect.tryPromise(() => lineService.replyMessage({ replyToken: event.replyToken, message })).pipe(Effect.catchAll(() => Effect.void));
};

/**
 * メッセージイベントを処理する
 */
const handleMessageEvent = ({
  inject: { db: _db, lineService, openAiService, userRepository, subscriptionRepository },
  event,
}: {
  inject: Inject;
  event: MessageEvent;
}): Effect.Effect<void> =>
  Effect.gen(function* () {
    // 基本的な検証
    const validationResult = validateMessageEvent(event);
    if (!validationResult) {
      console.log('メッセージの検証に失敗しました', { event, validationResult });
      return;
    }

    const { userId: lineUserId, messageText } = validationResult;

    // userレコード取得
    const user = yield* userRepository.findByLineUserId({ lineUserId });
    if (!user) {
      yield* CreateUserDomainService.run({ userRepository })({ provider: ProviderEnum.Line, providerId: lineUserId });
      return;
    }

    // サブスクリプション一覧取得
    const subscriptions = yield* subscriptionRepository.findManyByUserId({ userId: user.id });

    // OpenAI APIでメッセージをパース
    const result = yield* Effect.tryPromise(() => openAiService.parseSubscriptionIntent({ userMessage: messageText, subscriptions }));

    // 対応する機能がなかった場合はメッセージを返す
    const { functionCall } = result;
    if (!functionCall) {
      yield* sendMessage(lineService, event, 'サブスクリプションに関する操作を指定してください。');
      return;
    }

    // 機能に応じた処理を実行して返信メッセージを取得
    const functionResult = yield* Effect.tryPromise(() =>
      executeFunctionByName({ subscriptionRepository })({
        userId: user.id,
        subscriptions,
        functionCall,
      }),
    );

    // 結果をLINEで返信
    yield* sendMessage(lineService, event, functionResult.message);
  }).pipe(
    Effect.catchAll((error) => {
      console.error('LINE Webhookイベント処理エラー:', error);
      return sendMessage(lineService, event, '申し訳ありません、処理中にエラーが発生しました。しばらく経ってからもう一度お試しください。');
    }),
  );

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

// LINE Webhookのイベント型
type LineEvent = LineMessageEvent | LineEventBase;

// LINE Webhookのペイロード型
type LineWebhookPayload = {
  destination: string;
  events: LineEvent[];
};
