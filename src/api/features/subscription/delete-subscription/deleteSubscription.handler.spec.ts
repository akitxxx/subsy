import { type DrizzleClient, getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import { cleanupDB } from '@/api/shared/test/dbHelper';
import { createActiveUser, createSubscription } from '@/api/shared/test/testDataFactory';
import type { HonoEnv } from '@/api/shared/types/hono';
import { DateUtils } from '@/shared/utils/date.util';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteSubscriptionHandler } from './deleteSubscription.handler';

describe('DELETE /api/subscriptions/:id', () => {
  // ========== setup ==========
  const db = getDrizzleClient();

  const createTestClient = ({ db, sessionUser }: { db: DrizzleClient; sessionUser?: { id: string } }) => {
    const app = new Hono<HonoEnv>();
    app.use(async (c, next) => {
      c.set('db', db);
      c.set('sessionUser', sessionUser || null);
      await next();
    });
    const route = app.delete('/api/subscriptions/:id', ...deleteSubscriptionHandler);
    return testClient(route);
  };

  const now = new Date('2025-01-01 00:00:00');

  beforeEach(async () => {
    await cleanupDB(db);
    vi.spyOn(DateUtils.create, 'now').mockReturnValue(now);
  });

  // ========== test ==========

  describe('deleteSubscriptionHandler', () => {
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
