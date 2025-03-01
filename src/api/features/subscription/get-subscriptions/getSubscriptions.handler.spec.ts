import { type DrizzleClient, getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import { cleanupDB } from '@/api/shared/test/dbHelper';
import { createActiveUser, createSubscription } from '@/api/shared/test/testDataFactory';
import type { HonoEnv } from '@/api/shared/types/hono';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSubscriptionsHandler } from './getSubscriptions.handler';

describe('GET /api/subscriptions', () => {
  // ========== setup ==========
  const db = getDrizzleClient();

  const createTestClient = ({ db, sessionUser }: { db: DrizzleClient; sessionUser?: { id: string } }) => {
    const app = new Hono<HonoEnv>();
    app.use(async (c, next) => {
      c.set('db', db);
      c.set('sessionUser', sessionUser || null);
      await next();
    });
    const route = app.get('/api/subscriptions', ...getSubscriptionsHandler);
    return testClient(route);
  };

  const now = new Date('2025-01-01 00:00:00');

  beforeEach(async () => {
    await cleanupDB(db);
    vi.spyOn(DateUtils.create, 'now').mockReturnValue(now);
  });

  // ========== test ==========

  describe('getSubscriptionsHandler', () => {
    it('サブスクリプションを取得できること', async () => {
      // given
      const user = await createActiveUser(db)();
      const subscription1 = await createSubscription(db)({
        userId: user.id,
        name: 'Test Subscription',
        price: '1980.00',
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.modify.addDays(now, 1),
        expiredAt: DateUtils.modify.addDays(now, 30),
      });
      const subscription2 = await createSubscription(db)({
        userId: user.id,
        name: 'Test Subscription 2',
        price: '1980.00',
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: DateUtils.modify.addDays(now, 2),
        expiredAt: DateUtils.modify.addDays(now, 29),
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
});
