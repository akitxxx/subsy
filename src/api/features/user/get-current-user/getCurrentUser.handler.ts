import { Effect } from 'effect';
import { createFactory } from 'hono/factory';
import { UserRepository } from '@/api/shared/domain/user/user.repository';
import { runEffect } from '@/api/shared/lib/effect/runEffect';
import { mapUserEntityToViewModel } from '@/api/shared/presentation/view-model/user/mapUserEntityToViewModel';
import type { HonoEnv } from '@/api/shared/types/hono';
import { checkSessionUser } from '@/api/shared/utils/checkSessionUser';
import { GetCurrentUserUsecase } from './getCurrentUser.usecase';

const factory = createFactory<HonoEnv>();

export const getCurrentUserHandler = factory.createHandlers(async (c) => {
  const sessionUser = checkSessionUser(c);
  const db = c.var.db;

  const effect = GetCurrentUserUsecase.run({
    db,
    sessionUser,
    userRepository: UserRepository.new({ db }),
  })().pipe(Effect.map((result) => c.json(mapUserEntityToViewModel(result.user), 200)));

  return runEffect(effect, c);
});
