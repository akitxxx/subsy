import type { CreateOrUpdateSubscriptionInput } from '@/api/features/subscription/shared/createOrUpdateSubscriptionSchema';
import { type DrizzleClient, getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import { cleanupDB } from '@/api/shared/test/dbHelper';
import { createActiveUser, createSubscription } from '@/api/shared/test/testDataFactory';
import type { HonoEnv } from '@/api/shared/types/hono';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateSubscriptionHandler } from './updateSubscription.handler';

describe('PATCH /api/subscriptions/:id', () => {
  // ========== setup ==========
  const db = getDrizzleClient();

  const createTestClient = ({ db, sessionUser }: { db: DrizzleClient; sessionUser?: { id: string } }) => {
    const app = new Hono<HonoEnv>();
    app.use(async (c, next) => {
      c.set('db', db);
      c.set('sessionUser', sessionUser || null);
      await next();
    });
    const route = app.patch('/api/subscriptions/:id', ...updateSubscriptionHandler);
    return testClient(route);
  };

  const now = new Date('2025-01-01 00:00:00');

  beforeEach(async () => {
    await cleanupDB(db);
    vi.spyOn(DateUtils.create, 'now').mockReturnValue(now);
  });

  // ========== test ==========

  describe('updateSubscriptionHandler', () => {
    it('サブスクリプションを更新できること', async () => {
      // given
      const user = await createActiveUser(db)();
      const subscription = await createSubscription(db)({
        userId: user.id,
        name: 'Old Subscription',
        price: '1980.00',
        currency: CurrencyEnum.Jpy,
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
        currency: CurrencyEnum.Usd,
        cycle: SubscriptionCycleEnum.ThreeMonths,
        startedAt: new Date('2024-10-01 00:00:00'),
        cancelledAt: new Date('2025-01-01 00:00:01'),
        description: 'New Description',
      } satisfies CreateOrUpdateSubscriptionInput;
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
          startedAt: new Date(input.startedAt).toISOString(),
          cancelledAt: new Date(input.cancelledAt).toISOString(),
          nextPaymentAt: new Date('2025-04-01 00:00:00').toISOString(),
          expiredAt: DateUtils.modify.addMilliseconds(new Date('2025-04-01 00:00:00'), -1).toISOString(),
        },
      });
      // DB
      const subscriptions = await db.query.subscriptionsTable.findMany();
      expect(subscriptions.length).toBe(1);
      expect(subscriptions[0]).toMatchObject({
        ...input,
        expiredAt: DateUtils.modify.addMilliseconds(new Date('2025-04-01 00:00:00'), -1),
      });
    });
  });
});
