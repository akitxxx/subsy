import { Hono } from 'hono';
import { GetDashboardUsecase } from './get_dashboard.usecase';

const dashboard = new Hono();

dashboard.get('/', async (c) => {
  try {
    const result = await GetDashboardUsecase.run();
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'データの取得に失敗しました' }, 500);
  }
});

export default dashboard;
