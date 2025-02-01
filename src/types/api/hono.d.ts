import type { DrizzleClient } from '@/lib/db/drizzle';

export type HonoEnv = {
  Variables: {
    db: DrizzleClient;
    supabase: SupabaseClient;
  };
};
