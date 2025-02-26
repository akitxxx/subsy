import { UnauthorizedError } from '@/api/shared/error';
import type { HonoEnv } from '@/api/shared/types/hono';
import type { SessionUser } from '@/api/shared/types/sessionUser';
import type { Context } from 'hono';

export const checkSessionUser = (c: Context<HonoEnv>): Pick<SessionUser, 'id'> => {
  const sessionUser = c.var.sessionUser;
  if (!sessionUser) throw new UnauthorizedError();
  return sessionUser;
};
