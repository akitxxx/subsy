import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from 'ws';
import { configureNeonLocal } from '../src/api/shared/lib/db/neonLocal';
import drizzleConfig from './drizzle.config';

configureNeonLocal({ wsConstructor: ws });

export const resetDatabase = async () => {
  // dotenvをすでに読み込んでいる前提
  const { DATABASE_URL } = process.env;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  if (!drizzleConfig.out) {
    throw new Error('drizzle config out is not defined');
  }

  console.log('Resetting database:', DATABASE_URL);
  const pool = new Pool({ connectionString: DATABASE_URL, max: 1 });

  try {
    // スキーマを削除して再作成
    await pool.query('DROP SCHEMA IF EXISTS public CASCADE');
    await pool.query('DROP SCHEMA IF EXISTS drizzle CASCADE');
    await pool.query('CREATE SCHEMA public');

    // マイグレーションを実行してテーブルを再作成
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: drizzleConfig.out });
    console.log('✅ Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

resetDatabase();
