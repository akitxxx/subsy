import type { CreateOrUpdateSubscriptionInput } from '@/api/features/subscription/shared/createOrUpdateSubscriptionSchema';
import { type DrizzleClient, getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import { cleanupDB } from '@/api/shared/test/dbHelper';
import { createActiveUser } from '@/api/shared/test/testDataFactory';
import type { HonoEnv } from '@/api/shared/types/hono';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSubscriptionHandler } from './createSubscription.handler';

describe('POST /api/subscriptions', () => {
  // ========== setup ==========
  const db = getDrizzleClient();

  const createTestClient = ({ db, sessionUser }: { db: DrizzleClient; sessionUser?: { id: string } }) => {
    const app = new Hono<HonoEnv>();
    app.use(async (c, next) => {
      c.set('db', db);
      c.set('sessionUser', sessionUser || null);
      await next();
    });
    const route = app.post('/api/subscriptions', ...createSubscriptionHandler);
    return testClient(route);
  };

  const now = new Date('2025-01-01 00:00:00');

  beforeEach(async () => {
    await cleanupDB(db);
    vi.spyOn(DateUtils.create, 'now').mockReturnValue(now);
  });

  // ========== test ==========

  describe('createSubscriptionHandler', () => {
    it('サブスクリプションを作成できること', async () => {
      // given
      const user = await createActiveUser(db)();
      // when
      const input = {
        name: 'Test Subscription',
        price: '1980.00',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: now,
        cancelledAt: null,
        description: 'Test Subscription',
      } satisfies CreateOrUpdateSubscriptionInput;
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.subscriptions.$post({ json: input });
      // then
      expect(res.status).toBe(201);
      // output
      const output = await res.json();
      expect(output).toMatchObject({
        subscription: {
          ...input,
          startedAt: input.startedAt.toISOString(),
          nextPaymentAt: DateUtils.modify.addMonths(input.startedAt, 1).toISOString(),
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
});
