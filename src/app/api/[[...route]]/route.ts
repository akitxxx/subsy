import { NotFoundError, toErrorResponse } from '@/api/shared/error';
import { getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import { userAuthsTable, usersTable } from '@/api/shared/lib/db/schema';
import type { HonoEnv } from '@/api/shared/types/hono';
import { createSupabaseHono } from '@/shared/lib/supabase/supabase';
import { eq } from 'drizzle-orm';
import { type Context, Hono } from 'hono';
import { handle } from 'hono/vercel';

import auth from './auth.route';
import dashboard from './dashboard.route';
import line from './line.route';
import subscription from './subscription.route';
import user from './user.route';

const app = new Hono<HonoEnv>().basePath('/api');

// context
app.use(async (c: Context<HonoEnv>, next) => {
  // DB
  const db = getDrizzleClient();
  c.set('db', db);

  // Supabase
  const supabase = await createSupabaseHono(c);
  c.set('supabase', supabase);

  // session user
  const authUser = (await supabase.auth.getUser()).data.user;
  if (authUser) {
    // DB userレコードを取得
    const [user] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .innerJoin(userAuthsTable, eq(usersTable.id, userAuthsTable.userId))
      .where(eq(userAuthsTable.providerId, authUser.id))
      .limit(1);
    c.set('sessionUser', user || null);
  }

  await next();
});

// error handler
app.onError((err, c) => {
  console.error(err);
  const errorResponse = toErrorResponse(err);
  return c.json(errorResponse, errorResponse.error.status);
});

app.notFound((c) => {
  const errorResponse = toErrorResponse(new NotFoundError('ページが見つかりません'));
  return c.json(errorResponse, errorResponse.error.status);
});

// routing
const route = app
  .route('/dashboard', dashboard)
  .route('/auth', auth)
  .route('/users', user)
  .route('/subscriptions', subscription)
  .route('/line', line);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof route;
