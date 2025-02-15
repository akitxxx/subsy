import { CurrencyEnum } from '@/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import { type DrizzleClient, getDrizzleClient } from '@/lib/db/drizzle';
import { cleanupDB } from '@/test/api/dbHelper';
import { createActiveUser, createSubscription } from '@/test/api/testDataFactory';
import type { HonoEnv } from '@/types/api/hono';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it } from 'vitest';
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

  describe('GET /', () => {
    it('サブスクリプションを取得できること', async () => {
      // given
      const user = await createActiveUser(db)();
      const subscription1 = await createSubscription(db)({
        userId: user.id,
        name: 'Test Subscription',
        price: '1980.00',
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date(),
        expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      const subscription2 = await createSubscription(db)({
        userId: user.id,
        name: 'Test Subscription 2',
        price: '1980.00',
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date(),
        expiredAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
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
        startedAt: new Date().toISOString(),
        cancelledAt: null,
        expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Test Subscription',
      };
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.subscriptions.$post({ json: input });
      // then
      expect(res.status).toBe(201);
      // output
      const output = await res.json();
      expect(output).toMatchObject({
        subscription: {
          ...input,
        },
      });
      // DB
      const subscriptions = await db.query.subscriptionsTable.findMany();
      expect(subscriptions.length).toBe(1);
      expect(subscriptions[0]).toMatchObject({
        ...input,
        startedAt: new Date(input.startedAt),
        cancelledAt: null,
        expiredAt: new Date(input.expiredAt),
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
        startedAt: new Date(),
        cancelledAt: null,
        expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: 'Old Description',
      });
      // when
      const input = {
        name: 'New Subscription',
        price: '2980.00',
        currency: CurrencyEnum.USD,
        cycle: SubscriptionCycleEnum.ThreeMonths,
        startedAt: new Date().toISOString(),
        cancelledAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'New Description',
      };
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.subscriptions[':id'].$patch({
        param: { id: subscription.id },
        json: input,
      } as unknown as { param: { id: string }; json: typeof input }); // MEMO: jsonの部分の型推論うまくいかないので一旦無理矢理
      // then
      expect(res.status).toBe(200);
      // output
      const output = await res.json();
      expect(output).toMatchObject({
        subscription: {
          ...input,
        },
      });
      // DB
      const subscriptions = await db.query.subscriptionsTable.findMany();
      expect(subscriptions.length).toBe(1);
      expect(subscriptions[0]).toMatchObject({
        ...input,
        startedAt: new Date(input.startedAt),
        cancelledAt: new Date(input.cancelledAt),
        expiredAt: new Date(input.expiredAt),
      });
    });
  });
});
