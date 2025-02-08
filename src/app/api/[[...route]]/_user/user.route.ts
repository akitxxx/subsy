import { toErrorResponse } from '@/app/api/_shared/_error';
import type { HonoEnv } from '@/types/api/hono';
import { Hono } from 'hono';
import { checkAuth } from '../../_shared/_lib/_utils/checkAuth';
import { GetCurrentUserUsecase } from './getCurrentUser.usecase';
import { UpdateProfileUsecase } from './updateProfile.usecase';

const app = new Hono<HonoEnv>();

const route = app
  .get('/me', async (c) => {
    const authUser = checkAuth(c.var.authUser);

    const db = c.var.db;

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
  })
  .patch('/me', async (c) => {
    const authUser = checkAuth(c.var.authUser);

    const db = c.var.db;
    const { nickname } = await c.req.json<{ nickname: string }>();

    try {
      const output = await UpdateProfileUsecase.run({ db, authUser })({ nickname });
      return c.json(output.user, 200);
    } catch (e: unknown) {
      if (e instanceof Error) {
        const errorResponse = toErrorResponse(e);
        return c.json(errorResponse, errorResponse.error.status);
      }
      throw e;
    }
  });

export default route;
