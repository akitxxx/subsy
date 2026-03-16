import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { toErrorResponse } from '@/api/shared/error';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import { getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import { cleanupDB } from '@/api/shared/test/dbHelper';
import { createActiveUser, createSubscription } from '@/api/shared/test/testDataFactory';
import type { HonoEnv } from '@/api/shared/types/hono';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { getDashboardHandler } from './getDashboard.handler';

describe('GET /api/dashboard', () => {
  // ========== setup ==========
  const db = getDrizzleClient();

  const createTestClient = ({ db, sessionUser }: { db: DrizzleClient; sessionUser?: { id: string } }) => {
    const app = new Hono<HonoEnv>();
    app.use(async (c, next) => {
      c.set('db', db);
      c.set('sessionUser', sessionUser || null);
      await next();
    });
    const route = app.get('/api/dashboard', ...getDashboardHandler);
    // プロダクション（route.ts）と同じエラーハンドリングを設定
    route.onError((err, c) => {
      const errorResponse = toErrorResponse(err);
      return c.json(errorResponse, errorResponse.error.status);
    });
    return testClient(route);
  };

  const now = new Date('2025-01-01T00:00:00.000Z');

  beforeEach(async () => {
    // テストデータをクリーンアップ
    await cleanupDB(db);
    vi.spyOn(DateUtils.create, 'now').mockReturnValue(now);
  });

  // ========== test ==========

  describe('getDashboardHandler', () => {
    it('dashboard情報を返す', async () => {
      // given
      const user = await createActiveUser(db)();
      const subscription1 = await createSubscription(db)({
        userId: user.id,
        name: 'Test Subscription 1',
        price: '1000.00',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.modify.addDays(now, -20),
        cancelledAt: null,
        expiredAt: null,
      });
      const subscription2 = await createSubscription(db)({
        userId: user.id,
        name: 'Test Subscription 2',
        price: '2000.00',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.modify.addDays(now, -17),
        cancelledAt: null,
        expiredAt: null,
      });
      const _subscription3 = await createSubscription(db)({
        userId: user.id,
        name: 'Test Subscription 3',
        price: '3000.00',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.modify.addDays(now, -10),
        expiredAt: DateUtils.modify.addDays(now, 10),
      });

      // when
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.dashboard.$get();
      const data = await res.json();

      // then
      expect(res.status).toBe(200);
      if ('error' in data) throw new Error('error');
      expect(data.totalThisMonth).toBe(3000);
      expect(data.upcomingSubscriptions).toMatchObject([
        expect.objectContaining({ id: subscription1.id }),
        expect.objectContaining({ id: subscription2.id }),
      ]);
    });

    it('サブスクリプションがない場合は空の結果を返す', async () => {
      // given
      const user = await createActiveUser(db)();

      // when
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.dashboard.$get();

      // then
      expect(res.status).toBe(200);
      const data = await res.json();

      // 値チェック
      expect(data).toMatchObject({
        totalThisMonth: 0,
        upcomingSubscriptions: [],
      });
    });

    it('セッションユーザーがない場合はエラーを返す', async () => {
      // when
      const client = createTestClient({ db });
      const res = await client.api.dashboard.$get();

      // then
      expect(res.status).toBe(401);
    });
  });
});
