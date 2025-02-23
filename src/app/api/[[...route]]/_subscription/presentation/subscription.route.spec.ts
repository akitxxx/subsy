import { CurrencyEnum } from '@/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/lib/date.util';
import { type DrizzleClient, getDrizzleClient } from '@/lib/db/drizzle';
import { cleanupDB } from '@/test/api/dbHelper';
import { createActiveUser, createSubscription } from '@/test/api/testDataFactory';
import type { HonoEnv } from '@/types/api/hono';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateSubscriptionInput } from './input/createSubscription.input';
import type { UpdateSubscriptionInput } from './input/updateSubscription.input';
import subscriptionRoute from './subscription.route';

describe('/api/subscriptions', () => {
  // ========== setup ==========
  const db = getDrizzleClient();

  const createTestClient = ({ db, sessionUser }: { db: DrizzleClient; sessionUser?: { id: string } }) => {
    const app = new Hono<HonoEnv>();
    app.use(async (c, next) => {
      c.set('db', db);
      c.set('sessionUser', sessionUser || null);
      await next();
    });
    const route = app.route('/api/subscriptions', subscriptionRoute);
    return testClient(route);
  };

  beforeEach(async () => {
    await cleanupDB(db);
  });

  // ========== test ==========

  const now = new Date('2025-01-01 00:00:00');
  vi.spyOn(DateUtils, 'getNow').mockReturnValue(now);

  describe('GET /', () => {
    it('サブスクリプションを取得できること', async () => {
      // given
      const user = await createActiveUser(db)();
      const subscription1 = await createSubscription(db)({
        userId: user.id,
        name: 'Test Subscription',
        price: '1980.00',
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.addDays(now, 1),
        expiredAt: DateUtils.addDays(now, 30),
      });
      const subscription2 = await createSubscription(db)({
        userId: user.id,
        name: 'Test Subscription 2',
        price: '1980.00',
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.addDays(now, 2),
        expiredAt: DateUtils.addDays(now, 29),
      });
      // when
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.subscriptions.$get();
      // then
      expect(res.status).toBe(200);
      // output
      const output = await res.json();
      expect(output).toMatchObject({
        // 次回支払日が新しい順
        subscriptions: [JSON.parse(JSON.stringify(subscription2)), JSON.parse(JSON.stringify(subscription1))],
      });
    });
  });

  describe('POST /', () => {
    it('サブスクリプションを作成できること', async () => {
      // given
      const user = await createActiveUser(db)();
      // when
      const input = {
        name: 'Test Subscription',
        price: '1980.00',
        currency: CurrencyEnum.JPY,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: now,
        cancelledAt: null,
        description: 'Test Subscription',
      } satisfies CreateSubscriptionInput;
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.subscriptions.$post({ json: input });
      // then
      expect(res.status).toBe(201);
      // output
      const output = await res.json();
      expect(output).toMatchObject({
        subscription: {
          ...input,
          startedAt: new Date(input.startedAt).toISOString(),
          nextPaymentAt: new Date('2025-02-01 00:00:00').toISOString(),
          expiredAt: null,
        },
      });
      // DB
      const subscriptions = await db.query.subscriptionsTable.findMany();
      expect(subscriptions.length).toBe(1);
      expect(subscriptions[0]).toMatchObject({
        ...input,
        cancelledAt: null,
        expiredAt: null,
      });
    });
  });

  describe('PATCH /:id', () => {
    it('サブスクリプションを更新できること', async () => {
      // given
      const user = await createActiveUser(db)();
      const subscription = await createSubscription(db)({
        userId: user.id,
        name: 'Old Subscription',
        price: '1980.00',
        currency: CurrencyEnum.JPY,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: now,
        cancelledAt: null,
        expiredAt: null,
        description: 'Old Description',
      });
      // when
      const input = {
        name: 'New Subscription',
        price: '2980.00',
        currency: CurrencyEnum.USD,
        cycle: SubscriptionCycleEnum.ThreeMonths,
        startedAt: new Date('2024-10-01 00:00:00'),
        cancelledAt: new Date('2025-01-01 00:00:01'),
        description: 'New Description',
      } satisfies UpdateSubscriptionInput;
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.subscriptions[':id'].$patch({
        param: { id: subscription.id },
        json: input,
      } as unknown as { param: { id: string }; json: typeof input }); // MEMO: jsonの部分の型推論うまくいかないので一旦無理矢理
      // then
      expect(res.status).toBe(200);
      // output
      const expectedExpiredAt = new Date('2025-05-03 00:00:00');
      const output = await res.json();
      expect(output).toMatchObject({
        subscription: {
          ...input,
          startedAt: new Date(input.startedAt).toISOString(),
          cancelledAt: new Date(input.cancelledAt).toISOString(),
          nextPaymentAt: new Date('2025-04-01 00:00:00').toISOString(),
          expiredAt: DateUtils.addMilliseconds(new Date('2025-04-01 00:00:00'), -1).toISOString(),
        },
      });
      // DB
      const subscriptions = await db.query.subscriptionsTable.findMany();
      expect(subscriptions.length).toBe(1);
      expect(subscriptions[0]).toMatchObject({
        ...input,
        expiredAt: DateUtils.addMilliseconds(new Date('2025-04-01 00:00:00'), -1),
      });
    });
  });

  describe('DELETE /:id', () => {
    it('サブスクリプションを削除できること', async () => {
      // given
      const user = await createActiveUser(db)();
      const subscription = await createSubscription(db)({ userId: user.id });
      // when
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.subscriptions[':id'].$delete({ param: { id: subscription.id } });
      // then
      expect(res.status).toBe(200);
      // DB
      const subscriptions = await db.query.subscriptionsTable.findMany();
      expect(subscriptions.length).toBe(0);
    });
  });
});
