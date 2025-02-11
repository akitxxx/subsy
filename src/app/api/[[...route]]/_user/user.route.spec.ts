import { cleanupDB } from '@/test/api/dbHelper';
import { createActiveUser } from '@/test/api/testDataFactory';
import { createTestApp, setSessionUser } from '@/test/api/testHelper';
import { eq } from 'drizzle-orm';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import userRoute from './user.route';

describe('/api/users', () => {
  // ========== setup ==========
  const { db, app } = createTestApp();

  const createTestClient = () => {
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
      setSessionUser(app, { id: user.id });
      const client = createTestClient();
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
      setSessionUser(app, { id: user.id });
      const client = createTestClient();
      const input = { nickname: 'nickname updated' };
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
