import { createSupabaseServerClient } from '@/lib/supabase/supabase';
import type { HonoEnv } from '@/types/api/hono';
import { type Context, Hono } from 'hono';

const app = new Hono<HonoEnv>();

// oauth callback
const route = app.get('/callback', async (c: Context<HonoEnv>) => {
  const { searchParams, origin } = new URL(c.req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = c.req.header('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return c.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        return c.redirect(`https://${forwardedHost}${next}`);
      }
      return c.redirect(`${origin}${next}`);
    }
  }

  return c.redirect(`${origin}/auth/auth-code-error`);
});

export default route;
