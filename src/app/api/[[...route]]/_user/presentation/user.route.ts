import { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { toErrorResponse } from '@/app/api/_shared/lib/error';
import { checkSessionUser } from '@/app/api/_shared/lib/utils/checkSessionUser';
import { parseUserViewModel } from '@/app/api/_shared/presentation/view-model/parseUserViewModel';
import type { HonoEnv } from '@/types/api/hono';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { GetCurrentUserUsecase } from '../application/getCurrentUser.usecase';
import { UpdateProfileUsecase } from '../application/updateProfile.usecase';
import { updateProfileInputSchema } from './input/updateProfile.input';

const app = new Hono<HonoEnv>();
const route = app
  .get('/me', async (c) => {
    try {
      const sessionUser = checkSessionUser(c);
      const db = c.var.db;

      const result = await GetCurrentUserUsecase.run({ db, sessionUser, userRepository: UserRepository({ db }) })();
      return c.json(parseUserViewModel(result.user), 200);
    } catch (e: unknown) {
      if (e instanceof Error) {
        const errorResponse = toErrorResponse(e);
        return c.json(errorResponse, errorResponse.error.status);
      }
      throw e;
    }
  })
  .patch('/me', zValidator('json', updateProfileInputSchema), async (c) => {
    try {
      const sessionUser = checkSessionUser(c);
      const db = c.var.db;
      const input = updateProfileInputSchema.parse(await c.req.json());

      const output = await UpdateProfileUsecase.run({ sessionUser, userRepository: UserRepository({ db }) })(input);
      return c.json(parseUserViewModel(output.user), 200);
    } catch (e: unknown) {
      if (e instanceof Error) {
        const errorResponse = toErrorResponse(e);
        return c.json(errorResponse, errorResponse.error.status);
      }
      throw e;
    }
  });

export default route;
