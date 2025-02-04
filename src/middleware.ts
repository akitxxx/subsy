import { createSupabaseServerClient } from '@/lib/supabase/supabase';
import { type NextRequest, NextResponse } from 'next/server';

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

  // 認証チェック
  const session = await getSession();
  // 認証必須なパスは/sign-inへリダイレクト
  if (!session) {
    //  公開パスはそのまま
    if (isPublicPath(pathname)) return NextResponse.next();
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl.origin));
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
