import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from './lib/supabase/supabase';

// 認証をスキップするパス
const PUBLIC_PATHS = {
  pages: ['/', '/sign-in', '/auth'],
  api: ['/api/auth'],
  system: ['/_next', '/favicon.ico'],
};

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 公開パスはスキップ
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 認証チェック
  const session = await getSession();
  if (!session) {
    return redirectToSignIn(req.nextUrl);
  }

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
