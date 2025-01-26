import { toErrorResponse } from '@/app/api/_shared/_error';
import type { HonoEnv } from '@/types/api/hono';
import { type Context, Hono } from 'hono';
import { GetDashboardUsecase } from './getDashboard.usecase';

const app = new Hono<HonoEnv>();

const route = app.get('/', async (c: Context<HonoEnv>) => {
  const userId = c.req.param('userId');

  try {
    const result = await GetDashboardUsecase.run({ db: c.var.db })({ userId });
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
