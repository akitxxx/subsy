import type { HonoEnv } from '@/types/api/hono';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { SignUpWithGoogleUsecase } from './signUpWithGoogle.usecase';

const app = new Hono<HonoEnv>();

// oauth callback
const route = app
  .get('/callback', async (c) => {
    const { searchParams, origin } = new URL(c.req.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    console.log(code, next, origin);

    if (!code) {
      console.error('auth callback error: no code');
      return c.redirect(`${origin}/auth/auth-code-error`);
    }

    const supabase = c.var.supabase;
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    const forwardedHost = c.req.header('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';

    if (error) {
      console.error({ 'auth callback error': error });
      return c.redirect(`${origin}/auth/auth-code-error`);
    }

    if (isLocalEnv) return c.redirect(`${origin}${next}`);
    if (forwardedHost) return c.redirect(`https://${forwardedHost}${next}`);
    return c.redirect(`${origin}${next}`);
  })
  .post(
    '/sign-up',
    zValidator(
      'json',
      z.object({
        nickname: z
          .string()
          .min(1, 'ニックネームは必須です')
          .max(10, 'ニックネームは10文字以内で入力してください'),
      }),
    ),
    async (c) => {
      const db = c.get('db');
      const authUser = c.get('authUser');

      const { nickname } = c.req.valid('json');
      const output = await SignUpWithGoogleUsecase.run({ db, authUser })({
        nickname,
      });

      return c.json(output);
    },
  );

export default route;
