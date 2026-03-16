import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// ローカル環境では WebSocket プロキシ経由で PostgreSQL に接続
if (process.env.NODE_ENV !== 'production') {
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
  neonConfig.wsProxy = () => '127.0.0.1:5488/v1';
}

export const getDrizzleClient = () => {
  // dotenvをすでに読み込んでいる前提
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString: dbUrl });

  return drizzle(pool, { schema });
};

export type DrizzleClient = ReturnType<typeof getDrizzleClient>;
