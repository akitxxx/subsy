import { cleanupDB } from '@/test/api/dbHelper';
import { createActiveUser } from '@/test/api/testDataFactory';
import { createTestApp } from '@/test/api/testHelper';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import user from './user.route';

describe('/api/users', () => {
  // ========== setup ==========
  const { db, client } = createTestApp({ routes: [{ path: '/api/users', route: user }] });

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
      const res = await client({ sessionUser: { id: user.id } }).$get('/api/users/me');
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
      const res = await client({ sessionUser: { id: user.id } }).$patch('/api/users/me', input);
      // then
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
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
