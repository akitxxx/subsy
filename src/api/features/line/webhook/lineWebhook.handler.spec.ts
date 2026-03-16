import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { type DrizzleClient, getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import { LineService } from '@/api/shared/lib/line';
import { OpenAIService, type SubscriptionFunctionArgs } from '@/api/shared/lib/openai';
import { cleanupDB } from '@/api/shared/test/dbHelper';
import { createActiveUser, createSubscription } from '@/api/shared/test/testDataFactory';
import type { HonoEnv } from '@/api/shared/types/hono';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { lineWebhookHandler } from './lineWebhook.handler';

// vi.mock は @/ エイリアスを解決できないため相対パスを使用
vi.mock('../../../shared/lib/line', () => {
  return { LineService: { new: () => ({ validateSignature: vi.fn().mockReturnValue(true) }) } };
});

vi.mock('../../../shared/lib/openai', () => {
  return { OpenAIService: { new: () => ({ parseSubscriptionIntent: vi.fn().mockReturnValue({}) }) } };
});

const now = new Date('2025-01-01T00:00:00.000Z');

describe('POST /api/line/webhook', () => {
  // ========== setup ==========
  const db = getDrizzleClient();

  const createTestClient = ({ db }: { db: DrizzleClient }) => {
    const app = new Hono<HonoEnv>();
    app.use(async (c, next) => {
      c.set('db', db);
      await next();
    });
    const route = app.post('/api/line/webhook', ...lineWebhookHandler);
    return testClient(route);
  };

  beforeEach(async () => {
    await cleanupDB(db);
    vi.spyOn(DateUtils.create, 'now').mockReturnValue(now);
  });

  afterEach(async () => {
    vi.clearAllMocks();
  });

  // ========== test ==========

  describe('lineWebhookHandler', () => {
    it('LINEからのメッセージを受け取り、正常にレスポンスを返すこと', async () => {
      // given
      const lineUserId = 'lineUserId';
      // mock
      vi.spyOn(LineService, 'new').mockReturnValue({
        validateSignature: vi.fn().mockReturnValue(true),
        replyMessage: vi.fn().mockResolvedValue({ sentMessages: [] }),
        sendMessage: vi.fn().mockResolvedValue({ sentMessages: [] }),
      } satisfies LineService);
      vi.spyOn(OpenAIService, 'new').mockReturnValue({
        parseSubscriptionIntent: vi.fn().mockResolvedValue({
          message: {
            content: '',
            refusal: '',
            role: 'assistant',
          },
          functionCall: {
            name: 'createSubscription',
            args: {
              name: 'Netflix',
              price: '1490',
              currency: CurrencyEnum.Jpy,
              cycle: SubscriptionCycleEnum.OneMonth,
              startedAt: now.toISOString(),
              description: 'ストリーミングサービス',
            } satisfies SubscriptionFunctionArgs,
          },
        }),
      } satisfies OpenAIService);

      const _user = await createActiveUser(db)({ userAuth: { provider: ProviderEnum.Line, providerId: lineUserId } });

      const lineWebhookPayload = {
        destination: 'xxxxxxxxxx',
        events: [
          {
            type: 'message',
            message: {
              type: 'text',
              id: '14353798921116',
              text: 'Netflixのサブスク登録して。月額1490円で1月1日から開始。',
            },
            timestamp: 1625665242211,
            source: {
              type: 'user',
              userId: lineUserId,
            },
            replyToken: 'xxxxxxxxxx',
            mode: 'active',
          },
        ],
      };

      // when
      const client = createTestClient({ db });
      const res = await client.api.line.webhook.$post({ json: lineWebhookPayload });

      // then
      expect(res.status).toBe(200);
      // validateSignatureが呼び出されたことを確認
      expect(LineService.new().validateSignature).toHaveBeenCalledTimes(1);
      // OpenAI サービスが正しく呼び出されたことを確認
      const mockOpenAIService = OpenAIService.new();
      expect(mockOpenAIService.parseSubscriptionIntent).toHaveBeenCalledTimes(1);
      expect(mockOpenAIService.parseSubscriptionIntent).toHaveBeenCalledWith({
        userMessage: 'Netflixのサブスク登録して。月額1490円で1月1日から開始。',
        subscriptions: [],
      });
      // LINEメッセージ送信
      expect(LineService.new().replyMessage).toHaveBeenCalledTimes(1);
      expect(LineService.new().replyMessage).toHaveBeenCalledWith(expect.objectContaining({ replyToken: lineWebhookPayload.events[0].replyToken }));
      // DB
      const subscriptions = await db.query.subscriptionsTable.findMany();
      expect(subscriptions.length).toBe(1);
      expect(subscriptions[0]).toMatchObject({
        name: 'Netflix',
        price: '1490.00',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: now,
      });
    });

    it('サブスクリプション一覧取得が正常に機能すること', async () => {
      // given
      const lineUserId = 'line-user-456';
      // mock
      const mockReplyMessage = vi.fn().mockResolvedValue({ sentMessages: [] });
      vi.spyOn(LineService, 'new').mockReturnValue({
        validateSignature: vi.fn().mockReturnValue(true),
        replyMessage: mockReplyMessage,
        sendMessage: vi.fn().mockResolvedValue({ sentMessages: [] }),
      } satisfies LineService);

      vi.spyOn(OpenAIService, 'new').mockReturnValue({
        parseSubscriptionIntent: vi.fn().mockResolvedValue({
          message: {
            content: '',
            refusal: '',
            role: 'assistant',
          },
          functionCall: {
            name: 'getSubscriptions',
            args: {},
          },
        }),
      } satisfies OpenAIService);

      // test data
      const user = await createActiveUser(db)({ userAuth: { provider: ProviderEnum.Line, providerId: lineUserId } });

      await createSubscription(db)({
        userId: user.id,
        name: 'Netflix',
        price: '1490',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: now,
      });
      await createSubscription(db)({
        userId: user.id,
        name: 'Spotify',
        price: '980',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: now,
      });

      const lineWebhookPayload = {
        destination: 'xxxxxxxxxx',
        events: [
          {
            type: 'message',
            message: {
              type: 'text',
              id: '14353798921117',
              text: 'サブスク一覧を教えて',
            },
            timestamp: 1625665242211,
            source: {
              type: 'user',
              userId: lineUserId,
            },
            replyToken: 'reply-token-456',
            mode: 'active',
          },
        ],
      };

      // when
      const client = createTestClient({ db });
      await client.api.line.webhook.$post({ json: lineWebhookPayload });

      // then
      // LINEメッセージ送信
      expect(mockReplyMessage).toHaveBeenCalledTimes(1);
      expect(mockReplyMessage.mock.calls[0][0]).toHaveProperty('replyToken', 'reply-token-456');
      const replyMessage = mockReplyMessage.mock.calls[0][0].message;
      expect(replyMessage).toContain('Netflix');
      expect(replyMessage).toContain('Spotify');
    });

    it('サブスクリプション詳細取得が正常に機能すること', async () => {
      // given
      const lineUserId = 'line-user-789';
      // mock
      const mockReplyMessage = vi.fn().mockResolvedValue({ sentMessages: [] });
      vi.spyOn(LineService, 'new').mockReturnValue({
        validateSignature: vi.fn().mockReturnValue(true),
        replyMessage: mockReplyMessage,
        sendMessage: vi.fn().mockResolvedValue({ sentMessages: [] }),
      } satisfies LineService);

      // ユーザーとサブスクリプションを作成
      const user = await createActiveUser(db)({ userAuth: { provider: ProviderEnum.Line, providerId: lineUserId } });

      const subscription = await createSubscription(db)({
        userId: user.id,
        name: 'Netflix',
        price: '1490',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: now,
        description: 'ストリーミングサービス',
      });

      vi.spyOn(OpenAIService, 'new').mockReturnValue({
        parseSubscriptionIntent: vi.fn().mockResolvedValue({
          message: {
            content: '',
            refusal: '',
            role: 'assistant',
          },
          functionCall: {
            name: 'getSubscriptionDetail',
            args: {
              id: subscription.id,
            },
          },
        }),
      } satisfies OpenAIService);

      const lineWebhookPayload = {
        destination: 'xxxxxxxxxx',
        events: [
          {
            type: 'message',
            message: {
              type: 'text',
              id: '14353798921118',
              text: 'Netflixの詳細を教えて',
            },
            timestamp: 1625665242211,
            source: {
              type: 'user',
              userId: lineUserId,
            },
            replyToken: 'reply-token-789',
            mode: 'active',
          },
        ],
      };

      // when
      const client = createTestClient({ db });
      await client.api.line.webhook.$post({ json: lineWebhookPayload });

      // then
      // LINEメッセージ送信
      expect(mockReplyMessage).toHaveBeenCalledTimes(1);
      expect(mockReplyMessage.mock.calls[0][0]).toHaveProperty('replyToken', 'reply-token-789');
      const replyMessage = mockReplyMessage.mock.calls[0][0].message;
      expect(replyMessage).toContain('サブスクリプション情報');
      expect(replyMessage).toContain('Netflix');
    });

    it('サブスクリプション更新が正常に機能すること', async () => {
      // given
      const lineUserId = 'line-user-abc';
      // mock
      const mockReplyMessage = vi.fn().mockResolvedValue({ sentMessages: [] });
      vi.spyOn(LineService, 'new').mockReturnValue({
        validateSignature: vi.fn().mockReturnValue(true),
        replyMessage: mockReplyMessage,
        sendMessage: vi.fn().mockResolvedValue({ sentMessages: [] }),
      } satisfies LineService);

      // test data
      const user = await createActiveUser(db)({ userAuth: { provider: ProviderEnum.Line, providerId: lineUserId } });

      const subscription = await createSubscription(db)({
        userId: user.id,
        name: 'Netflix',
        price: '1490',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: now,
      });

      vi.spyOn(OpenAIService, 'new').mockReturnValue({
        parseSubscriptionIntent: vi.fn().mockResolvedValue({
          message: {
            content: '',
            refusal: '',
            role: 'assistant',
          },
          functionCall: {
            name: 'updateSubscription',
            args: {
              id: subscription.id,
              price: '1980',
              description: '価格改定後のプレミアムプラン',
            },
          },
        }),
      } satisfies OpenAIService);

      const lineWebhookPayload = {
        destination: 'xxxxxxxxxx',
        events: [
          {
            type: 'message',
            message: {
              type: 'text',
              id: '14353798921119',
              text: 'Netflixの料金を1980円に変更して、説明を「価格改定後のプレミアムプラン」にして',
            },
            timestamp: 1625665242211,
            source: {
              type: 'user',
              userId: lineUserId,
            },
            replyToken: 'reply-token-abc',
            mode: 'active',
          },
        ],
      };

      // when
      const client = createTestClient({ db });
      await client.api.line.webhook.$post({ json: lineWebhookPayload });

      // then
      // LINEメッセージ送信
      expect(mockReplyMessage).toHaveBeenCalledTimes(1);
      expect(mockReplyMessage.mock.calls[0][0]).toHaveProperty('replyToken', 'reply-token-abc');
      const replyMessage = mockReplyMessage.mock.calls[0][0].message;
      expect(replyMessage).toContain('サブスクリプションを更新しました');
      expect(replyMessage).toContain('Netflix');
      // DB
      const updatedSubscription = await db.query.subscriptionsTable.findFirst();
      expect(updatedSubscription?.price).toBe('1980.00');
      expect(updatedSubscription?.description).toBe('価格改定後のプレミアムプラン');
    });

    it('サブスクリプション削除が正常に機能すること', async () => {
      // given
      const lineUserId = 'line-user-def';
      // mock
      const mockReplyMessage = vi.fn().mockResolvedValue({ sentMessages: [] });
      vi.spyOn(LineService, 'new').mockReturnValue({
        validateSignature: vi.fn().mockReturnValue(true),
        replyMessage: mockReplyMessage,
        sendMessage: vi.fn().mockResolvedValue({ sentMessages: [] }),
      } satisfies LineService);

      // test data
      const user = await createActiveUser(db)({ userAuth: { provider: ProviderEnum.Line, providerId: lineUserId } });

      const subscription = await createSubscription(db)({
        userId: user.id,
        name: 'Netflix',
        price: '1490',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: now,
      });

      vi.spyOn(OpenAIService, 'new').mockReturnValue({
        parseSubscriptionIntent: vi.fn().mockResolvedValue({
          message: {
            content: '',
            refusal: '',
            role: 'assistant',
          },
          functionCall: {
            name: 'deleteSubscription',
            args: {
              id: subscription.id,
            },
          },
        }),
      } satisfies OpenAIService);

      const lineWebhookPayload = {
        destination: 'xxxxxxxxxx',
        events: [
          {
            type: 'message',
            message: {
              type: 'text',
              id: '14353798921120',
              text: 'Netflixのサブスクを削除して',
            },
            timestamp: 1625665242211,
            source: {
              type: 'user',
              userId: lineUserId,
            },
            replyToken: 'reply-token-def',
            mode: 'active',
          },
        ],
      };

      // when
      const client = createTestClient({ db });
      await client.api.line.webhook.$post({ json: lineWebhookPayload });

      // then
      // LINEメッセージ送信
      expect(mockReplyMessage).toHaveBeenCalledTimes(1);
      expect(mockReplyMessage.mock.calls[0][0]).toHaveProperty('replyToken', 'reply-token-def');
      const replyMessage = mockReplyMessage.mock.calls[0][0].message;
      expect(replyMessage).toContain('サブスクリプションを削除しました');
      expect(replyMessage).toContain('Netflix');
      // DB
      const deletedSubscription = await db.query.subscriptionsTable.findMany();
      expect(deletedSubscription.length).toBe(0);
    });

    it('テキスト以外のメッセージタイプは無視されること', async () => {
      // given
      const lineWebhookPayload = {
        destination: 'xxxxxxxxxx',
        events: [
          {
            type: 'message',
            message: {
              type: 'image', // テキスト以外
              id: '14353798921116',
            },
            timestamp: 1625665242211,
            source: {
              type: 'user',
              userId: 'U80xxxxxxxxxxxxxxxxx',
            },
            replyToken: 'xxxxxxxxxx',
            mode: 'active',
          },
        ],
      };

      // when
      const client = createTestClient({ db });
      const res = await client.api.line.webhook.$post({
        json: lineWebhookPayload,
      });

      // then
      expect(res.status).toBe(200);

      // OpenAI サービスが呼び出されないことを確認
      const mockOpenAIService = OpenAIService.new();
      expect(mockOpenAIService.parseSubscriptionIntent).not.toHaveBeenCalled();
    });

    it('不正なペイロードでもエラーにならずに処理されること', async () => {
      // given
      const invalidPayload = {
        // eventsがない不正なペイロード
        destination: 'xxxxxxxxxx',
      };

      // when
      const client = createTestClient({ db });
      const res = await client.api.line.webhook.$post({
        json: invalidPayload,
      });

      // then
      expect(res.status).toBe(200); // LINEには常に200を返す
    });
  });
});
