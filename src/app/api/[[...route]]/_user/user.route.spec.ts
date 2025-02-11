import { type DrizzleClient, getDrizzleClient } from '@/lib/db/drizzle';
import { cleanupDB } from '@/test/api/dbHelper';
import { createActiveUser } from '@/test/api/testDataFactory';
import type { HonoEnv } from '@/types/api/hono';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import userRoute from './user.route';

describe('/api/users', () => {
  // ========== setup ==========
  const db = getDrizzleClient();

  const createTestClient = ({ db, sessionUser }: { db: DrizzleClient; sessionUser?: { id: string } }) => {
    const app = new Hono<HonoEnv>();
    app.use(async (c, next) => {
      c.set('db', db);
      c.set('sessionUser', sessionUser || null);
      await next();
    });
    const route = app.route('/api/users', userRoute);
    return testClient(route);
  };

  beforeEach(async () => {
    // テストデータをクリーンアップ
    await cleanupDB(db);
  });

  // ========== test ==========

  describe('GET /api/users/me', () => {
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
        nickname: user.nickname,
      });
    });
  });

  describe('PATCH /me', () => {
    it('ニックネームを更新できる', async () => {
      // given
      const user = await createActiveUser(db)();
      // when
      const input = { nickname: 'nickname updated' };
      const client = createTestClient({ db, sessionUser: { id: user.id } });
      const res = await client.api.users.me.$patch({ json: input });
      // then
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toMatchObject({
        id: user.id,
        nickname: input.nickname,
      });

      // DBが更新されていることを確認
      const updatedUser = await db.query.usersTable.findFirst({
        where: (users) => eq(users.id, user.id),
      });
      expect(updatedUser?.nickname).toBe(input.nickname);
    });
  });
});
