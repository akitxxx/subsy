import type { DrizzleClient } from '@/lib/db/drizzle';
import type { SessionUser } from '@/types/api/sessionUser';
import type { SupabaseClient } from '@supabase/supabase-js';

export type HonoEnv = {
  Variables: {
    db: DrizzleClient;
    supabase: SupabaseClient;
    sessionUser: SessionUser | null;
  };
};
