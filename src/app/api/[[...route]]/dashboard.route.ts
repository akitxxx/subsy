import { getDashboardHandler } from '@/api/features/dashboard/get-dashboard/getDashboard.handler';
import type { HonoEnv } from '@/api/shared/types/hono';
import { Hono } from 'hono';

const app = new Hono<HonoEnv>();

const route = app.get('/', ...getDashboardHandler);

export default route;
