import { userAuthsTable, usersTable } from '@/lib/db/schema';
import { type TestClient, createMockApp, createTestApp } from '@/test/api/testHelper';
import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import user from './user.route';

describe('/api/user', () => {
  const { db, client } = createTestApp(user);

  const testUser = {
    id: '12345678-1234-1234-1234-123456789012',
    nickname: 'テストユーザー',
  };

  beforeAll(async () => {
    // テストユーザーを作成
    await db.insert(usersTable).values(testUser);
  });

  beforeEach(async () => {
    // テストデータをクリーンアップ
    await db.delete(userAuthsTable).where(sql`true`);
  });

  afterAll(async () => {
    // テストデータをクリーンアップ
    await db.delete(userAuthsTable).where(sql`true`);
    await db.delete(usersTable).where(sql`true`);
  });

  describe('GET /me', () => {
    it('ユーザー情報を取得できる', async () => {
      const res = await client.$get('/me');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        id: testUser.id,
        nickname: testUser.nickname,
      });
    });

    it('DBエラー時は500エラーを返す', async () => {
      const { client: mockClient } = createMockApp(user, {
        select: () => {
          throw new Error('DB接続エラー');
        },
      });

      const res = await mockClient.$get('/me');

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({
        error: 'ユーザー情報の取得に失敗しました',
      });
    });
  });

  describe('PATCH /me', () => {
    it('ニックネームを更新できる', async () => {
      const newNickname = '更新後のニックネーム';
      const res = await client.$patch('/me', { nickname: newNickname });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        id: testUser.id,
        nickname: newNickname,
      });

      // DBが更新されていることを確認
      const updatedUser = await db.query.usersTable.findFirst({
        where: (users) => eq(users.id, testUser.id),
      });
      expect(updatedUser?.nickname).toBe(newNickname);
    });

    it('DBエラー時は500エラーを返す', async () => {
      const { client: mockClient } = createMockApp(user, {
        update: () => {
          throw new Error('DB接続エラー');
        },
      });

      const res = await mockClient.$patch('/me', { nickname: '新しいニックネーム' });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({
        error: 'プロフィールの更新に失敗しました',
      });
    });
  });
});
