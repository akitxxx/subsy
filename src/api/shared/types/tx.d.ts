import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { PgTransaction } from 'drizzle-orm/pg-core';

export type Tx = PgTransaction<TQueryResult, TFullSchema, TSchema>;
