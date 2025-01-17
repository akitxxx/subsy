import { getDrizzleClient } from '@/lib/db/drizzle';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../src/lib/db/schema';
import drizzleConfig from './drizzle.config';
import { migrateDB } from './migrate';

export const resetDatabase = async () => {
  // dotenvをすでに読み込んでいる前提
  const { DATABASE_URL } = process.env;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  console.log('Resetting database:', DATABASE_URL);
  const db = postgres(DATABASE_URL, { max: 1 });

  try {
    // スキーマを削除して再作成
    await db`DROP SCHEMA IF EXISTS public CASCADE`;
    await db`DROP SCHEMA IF EXISTS drizzle CASCADE`;
    await db`CREATE SCHEMA public`;

    // マイグレーションを実行してテーブルを再作成
    const client = getDrizzleClient();
    await migrate(client, { migrationsFolder: drizzleConfig.out as string });
    console.log('✅ Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    await db.end();
    process.exit(0);
  }
};

resetDatabase();
