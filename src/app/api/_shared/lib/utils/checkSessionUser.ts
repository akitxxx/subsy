import { UnauthorizedError } from '@/app/api/_shared/lib/error';
import type { HonoEnv } from '@/types/api/hono';
import type { SessionUser } from '@/types/api/sessionUser';
import type { Context } from 'hono';

export const checkSessionUser = (c: Context<HonoEnv>): Pick<SessionUser, 'id'> => {
  const sessionUser = c.var.sessionUser;
  if (!sessionUser) throw new UnauthorizedError();
  return sessionUser;
};
