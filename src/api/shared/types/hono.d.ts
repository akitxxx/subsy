import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { SessionUser } from '@/api/shared/types/sessionUser';

export type HonoEnv = {
  Variables: {
    db: DrizzleClient;
    sessionUser: SessionUser | null;
  };
};
