import { SubscriptionRepository } from '@/app/api/_shared/domain/subscription/subscription.repository';
import { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { toErrorResponse } from '@/app/api/_shared/lib/error';
import { checkSessionUser } from '@/app/api/_shared/lib/utils/checkSessionUser';
import { mapSubscriptionEntitiesToViewModels } from '@/app/api/_shared/presentation/view-model/subscription/mapSubscriptionEntityToViewModel';
import type { HonoEnv } from '@/types/api/hono';
import { type Context, Hono } from 'hono';
import { GetDashboardUsecase } from '../application/getDashboard.usecase';

const app = new Hono<HonoEnv>();

const route = app.get('/', async (c: Context<HonoEnv>) => {
  try {
    const sessionUser = checkSessionUser(c);
    const db = c.var.db;

    const result = await GetDashboardUsecase.run({
      sessionUser,
      subscriptionRepository: SubscriptionRepository({ db }),
    })();

    return c.json(
      {
        totalThisMonth: result.totalThisMonth,
        upcomingSubscriptions: mapSubscriptionEntitiesToViewModels(result.upcomingSubscriptions),
      },
      200,
    );
  } catch (e) {
    if (e instanceof Error) {
      const errorResponse = toErrorResponse(e);
      return c.json(errorResponse, errorResponse.error.status);
    }
    throw e;
  }
});

export default route;
