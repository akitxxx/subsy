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
  const db = getDrizzleClient();
  app.use(async (c, next) => {
    c.set('db', db);
    await next();
  });
  app.route('/', dashboard);

  const client = testClient(app) as {
    $get: (
      path: string,
      query?: unknown,
      options?: { env?: { Variables: HonoEnv['Variables'] } },
    ) => Promise<Response>;
  };

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
      const res = await client.$get('/');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.subscriptions).toHaveLength(2);
      expect(data.subscriptions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Netflix',
            price: '1490.00',
            cycle: 'monthly',
            status: 'active',
            description: 'ベーシックプラン',
            userId: testUser.id,
          }),
          expect.objectContaining({
            name: 'Spotify',
            price: '980.00',
            cycle: 'monthly',
            status: 'active',
            description: '個人プラン',
            userId: testUser.id,
          }),
        ]),
      );
      expect(data.totalThisMonth).toBe(2470);
      expect(data.upcomingSubscriptions).toHaveLength(2);
      expect(data.upcomingSubscriptions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Netflix',
            nextPaymentAt: new Date('2024-04-01').toISOString(),
          }),
          expect.objectContaining({
            name: 'Spotify',
            nextPaymentAt: new Date('2024-04-15').toISOString(),
          }),
        ]),
      );
    });

    it('DBエラー時は500エラーを返す', async () => {
      const mockApp = new Hono<HonoEnv>();
      mockApp.use(async (c, next) => {
        c.set('db', {
          ...db,
          select: () => {
            throw new Error('DB接続エラー');
          },
        } as unknown as DrizzleClient);
        await next();
      });
      mockApp.route('/', dashboard);
      const mockClient = testClient(mockApp) as {
        $get: (
          path: string,
          query?: unknown,
          options?: { env?: { Variables: HonoEnv['Variables'] } },
        ) => Promise<Response>;
      };

      const res = await mockClient.$get('/');

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({
        error: 'データの取得に失敗しました',
      });
    });
  });
});
