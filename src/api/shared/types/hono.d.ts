import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { SessionUser } from '@/api/shared/types/sessionUser';
import type { SupabaseClient } from '@supabase/supabase-js';

export type HonoEnv = {
  Variables: {
    db: DrizzleClient;
    supabase: SupabaseClient;
    sessionUser: SessionUser | null;
  };
};
