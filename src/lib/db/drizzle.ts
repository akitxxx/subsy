import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const getDrizzleClient = () => {
  const dbUrl = process.env.DATABASE_URL;
  const client = postgres(dbUrl);
  return drizzle(client, { schema });
};

export type DrizzleClient = ReturnType<typeof getDrizzleClient>;
