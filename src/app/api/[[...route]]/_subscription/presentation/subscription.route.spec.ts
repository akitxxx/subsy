import { type DrizzleClient, getDrizzleClient } from '@/lib/db/drizzle';
import { cleanupDB } from '@/test/api/dbHelper';
import { createActiveUser } from '@/test/api/testDataFactory';
import type { HonoEnv } from '@/types/api/hono';
import { SubscriptionCycleEnum } from '@/types/enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from '@/types/enums/subscription/subscriptionStatus.enum';
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

  describe('POST /', () => {
    it('サブスクリプションを作成できること', async () => {
      // given
      const user = await createActiveUser(db)();
      // when
      const input = {
        name: 'Test Subscription',
        price: '1980.00',
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date().toISOString(),
        nextPaymentAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Test Subscription',
        status: SubscriptionStatusEnum.Active,
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
        nextPaymentAt: new Date(input.nextPaymentAt),
      });
    });
  });
});
