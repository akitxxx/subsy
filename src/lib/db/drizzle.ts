import { drizzle } from 'drizzle-orm/d1';
import type { Context } from 'hono';

export const getDrizzleClient = (c: Context) => {
  const db = c.env.DB;
  return drizzle(db);
};
