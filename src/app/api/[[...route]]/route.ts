import { getDrizzleClient } from '@/lib/db/drizzle';
import type { HonoEnv } from '@/types/api/hono';
import { type Context, Hono } from 'hono';
import { handle } from 'hono/vercel';
import auth from './_auth/auth.route';
import dashboard from './_dashboard/dashboard.route';

const app = new Hono<HonoEnv>().basePath('/api');

// context
app.use(async (c: Context<HonoEnv>, next) => {
  const db = getDrizzleClient();
  c.set('db', db);
  await next();
});

// routing
const route = app.route('/dashboard', dashboard).route('/auth', auth);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof route;
