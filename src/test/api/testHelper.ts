import { getDrizzleClient } from '@/lib/db/drizzle';
import type { HonoEnv } from '@/types/api/hono';
import type { SessionUser } from '@/types/api/sessionUser';
import { Hono } from 'hono';

export type RouteConfig = {
  path: string;
  route: Hono<HonoEnv>;
};

// hono appを作成
export const createTestApp = () => {
  const app = new Hono<HonoEnv>();
  const db = getDrizzleClient();
  app.use(async (c, next) => {
    c.set('db', db);
    await next();
  });

  return {
    app,
    db,
  };
};

// contextのsessionUserをセット
export const setSessionUser = (app: Hono<HonoEnv>, sessionUser: SessionUser) => {
  app.use(async (c, next) => {
    c.set('sessionUser', sessionUser);
    await next();
  });
};
