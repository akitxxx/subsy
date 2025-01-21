import { supabase } from '@/lib/supabase';
import { type NextRequest, NextResponse } from 'next/server';

// 認証が不要なパスを定義
const publicPaths = ['/', '/sign-in'];

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(req: NextRequest) {
  try {
    const { nextUrl } = req;
    const isPublicPath = publicPaths.includes(nextUrl.pathname);

    // 公開パスの場合はそのまま通す
    if (isPublicPath) return NextResponse.next();

    // セッションの取得を試みる
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      // セッションが存在しない場合はサインインページにリダイレクト
      const signInUrl = new URL('/sign-in', nextUrl.origin);
      signInUrl.searchParams.set('redirectTo', nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
}
