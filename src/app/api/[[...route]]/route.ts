import { NotFoundError, toErrorResponse } from '@/app/api/_shared/_error';
import { getDrizzleClient } from '@/lib/db/drizzle';
import { createSupabaseServerClient } from '@/lib/supabase/supabase';
import type { HonoEnv } from '@/types/api/hono';
import { type Context, Hono } from 'hono';
import { handle } from 'hono/vercel';
import auth from './_auth/auth.route';
import dashboard from './_dashboard/dashboard.route';
import user from './_user/user.route';
const app = new Hono<HonoEnv>().basePath('/api');

// context
app.use(async (c: Context<HonoEnv>, next) => {
  // DB
  const db = getDrizzleClient();
  c.set('db', db);

  // Supabase
  const supabase = await createSupabaseServerClient();
  const user = (await supabase.auth.getUser()).data.user;
  c.set('user', user);

  await next();
});

// error handler
app.onError((err, c) => {
  console.error(err);
  const errorResponse = toErrorResponse(err);
  return c.json(errorResponse, errorResponse.error.status);
});

app.notFound((c) => {
  const errorResponse = toErrorResponse(
    new NotFoundError('ページが見つかりません'),
  );
  return c.json(errorResponse, errorResponse.error.status);
});

// routing
const route = app
  .route('/dashboard', dashboard)
  .route('/auth', auth)
  .route('/users', user);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof route;
