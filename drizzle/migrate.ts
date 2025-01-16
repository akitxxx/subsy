import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { getDrizzleClient } from '../src/lib/db/drizzle';
import drizzleConfig from './drizzle.config';

export const migrateDB = async () => {
  const db = getDrizzleClient();
  await migrate(db, { migrationsFolder: drizzleConfig.out as string });
};
