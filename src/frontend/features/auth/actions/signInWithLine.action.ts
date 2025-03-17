'use server';

import { redirect } from 'next/navigation';

export async function signInWithLine() {
  try {
    // LINE OAuthのURLを生成
    const baseUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
    const lineAuthUrl = `${baseUrl}?strategy=oauth_line`;

    // 生成されたURLにリダイレクト
    redirect(lineAuthUrl);
  } catch (error) {
    console.error('LINEログインエラー:', error);
    // エラー時はサインインページに戻る
    redirect('/sign-in?error=line_auth_failed');
  }
}
