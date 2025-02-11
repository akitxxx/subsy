import { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import type { HonoEnv } from '@/types/api/hono';
import { Hono } from 'hono';
import { OAuthCallbackUsecase } from '../application/oauthCallback.usecase';

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

  const db = c.get('db');
  const supabase = c.get('supabase');

  const { error } = await OAuthCallbackUsecase.run({
    db,
    supabase,
    authCode: code,
    userRepository: UserRepository({ db }),
  })();

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
