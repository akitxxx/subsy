import { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { toErrorResponse } from '@/app/api/_shared/lib/error';
import type { HonoEnv } from '@/types/api/hono';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { checkSessionUser } from '../../../_shared/lib/utils/checkSessionUser';
import { GetCurrentUserUsecase } from '../application/getCurrentUser.usecase';
import { UpdateProfileUsecase } from '../application/updateProfile.usecase';

const app = new Hono<HonoEnv>();

const route = app
  .get('/me', async (c) => {
    const sessionUser = checkSessionUser(c);
    const db = c.var.db;

    try {
      const result = await GetCurrentUserUsecase.run({ db, sessionUser, userRepository: UserRepository({ db }) })();
      return c.json(result.user, 200);
    } catch (e: unknown) {
      if (e instanceof Error) {
        const errorResponse = toErrorResponse(e);
        return c.json(errorResponse, errorResponse.error.status);
      }
      throw e;
    }
  })
  .patch('/me', zValidator('json', z.object({ nickname: z.string() })), async (c) => {
    const sessionUser = checkSessionUser(c);
    const db = c.var.db;
    const input = await c.req.json<{ nickname: string }>();

    try {
      const output = await UpdateProfileUsecase.run({ sessionUser, userRepository: UserRepository({ db }) })(input);
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
