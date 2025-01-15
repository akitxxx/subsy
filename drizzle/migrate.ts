import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../src/db/drizzle';
import drizzleConfig from './drizzle.config';

export const migrateDB = async () => {
  await migrate(db, { migrationsFolder: drizzleConfig.out as string });
};
