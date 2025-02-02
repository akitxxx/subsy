import { honoClient } from '@/lib/hono/hono';
import { createSupabaseServerClient } from '@/lib/supabase/supabase';
import { type NextRequest, NextResponse } from 'next/server';

// 認証をスキップするパス
const PUBLIC_PATHS = {
  pages: ['/sign-in', '/auth'],
  api: ['/api'], // apiはhono側のmiddlewareにて処理を行うため対象外とする
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
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl.origin));
  }

  // ユーザーレコードの存在チェック
  const userExists = await checkUserExists();
  if (!userExists) {
    // すでに/sign-upページにいる場合はリダイレクトしない。無限ループになるため
    if (pathname === '/sign-up') return NextResponse.next();
    // ユーザーレコードが存在しない場合は/sign-upページへリダイレクト
    return NextResponse.redirect(new URL('/sign-up', req.nextUrl.origin));
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

async function checkUserExists(): Promise<boolean> {
  try {
    const res = await honoClient.api.users.me.$get();

    // リダイレクトやエラーレスポンスの場合はfalseを返す
    if (!res.ok || res.headers.get('content-type')?.includes('text/html')) {
      return false;
    }

    const data = await res.json();
    return !!data;
  } catch (error) {
    console.error('User check error:', error);
    return false;
  }
}
