import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 認証が必要なパスのパターン
const protectedPaths = ['/dashboard'];

// 認証不要のパスのパターン
const publicPaths = ['/', '/sign-in'];

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(request: NextRequest) {
  // 現在のパス
  const path = request.nextUrl.pathname;

  // 認証情報を取得
  const session = await auth();

  // 認証が必要なパスへのアクセスで未認証の場合
  if (protectedPaths.some((p) => path.startsWith(p)) && !session) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(signInUrl);
  }

  // 認証済みユーザーがsign-inページにアクセスした場合
  if (path === '/sign-in' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
