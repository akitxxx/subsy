import { type DrizzleClient, getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import { cleanupDB } from '@/api/shared/test/dbHelper';
import { createActiveUser } from '@/api/shared/test/testDataFactory';
import type { HonoEnv } from '@/api/shared/types/hono';
import lineRoute from '@/app/api/[[...route]]/line.route';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// OpenAI サービスのモック
vi.mock('@/api/shared/lib/openai', () => {
  return {
    openAiService: {
      parseSubscriptionIntent: vi.fn().mockResolvedValue({
        message: {},
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
    },
  };
});

describe('/api/line', () => {
  // ========== setup ==========
  const db = getDrizzleClient();

  const createTestClient = ({ db }: { db: DrizzleClient }) => {
    const app = new Hono<HonoEnv>();
    app.use(async (c, next) => {
      c.set('db', db);
      await next();
    });
    const route = app.route('/api/line', lineRoute);
    return testClient(route);
  };

  beforeEach(async () => {
    await cleanupDB(db);
    vi.clearAllMocks();
  });

  // ========== test ==========
  describe('POST /webhook', () => {
    it('LINEからのメッセージを受け取り、正常にレスポンスを返すこと', async () => {
      // given
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
      const res = await client.api.line.webhook.$post({
        json: lineWebhookPayload,
      });

      // then
      expect(res.status).toBe(200);

      // OpenAI サービスが正しく呼び出されたことを確認
      const { openAiService } = await import('@/api/shared/lib/openai');
      expect(openAiService.parseSubscriptionIntent).toHaveBeenCalledTimes(1);
      expect(openAiService.parseSubscriptionIntent).toHaveBeenCalledWith('Netflixのサブスク登録して。月額1490円で1月1日から開始。');
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
      const { openAiService } = await import('@/api/shared/lib/openai');
      expect(openAiService.parseSubscriptionIntent).not.toHaveBeenCalled();
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
