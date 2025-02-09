import { toErrorResponse } from '@/app/api/_shared/lib/error';
import type { HonoEnv } from '@/types/api/hono';
import { type Context, Hono } from 'hono';
import { checkAuth } from '../../_shared/lib/utils/checkAuth';
import { GetDashboardUsecase } from './getDashboard.usecase';

const app = new Hono<HonoEnv>();

const route = app.get('/', async (c: Context<HonoEnv>) => {
  const authUser = checkAuth(c);
  const db = c.var.db;

  try {
    const result = await GetDashboardUsecase.run({ db, authUser })({});
    return c.json(result, 200);
  } catch (e) {
    if (e instanceof Error) {
      const errorResponse = toErrorResponse(e);
      return c.json(errorResponse, errorResponse.error.status);
    }
    throw e;
  }
});

export default route;
