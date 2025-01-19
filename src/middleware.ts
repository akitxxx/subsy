import { auth } from '@/lib/auth/auth';
import { NextRequest, NextResponse } from 'next/server';

// 認証が不要なパスを定義
const publicPaths = ['/', '/sign-in'];

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export default auth((req) => {
  const { nextUrl } = req;
  const isPublicPath = publicPaths.includes(nextUrl.pathname);

  if (isPublicPath) return NextResponse.next();
  if (req.auth) return NextResponse.next();

  // 未認証かつ保護されたパスへのアクセスの場合、サインインページにリダイレクト
  const signInUrl = new URL('/sign-in', nextUrl.origin);
  // 認証後のリダイレクト先を設定
  signInUrl.searchParams.set('redirectTo', nextUrl.pathname);

  return NextResponse.redirect(signInUrl);
});
