import { getDrizzleClient } from '@/lib/db/drizzle';
import type { HonoEnv } from '@/types/api/hono';
import type { SessionUser } from '@/types/api/sessionUser';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';

export type TestClient = {
  $get: (path: string, query?: unknown, options?: { env?: { Variables: HonoEnv['Variables'] } }) => Promise<Response>;
  $post: (path: string, body?: unknown, options?: { env?: { Variables: HonoEnv['Variables'] } }) => Promise<Response>;
  $put: (path: string, body?: unknown, options?: { env?: { Variables: HonoEnv['Variables'] } }) => Promise<Response>;
  $patch: (path: string, body?: unknown, options?: { env?: { Variables: HonoEnv['Variables'] } }) => Promise<Response>;
  $delete: (path: string, options?: { env?: { Variables: HonoEnv['Variables'] } }) => Promise<Response>;
};

export type RouteConfig = {
  path: string;
  route: Hono<HonoEnv>;
};

export const createTestApp = ({ routes }: { routes: RouteConfig[] }) => {
  const app = new Hono<HonoEnv>();
  const db = getDrizzleClient();
  app.use(async (c, next) => {
    c.set('db', db);
    await next();
  });

  // 指定されたルートを登録
  if (routes) {
    for (const { path, route } of routes) {
      app.route(path, route);
    }
  }

  return {
    app,
    db,
    client: createClient(app),
  };
};

const setAuthUser = (app: Hono<HonoEnv>, authUser: Pick<SessionUser, 'id'>) => {
  app.use(async (c, next) => {
    c.set('sessionUser', authUser as SessionUser);
    await next();
  });
};

const createClient =
  (app: Hono<HonoEnv>) =>
  (p: { authUser?: Pick<SessionUser, 'id'> }): TestClient => {
    if (p.authUser) {
      setAuthUser(app, p.authUser);
    }
    return testClient(app) as TestClient;
  };
