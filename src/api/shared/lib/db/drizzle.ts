import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { configureNeonLocal } from './neonLocal';
import * as schema from './schema';

// ローカル環境では WebSocket プロキシ経由で PostgreSQL に接続
if (process.env.NODE_ENV !== 'production') {
  configureNeonLocal();
}

// WebSocket 接続は TCP より高コストなため、モジュールレベルでキャッシュ
let cached: DrizzleClient | null = null;

export const getDrizzleClient = () => {
  if (cached) return cached;

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString: dbUrl });
  cached = drizzle(pool, { schema });
  return cached;
};

export type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;
