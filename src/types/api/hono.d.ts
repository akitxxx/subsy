import type { DrizzleClient } from '@/lib/db/drizzle';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export type HonoEnv = {
  Variables: {
    db: DrizzleClient;
    supabase: SupabaseClient;
    authUser: User | null;
  };
};
