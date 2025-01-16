import type { HonoEnv } from '@/types/api/hono';
import { type Context, Hono } from 'hono';
import { GetDashboardUsecase } from './get_dashboard.usecase';

const dashboard = new Hono();

dashboard.get('/', async (c: Context<HonoEnv>) => {
  const userId = '';
  try {
    const result = await GetDashboardUsecase.run({ db: c.var.db })({ userId });
    return c.json(result);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'データの取得に失敗しました' }, 500);
  }
});

export default dashboard;
