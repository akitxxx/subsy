import type { HonoEnv } from '@/types/api/hono';
import { Hono } from 'hono';
import { OAuthCallbackUsecase } from './oauthCallback.usecase';

const app = new Hono<HonoEnv>();

// oauth callback
const route = app.get('/callback', async (c) => {
  const { searchParams, origin } = new URL(c.req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    console.error('auth callback error: no code');
    return c.redirect(`${origin}/auth/auth-code-error`);
  }

  const { error } = await OAuthCallbackUsecase.run({ db: c.get('db'), supabase: c.get('supabase'), authCode: code })();

  if (error) {
    console.error({ 'auth callback error': error });
    return c.redirect(`${origin}/auth/auth-code-error`);
  }

  const forwardedHost = c.req.header('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  if (isLocalEnv) return c.redirect(`${origin}${next}`);
  if (forwardedHost) return c.redirect(`https://${forwardedHost}${next}`);
  return c.redirect(`${origin}${next}`);
});

export default route;
