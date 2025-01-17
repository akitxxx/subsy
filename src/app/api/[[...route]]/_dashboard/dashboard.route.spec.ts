import { getDrizzleClient } from '@/lib/db/drizzle';
import type { DrizzleClient } from '@/lib/db/drizzle';
import { subscriptionsTable, usersTable } from '@/lib/db/schema';
import type { HonoEnv } from '@/types/api/hono';
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import dashboard from './dashboard.route';

describe('/api/dashboard', () => {
  const app = new Hono<HonoEnv>();
  app.route('/', dashboard);
  const client = testClient(app) as {
    $get: (
      path: string,
      query?: unknown,
      options?: { env?: { Variables: HonoEnv['Variables'] } },
    ) => Promise<Response>;
  };

  const db = getDrizzleClient();
  const testUser = {
    id: '12345678-1234-1234-1234-123456789012',
    nickname: 'テストユーザー',
  };

  const testSubscriptions = [
    {
      userId: testUser.id,
      name: 'Netflix',
      price: '1490',
      cycle: 'monthly',
      description: 'ベーシックプラン',
      startedAt: new Date('2024-03-01'),
      nextPaymentAt: new Date('2024-04-01'),
      status: 'active',
    },
    {
      userId: testUser.id,
      name: 'Spotify',
      price: '980',
      cycle: 'monthly',
      description: '個人プラン',
      startedAt: new Date('2024-03-15'),
      nextPaymentAt: new Date('2024-04-15'),
      status: 'active',
    },
  ];

  beforeAll(async () => {
    // テストユーザーを作成
    await db.insert(usersTable).values(testUser);
  });

  beforeEach(async () => {
    // テストデータをクリーンアップ
    await db.delete(subscriptionsTable).where(sql`true`);
    // テストサブスクリプションを作成
    await db.insert(subscriptionsTable).values(testSubscriptions);
  });

  afterAll(async () => {
    // テストデータをクリーンアップ
    await db.delete(subscriptionsTable).where(sql`true`);
    await db.delete(usersTable).where(sql`true`);
  });

  describe('GET /', () => {
    it('サブスクリプション一覧と合計金額を返す', async () => {
      const res = await client.$get('/', undefined, {
        env: {
          Variables: {
            db,
          },
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        subscriptions: expect.arrayContaining([
          expect.objectContaining({
            name: 'Netflix',
            price: '1490',
            cycle: 'monthly',
            status: 'active',
          }),
          expect.objectContaining({
            name: 'Spotify',
            price: '980',
            cycle: 'monthly',
            status: 'active',
          }),
        ]),
        totalAmount: 2470,
      });
    });

    it('DBエラー時は500エラーを返す', async () => {
      const mockDb = {
        ...db,
        select: () => {
          throw new Error('DB接続エラー');
        },
      } as unknown as DrizzleClient;

      const res = await client.$get('/', undefined, {
        env: {
          Variables: {
            db: mockDb,
          },
        },
      });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({
        error: 'データの取得に失敗しました',
      });
    });
  });
});
