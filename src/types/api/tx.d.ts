import type { DrizzleClient } from '@/lib/db/drizzle';
import type { PgTransaction } from 'drizzle-orm/pg-core';

export type Tx = PgTransaction<TQueryResult, TFullSchema, TSchema>;
