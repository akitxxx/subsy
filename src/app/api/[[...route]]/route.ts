import { NotFoundError, toErrorResponse } from '@/api/shared/error';
import { CreateUserDomainService } from '@/api/shared/domain/user/createUser.domainService';
import { UserRepository } from '@/api/shared/domain/user/user.repository';
import { getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { HonoEnv } from '@/api/shared/types/hono';
import { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { Effect } from 'effect';
import { type Context, Hono } from 'hono';
import { handle } from 'hono/vercel';

import dashboard from './dashboard.route';
import line from './line.route';
import subscription from './subscription.route';
import user from './user.route';

// public routes（認証不要）
const publicApp = new Hono<HonoEnv>().basePath('/api');

publicApp.use(async (c: Context<HonoEnv>, next) => {
  c.set('db', getDrizzleClient());
  await next();
});

publicApp.route('/line', line);

// private routes（認証必要）
const privateApp = new Hono<HonoEnv>().basePath('/api');

// DB + Clerk認証 + lazy create middleware
privateApp.use(async (c: Context<HonoEnv>, next) => {
  c.set('db', getDrizzleClient());
  await next();
});

privateApp.use(clerkMiddleware());

// Clerk userId → DB user の解決 + lazy create
privateApp.use(async (c: Context<HonoEnv>, next) => {
  const auth = getAuth(c);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    c.set('sessionUser', null);
    await next();
    return;
  }

  const db = c.get('db');
  const userRepository = UserRepository.new({ db });

  // Clerk userId で user_auths を検索（provider でフィルタ）
  const existingUser = await Effect.runPromise(userRepository.findByProviderId({ provider: ProviderEnum.Clerk, providerId: clerkUserId }));

  if (existingUser) {
    c.set('sessionUser', existingUser);
    await next();
    return;
  }

  // 未登録ユーザーの場合、自動作成して返り値から id を取得
  const createdUser = await Effect.runPromise(
    CreateUserDomainService.run({ userRepository })({
      provider: ProviderEnum.Clerk,
      providerId: clerkUserId,
    }),
  );

  c.set('sessionUser', createdUser);
  await next();
});

// error handler（両方のappに設定）
const onError = (err: Error, c: Context<HonoEnv>) => {
  console.error(err);
  const errorResponse = toErrorResponse(err);
  return c.json(errorResponse, errorResponse.error.status);
};

const onNotFound = (c: Context<HonoEnv>) => {
  const errorResponse = toErrorResponse(new NotFoundError('ページが見つかりません'));
  return c.json(errorResponse, errorResponse.error.status);
};

publicApp.onError(onError);
publicApp.notFound(onNotFound);
privateApp.onError(onError);
privateApp.notFound(onNotFound);

// routing
const privateRoute = privateApp.route('/dashboard', dashboard).route('/users', user).route('/subscriptions', subscription);

// メインアプリ: public → private の順でマウント
const app = new Hono();
app.route('/', publicApp);
app.route('/', privateApp);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof privateRoute;
