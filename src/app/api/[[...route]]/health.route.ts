import { healthHandler } from '@/api/features/health/health.handler';
import type { HonoEnv } from '@/api/shared/types/hono';
import { Hono } from 'hono';

const app = new Hono<HonoEnv>();

const route = app.get('/', ...healthHandler);

export default route;
