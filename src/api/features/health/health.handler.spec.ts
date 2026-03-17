import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { type DrizzleClient, getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { HonoEnv } from '@/api/shared/types/hono';
import { healthHandler } from './health.handler';

describe('GET /api/health', () => {
  const db = getDrizzleClient();

  const createTestClient = ({ db }: { db: DrizzleClient }) => {
    const app = new Hono<HonoEnv>();
    app.use(async (c, next) => {
      c.set('db', db);
      await next();
    });
    const route = app.get('/api/health', ...healthHandler);
    return testClient(route);
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('DB接続が正常な場合、200とstatus:okを返すこと', async () => {
    // when
    const client = createTestClient({ db });
    const res = await client.api.health.$get();

    // then
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });

  it('DB接続が失敗した場合、503とstatus:errorを返すこと', async () => {
    // given - DB実行を失敗させる
    vi.spyOn(db, 'execute').mockRejectedValue(new Error('connection refused'));

    // when
    const client = createTestClient({ db });
    const res = await client.api.health.$get();

    // then
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe('error');
    expect(body.timestamp).toBeDefined();
  });
});
