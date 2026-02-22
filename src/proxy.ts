import type { User } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/shared/lib/supabase/supabase';

// 認証をスキップするパス
const PUBLIC_PATHS = {
  pages: ['/sign-in'],
  system: ['/_next', '/favicon.ico'],
};

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // apiはhono側のmiddlewareにて処理を行うため対象外とする
  if (pathname.startsWith('/api')) return NextResponse.next();

  // 公開パスはスキップ
  if (isPublicPath(pathname)) return NextResponse.next();

  const onAfterGetSessionUser = async ({ sessionUser }: { sessionUser: User | null }) => {
    // session userが取得できない場合はsign-inにリダイレクト
    if (!sessionUser) {
      const url = req.nextUrl.clone();
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }

    return undefined;
  };

  // セッションの更新
  return await updateSession({ request: req, onAfterGetSessionUser });
}

// ========== private ==========

// ヘルパー関数
function isPublicPath(pathname: string): boolean {
  return Object.values(PUBLIC_PATHS).some((paths) => paths.some((path) => pathname.startsWith(path)));
}
