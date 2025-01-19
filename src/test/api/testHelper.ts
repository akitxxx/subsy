import { getDrizzleClient } from '@/lib/db/drizzle';
import type { DrizzleClient } from '@/lib/db/drizzle';
import type { HonoEnv } from '@/types/api/hono';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';

export type TestClient = {
  $get: (
    path: string,
    query?: unknown,
    options?: { env?: { Variables: HonoEnv['Variables'] } },
  ) => Promise<Response>;
  $post: (
    path: string,
    body?: unknown,
    options?: { env?: { Variables: HonoEnv['Variables'] } },
  ) => Promise<Response>;
  $put: (
    path: string,
    body?: unknown,
    options?: { env?: { Variables: HonoEnv['Variables'] } },
  ) => Promise<Response>;
  $delete: (
    path: string,
    options?: { env?: { Variables: HonoEnv['Variables'] } },
  ) => Promise<Response>;
};

export const createTestApp = (route: Hono<HonoEnv>) => {
  const app = new Hono<HonoEnv>();
  const db = getDrizzleClient();
  app.use(async (c, next) => {
    c.set('db', db);
    await next();
  });
  app.route('/', route);

  return {
    app,
    db,
    client: testClient(app) as TestClient,
  };
};

export const createMockApp = (
  route: Hono<HonoEnv>,
  mockDb: Partial<DrizzleClient>,
) => {
  const app = new Hono<HonoEnv>();
  const db = getDrizzleClient();
  app.use(async (c, next) => {
    c.set('db', {
      ...db,
      ...mockDb,
    } as unknown as DrizzleClient);
    await next();
  });
  app.route('/', route);

  return {
    app,
    client: testClient(app) as TestClient,
  };
};
