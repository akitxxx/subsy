import { sql } from 'drizzle-orm';
import { createFactory } from 'hono/factory';
import type { HonoEnv } from '@/api/shared/types/hono';

const factory = createFactory<HonoEnv>();

export const healthHandler = factory.createHandlers(async (c) => {
  const db = c.var.db;
  const timestamp = new Date().toISOString();

  try {
    await db.execute(sql`SELECT 1`);
    return c.json({ status: 'ok' as const, timestamp }, 200);
  } catch {
    return c.json({ status: 'error' as const, timestamp }, 503);
  }
});
