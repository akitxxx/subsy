import type { DrizzleClient } from '@/lib/db/drizzle';
import type { User } from '@supabase/supabase-js';

export type HonoEnv = {
  Variables: {
    db: DrizzleClient;
    user: User | null;
  };
};
