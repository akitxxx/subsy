import { oauthCallbackHandler } from '@/api/features/auth/oauth-callback/oauthCallback.handler';
import type { HonoEnv } from '@/api/shared/types/hono';
import { Hono } from 'hono';

const app = new Hono<HonoEnv>();

// oauth callback
const route = app.get('/callback', ...oauthCallbackHandler);

export default route;
