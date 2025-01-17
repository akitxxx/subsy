import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const getDrizzleClient = () => {
  // dotenvをすでに読み込んでいる前提
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  const client = postgres(dbUrl);

  return drizzle(client, { schema });
};

export type DrizzleClient = ReturnType<typeof getDrizzleClient>;
