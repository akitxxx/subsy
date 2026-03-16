import { type DrizzleClient, getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import { cleanupDB } from '@/api/shared/test/dbHelper';
import { createActiveUser } from '@/api/shared/test/testDataFactory';
import type { HonoEnv } from '@/api/shared/types/hono';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { getCurrentUserHandler } from './getCurrentUser.handler';

describe('GET /api/users/me', () => {
  // ========== setup ==========
  const db = getDrizzleClient();

  const createTestClient = ({ db, sessionUser }: { db: DrizzleClient; sessionUser?: { id: string } }) => {
    const app = new Hono<HonoEnv>();
    app.use(async (c, next) => {
      c.set('db', db);
      c.set('sessionUser', sessionUser || null);
      await next();
    });
    const route = app.get('/api/users/me', ...getCurrentUserHandler);
    return testClient(route);
  };

  beforeEach(async () => {
    // テストデータをクリーンアップ
    await cleanupDB(db);
  });

  // ========== test ==========

  describe('getCurrentUserHandler', () => {
    it('ユーザー情報を取得できる', async () => {
      // given
      const user = await createActiveUser(db)();
      // when
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.users.me.$get();
      // then
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toMatchObject({
        id: user.id,
      });
    });
  });
});
