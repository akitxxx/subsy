import type { HonoEnv } from '@/types/api/hono';
import { type Context, Hono } from 'hono';
// import { GoogleAuthUsecase } from './google-auth.usecase';

const auth = new Hono();

// auth.post('/google/callback', async (c: Context<HonoEnv>) => {
//   const { credential } = await c.req.json();

//   try {
//     const result = await GoogleAuthUsecase.run({ db: c.var.db })({
//       credential,
//     });

//     // セッションクッキーを設定
//     c.cookie('session', result.token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'Lax',
//       path: '/',
//     });

//     return c.json({
//       userId: result.userId,
//       nickname: result.nickname,
//     });
//   } catch (error) {
//     console.error(error);
//     if (error instanceof Error) {
//       return c.json({ error: error.message }, 401);
//     }
//     return c.json({ error: '認証に失敗しました' }, 500);
//   }
// });

export default auth;
