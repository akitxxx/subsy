import {
  createSupabaseServerClient,
  updateSession,
} from '@/lib/supabase/supabase';
import type { User } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { honoClient } from './lib/hono/hono';

// 認証をスキップするパス
const PUBLIC_PATHS = {
  pages: ['/sign-in'],
  system: ['/_next', '/favicon.ico'],
};

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // apiはhono側のmiddlewareにて処理を行うため対象外とする
  if (pathname.startsWith('/api')) return NextResponse.next();

  // 公開パスはスキップ
  if (isPublicPath(pathname)) return NextResponse.next();

  const onAfterGetSessionUser = async ({
    sessionUser,
  }: { sessionUser: User | null }) => {
    if (!sessionUser) {
      const url = req.nextUrl.clone();
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }

    const res = await honoClient.api.users.me.$get({
      cookie: req.cookies.getAll(),
    });
    if (res.status !== 200) {
      if (!pathname.startsWith('/sign-up')) {
        return NextResponse.redirect(new URL('/sign-up', req.url));
      }
    }

    return undefined;
  };

  return await updateSession({ request: req, onAfterGetSessionUser });
}

// ========== private ==========

// ヘルパー関数
function isPublicPath(pathname: string): boolean {
  return Object.values(PUBLIC_PATHS).some((paths) =>
    paths.some((path) => pathname.startsWith(path)),
  );
}
