import { toErrorResponse } from '@/app/api/_shared/_error';
import type { HonoEnv } from '@/types/api/hono';
import { Hono } from 'hono';
import { GetCurrentUserUsecase } from './getCurrentUser.usecase';

const app = new Hono<HonoEnv>();

const route = app.get('/me', async (c) => {
  const db = c.var.db;
  const authUser = c.var.authUser;

  try {
    const result = await GetCurrentUserUsecase.run({ db, authUser })();
    return c.json(result.user, 200);
  } catch (e: unknown) {
    if (e instanceof Error) {
      const errorResponse = toErrorResponse(e);
      return c.json(errorResponse, errorResponse.error.status);
    }
    throw e;
  }
});

export default route;
