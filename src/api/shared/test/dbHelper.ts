import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import { ALL_TABLES } from '@/api/shared/lib/db/schema';
import { sql } from 'drizzle-orm';

export const cleanupTables = async (db: DrizzleClient, tables: string[]) => {
  await db.execute(sql`TRUNCATE TABLE ${sql.raw(tables.join(', '))} CASCADE;`);
};

export const cleanupDB = async (db: DrizzleClient) => {
  await cleanupTables(db, ALL_TABLES);
};
