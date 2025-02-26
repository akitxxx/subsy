import { UserRepository } from '@/api/shared/domain/user/user.repository';
import { toErrorResponse } from '@/api/shared/error';
import { mapUserEntityToViewModel } from '@/api/shared/presentation/view-model/user/mapUserEntityToViewModel';
import type { HonoEnv } from '@/api/shared/types/hono';
import { checkSessionUser } from '@/api/shared/utils/checkSessionUser';
import { createFactory } from 'hono/factory';
import { GetCurrentUserUsecase } from './getCurrentUser.usecase';

const factory = createFactory<HonoEnv>();

export const getCurrentUserHandler = factory.createHandlers(async (c) => {
  try {
    const sessionUser = checkSessionUser(c);
    const db = c.var.db;

    const result = await GetCurrentUserUsecase.run({ db, sessionUser, userRepository: UserRepository({ db }) })();
    return c.json(mapUserEntityToViewModel(result.user), 200);
  } catch (e: unknown) {
    if (e instanceof Error) {
      const errorResponse = toErrorResponse(e);
      return c.json(errorResponse, errorResponse.error.status);
    }
    throw e;
  }
});
