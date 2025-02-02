import { honoClient } from '@/lib/hono/hono';
import { createSupabaseServerClient } from '@/lib/supabase/supabase';
import { type NextRequest, NextResponse } from 'next/server';

// 認証をスキップするパス
const PUBLIC_PATHS = {
  pages: ['/sign-in', '/sign-up', '/auth'],
  api: ['/api/auth'],
  system: ['/_next', '/favicon.ico'],
};

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 公開パスはスキップ
  if (isPublicPath(pathname)) return NextResponse.next();

  // 認証チェック
  const session = await getSession();
  if (!session) {
    return redirectToSignIn(req.nextUrl);
  }

  // ユーザーレコードの存在チェック
  const userExists = await checkUserExists(req.headers.get('cookie') || '');
  if (!userExists) return redirectToSignUp(req.nextUrl);

  return NextResponse.next();
}

// ========== private ==========

// ヘルパー関数
function isPublicPath(pathname: string): boolean {
  return Object.values(PUBLIC_PATHS).some((paths) =>
    paths.some((path) => pathname.startsWith(path)),
  );
}

async function getSession() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

function redirectToSignIn(url: URL): NextResponse {
  const signInUrl = new URL('/sign-in', url.origin);
  signInUrl.searchParams.set('redirectTo', url.pathname);
  return NextResponse.redirect(signInUrl);
}

async function checkUserExists(cookie: string): Promise<boolean> {
  try {
    const res = await honoClient.api.users.me.$get({ headers: { cookie } });

    if (!res.ok) return false;

    const data = await res.json();
    return !!data;
  } catch (error) {
    console.error('User check error:', error);
    return false;
  }
}

function redirectToSignUp(url: URL): NextResponse {
  const signUpUrl = new URL('/sign-up', url.origin);
  signUpUrl.searchParams.set('redirectTo', url.pathname);
  return NextResponse.redirect(signUpUrl);
}
