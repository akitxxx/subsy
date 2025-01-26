import { handleError } from '@/app/api/_shared/error/handleError';
import type { HonoEnv } from '@/types/api/hono';
import { type Context, Hono } from 'hono';
import { GetCurrentUserUsecase } from './getCurrentUser.usecase';

const app = new Hono<HonoEnv>();

const route = app.get('/me', async (c: Context<HonoEnv>) => {
  const userId = '12345678-1234-1234-1234-123456789012';

  try {
    const result = await GetCurrentUserUsecase.run({ db: c.var.db })({
      userId,
    });
    return c.json(result.user, 200);
  } catch (e) {
    return handleError(e, c);
  }
});

export default route;
