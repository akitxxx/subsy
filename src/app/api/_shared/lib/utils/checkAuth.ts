import { UnauthorizedError } from '@/app/api/_shared/lib/error';
import type { HonoEnv } from '@/types/api/hono';
import type { User } from '@supabase/supabase-js';
import type { Context } from 'hono';

export const checkAuth = (c: Context<HonoEnv>): User => {
  const authUser = c.var.sessionUser;
  if (!authUser) throw new UnauthorizedError();
  return authUser;
};
