import { getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import { cleanupDB } from '@/api/shared/test/dbHelper';
import { createActiveUser } from '@/api/shared/test/testDataFactory';
import { createSubscription } from '@/api/shared/test/testDataFactory';
import type { HonoEnv } from '@/api/shared/types/hono';
import dashboardRoute from '@/app/api/[[...route]]/dashboard.route';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { CurrencyUtils } from '@/shared/utils/currency.util';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('/api/dashboard', () => {
  // ========== setup ==========
  const db = getDrizzleClient();

  const createTestClient = ({ db, sessionUser }: { db: DrizzleClient; sessionUser?: { id: string } }) => {
    const app = new Hono<HonoEnv>();
    app.use(async (c, next) => {
      c.set('db', db);
      c.set('sessionUser', sessionUser || null);
      await next();
    });
    const route = app.route('/api/dashboard', dashboardRoute);
    return testClient(route);
  };

  const now = new Date('2025-01-01 00:00:00');

  beforeEach(async () => {
    // テストデータをクリーンアップ
    await cleanupDB(db);
    vi.spyOn(DateUtils.create, 'now').mockReturnValue(now);
    vi.spyOn(CurrencyUtils, 'convertUsdToJpy').mockResolvedValue(15000); // 100ドル = 15000円と仮定
  });

  // ========== test ==========

  describe('GET /', () => {
    it('dashboard情報を返す', async () => {
      // given
      const user = await createActiveUser(db)();
      const subscription1 = await createSubscription(db)({
        userId: user.id,
        name: 'Test Subscription 1',
        price: '1000.00',
        currency: CurrencyEnum.JPY,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.modify.addDays(now, -20),
        cancelledAt: null,
        expiredAt: null,
      });
      const subscription2 = await createSubscription(db)({
        userId: user.id,
        name: 'Test Subscription 2',
        price: '2000.00',
        currency: CurrencyEnum.JPY,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.modify.addDays(now, -17),
        cancelledAt: null,
        expiredAt: null,
      });
      const subscription3 = await createSubscription(db)({
        userId: user.id,
        name: 'Test Subscription 3',
        price: '3000.00',
        currency: CurrencyEnum.JPY,
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

    it('USDサブスクリプションを含む場合、JPYに変換して合計に含める', async () => {
      // given
      const user = await createActiveUser(db)();
      const subscriptionJpy = await createSubscription(db)({
        userId: user.id,
        name: 'JPY Subscription',
        price: '1000.00',
        currency: CurrencyEnum.JPY,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.modify.addDays(now, -20),
        cancelledAt: null,
        expiredAt: null,
      });
      const subscriptionUsd = await createSubscription(db)({
        userId: user.id,
        name: 'USD Subscription',
        price: '10000', // 100ドル（セント単位）
        currency: CurrencyEnum.USD,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.modify.addDays(now, -15),
        cancelledAt: null,
        expiredAt: null,
      });

      // when
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.dashboard.$get();
      const data = await res.json();

      // then
      expect(res.status).toBe(200);
      if ('error' in data) throw new Error('error');
      // JPY 1000円 + USD 100ドル（15000円に変換） = 16000円
      expect(data.totalThisMonth).toBe(16000);
      expect(data.upcomingSubscriptions).toMatchObject([
        expect.objectContaining({ id: subscriptionUsd.id }),
        expect.objectContaining({ id: subscriptionJpy.id }),
      ]);
      // convertUsdToJpyが呼ばれたことを確認
      expect(CurrencyUtils.convertUsdToJpy).toHaveBeenCalledWith(10000);
    });

    it('複数のUSDサブスクリプションを含む場合、すべて変換して合計に含める', async () => {
      // given
      const user = await createActiveUser(db)();
      const subscriptionJpy = await createSubscription(db)({
        userId: user.id,
        name: 'JPY Subscription',
        price: '1000.00',
        currency: CurrencyEnum.JPY,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.modify.addDays(now, -20),
        cancelledAt: null,
        expiredAt: null,
      });
      const subscriptionUsd1 = await createSubscription(db)({
        userId: user.id,
        name: 'USD Subscription 1',
        price: '10000', // 100ドル（セント単位）
        currency: CurrencyEnum.USD,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.modify.addDays(now, -15),
        cancelledAt: null,
        expiredAt: null,
      });
      const subscriptionUsd2 = await createSubscription(db)({
        userId: user.id,
        name: 'USD Subscription 2',
        price: '5000', // 50ドル（セント単位）
        currency: CurrencyEnum.USD,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.modify.addDays(now, -10),
        cancelledAt: null,
        expiredAt: null,
      });

      // convertUsdToJpyの戻り値を呼び出し回数に応じて変更
      vi.spyOn(CurrencyUtils, 'convertUsdToJpy')
        .mockResolvedValueOnce(15000) // 1回目: 100ドル = 15000円
        .mockResolvedValueOnce(7500);  // 2回目: 50ドル = 7500円

      // when
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.dashboard.$get();
      const data = await res.json();

      // then
      expect(res.status).toBe(200);
      if ('error' in data) throw new Error('error');
      // JPY 1000円 + USD 100ドル（15000円に変換） + USD 50ドル（7500円に変換） = 23500円
      expect(data.totalThisMonth).toBe(23500);
      expect(CurrencyUtils.convertUsdToJpy).toHaveBeenCalledTimes(2);
      expect(CurrencyUtils.convertUsdToJpy).toHaveBeenNthCalledWith(1, 10000);
      expect(CurrencyUtils.convertUsdToJpy).toHaveBeenNthCalledWith(2, 5000);
    });
  });
});
