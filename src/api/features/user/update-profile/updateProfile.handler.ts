import { UserRepository } from '@/api/shared/domain/user/user.repository';
import { toErrorResponse } from '@/api/shared/error';
import { mapUserEntityToViewModel } from '@/api/shared/presentation/view-model/user/mapUserEntityToViewModel';
import type { HonoEnv } from '@/api/shared/types/hono';
import { checkSessionUser } from '@/api/shared/utils/checkSessionUser';
import { zValidator } from '@hono/zod-validator';
import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { UpdateProfileUsecase } from './updateProfile.usecase';

const factory = createFactory<HonoEnv>();

const inputSchema = z.object({
  nickname: z.string().min(1),
});

export const updateProfileHandler = factory.createHandlers(zValidator('json', inputSchema), async (c) => {
  try {
    const sessionUser = checkSessionUser(c);
    const db = c.var.db;
    const input = inputSchema.parse(await c.req.json());

    const output = await UpdateProfileUsecase.run({ sessionUser, userRepository: UserRepository({ db }) })(input);
    return c.json(mapUserEntityToViewModel(output.user), 200);
  } catch (e: unknown) {
    if (e instanceof Error) {
      const errorResponse = toErrorResponse(e);
      return c.json(errorResponse, errorResponse.error.status);
    }
    throw e;
  }
});
