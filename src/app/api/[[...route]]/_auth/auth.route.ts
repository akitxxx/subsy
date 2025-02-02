import { createSupabaseServerClient } from '@/lib/supabase/supabase';
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
