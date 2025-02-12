import { getDrizzleClient } from '@/lib/db/drizzle';
import type { DrizzleClient } from '@/lib/db/drizzle';
import { subscriptionsTable, usersTable } from '@/lib/db/schema';
import { cleanupDB } from '@/test/api/dbHelper';
import { createActiveUser } from '@/test/api/testDataFactory';
import type { HonoEnv } from '@/types/api/hono';
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import dashboardRoute from './dashboard.route';

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

  beforeEach(async () => {
    // テストデータをクリーンアップ
    await cleanupDB(db);
  });

  // ========== test ==========

  describe('GET /', () => {
    it('dashboard情報を返す', async () => {
      // given
      const user = await createActiveUser(db)();
      // when
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.dashboard.$get();
      // then
      expect(res.status).toBe(200);
      const data = await res.json();
    });
  });
});
