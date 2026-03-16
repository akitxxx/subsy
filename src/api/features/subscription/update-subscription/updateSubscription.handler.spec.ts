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
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
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

  // 日付リテラルはDateUtils.create.fromISOStringを使って作成
  const now = DateUtils.create.fromISOString('2025-01-01T00:00:00.000Z');

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
      const startedAt = DateUtils.create.fromISOString('2024-10-01T00:00:00.000Z');
      const cancelledAt = DateUtils.create.fromISOString('2025-01-01T00:00:01.000Z');

      const input = {
        name: 'New Subscription',
        price: '2980.00',
        currency: CurrencyEnum.Usd,
        cycle: SubscriptionCycleEnum.ThreeMonths,
        startedAt,
        cancelledAt,
        description: 'New Description',
      } satisfies CreateOrUpdateSubscriptionInput;

      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.subscriptions[':id'].$patch({
        param: { id: subscription.id },
        json: input,
        // eslint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- Hono RPC の型推論がうまくいかないため
      } as unknown as { param: { id: string }; json: typeof input });
      // then
      expect(res.status).toBe(200);

      // 日付データの準備
      const expectedStartedAt = DateUtils.format.toISOString(input.startedAt);
      const expectedCancelledAt = DateUtils.format.toISOString(input.cancelledAt);

      const nextPaymentAtDate = DateUtils.create.fromISOString('2025-04-01T00:00:00.000Z');
      const expiredAtDate = DateUtils.create.fromISOString('2025-03-31T23:59:59.999Z');

      // output
      const output = await res.json();
      expect(output).toMatchObject({
        subscription: {
          ...input,
          startedAt: expectedStartedAt,
          cancelledAt: expectedCancelledAt,
          nextPaymentAt: nextPaymentAtDate.toISOString(),
          expiredAt: expiredAtDate.toISOString(),
        },
      });

      // DB
      const subscriptions = await db.query.subscriptionsTable.findMany();
      expect(subscriptions.length).toBe(1);

      // DB検証 - DBから返されるデータはDateオブジェクトのため、期待値もDateオブジェクトで比較
      expect(subscriptions[0]).toMatchObject({
        ...input,
        expiredAt: expiredAtDate,
      });

      // nextPaymentAtとexpiredAtの関係を検証
      // DateUtilsを使用して統一性を高めつつ、タイムスタンプ比較を行う
      const timeDifference = nextPaymentAtDate.getTime() - expiredAtDate.getTime();
      expect(timeDifference).toBe(1); // 1ミリ秒の差があることを確認
    });
  });
});
