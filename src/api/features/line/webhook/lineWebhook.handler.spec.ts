import { type DrizzleClient, getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import { LineService } from '@/api/shared/lib/line';
import { OpenAIService } from '@/api/shared/lib/openai';
import { cleanupDB } from '@/api/shared/test/dbHelper';
import { createActiveUser } from '@/api/shared/test/testDataFactory';
import type { HonoEnv } from '@/api/shared/types/hono';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { lineWebhookHandler } from './lineWebhook.handler';

// LineServiceのモック
vi.mock('@/api/shared/lib/line', () => {
  return { LineService: { new: () => ({}) } };
});

// OpenAI サービスのモック
vi.mock('@/api/shared/lib/openai', () => {
  return { OpenAIService: { new: () => ({}) } };
});

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
    vi.clearAllMocks();
  });

  // ========== test ==========

  describe('lineWebhookHandler', () => {
    it('LINEからのメッセージを受け取り、正常にレスポンスを返すこと', async () => {
      // given
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
              currency: 'JPY',
              cycle: 'ONE_MONTH',
              startedAt: '2023-01-01',
              description: 'ストリーミングサービス',
            },
          },
        }),
      } satisfies OpenAIService);

      const user = await createActiveUser(db)();

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
              userId: 'U80xxxxxxxxxxxxxxxxx',
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
      expect(mockOpenAIService.parseSubscriptionIntent).toHaveBeenCalledWith('Netflixのサブスク登録して。月額1490円で1月1日から開始。');
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
      const { OpenAIService } = await import('@/api/shared/lib/openai');
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
