import { userAuthsTable, usersTable } from '@/lib/db/schema';
import { createMockApp, createTestApp } from '@/test/api/testHelper';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import auth from './auth.route';

describe('/api/auth', () => {
  const { db, client } = createTestApp(auth);

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

  describe('POST /google/callback', () => {
    it('新規ユーザーの場合、ユーザーを作成してトークンを返す', async () => {
      const credential = 'valid_credential';
      const res = await client.$post('/google/callback', { credential });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('userId');
      expect(data).toHaveProperty('nickname');

      // セッションクッキーが設定されていることを確認
      const cookies = res.headers.get('set-cookie');
      expect(cookies).toContain('session=');
    });

    it('既存ユーザーの場合、トークンを返す', async () => {
      // 既存のユーザー認証情報を作成
      await db.insert(userAuthsTable).values({
        userId: testUser.id,
        provider: 'google',
        providerId: 'existing_google_id',
      });

      const credential = 'valid_credential';
      const res = await client.$post('/google/callback', { credential });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        userId: testUser.id,
        nickname: testUser.nickname,
      });

      // セッションクッキーが設定されていることを確認
      const cookies = res.headers.get('set-cookie');
      expect(cookies).toContain('session=');
    });

    it('無効なクレデンシャルの場合、401エラーを返す', async () => {
      const credential = 'invalid_credential';
      const res = await client.$post('/google/callback', { credential });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({
        error: expect.any(String),
      });
    });

    it('DBエラー時は500エラーを返す', async () => {
      const { client: mockClient } = createMockApp(auth, {
        insert: () => {
          throw new Error('DB接続エラー');
        },
      });

      const credential = 'valid_credential';
      const res = await mockClient.$post('/google/callback', { credential });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({
        error: '認証に失敗しました',
      });
    });
  });
});
