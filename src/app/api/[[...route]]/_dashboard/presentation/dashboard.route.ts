import { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { toErrorResponse } from '@/app/api/_shared/lib/error';
import type { HonoEnv } from '@/types/api/hono';
import { type Context, Hono } from 'hono';
import { checkSessionUser } from '../../../_shared/lib/utils/checkSessionUser';
import { GetDashboardUsecase } from '../application/getDashboard.usecase';

const app = new Hono<HonoEnv>();

const route = app.get('/', async (c: Context<HonoEnv>) => {
  try {
    const sessionUser = checkSessionUser(c);
    const db = c.var.db;

    const result = await GetDashboardUsecase.run({ db, sessionUser, userRepository: UserRepository({ db }) })();
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
