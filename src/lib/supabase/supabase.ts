import type { HonoEnv } from '@/types/api/hono';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// 環境変数の取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// 環境変数の存在チェック
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Required environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set',
  );
}

// ブラウザ用Supabaseクライアントの生成
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  });
}

// サーバー用Supabaseクライアントの生成
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // サーバーコンポーネントから`setAll`メソッドが呼び出されました。
          // ミドルウェアでユーザーセッションを更新している場合、
          // このエラーは無視できます。
        }
      },
    },
  });
}

// 期限切れの認証トークンをリフレッシュ
export async function updateSession({
  request,
  onAfterGetSessionUser,
}: {
  request: NextRequest;
  onAfterGetSessionUser: ({
    sessionUser,
  }: { sessionUser: User | null }) => Promise<NextResponse | undefined>;
}) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = await createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // createServerClientとsupabase.auth.getUser()の間にコードを
  // 記述しないでください。単純なミスでもユーザーがランダムに
  // ログアウトされる原因となり、デバッグが非常に困難になります。

  // 重要: auth.getUser()を削除しないでください

  console.time('getUser');
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.timeEnd('getUser');

  const res = await onAfterGetSessionUser({ sessionUser: user });
  if (res) return res;

  // 重要: responseオブジェクトをそのまま返す必要があります。
  // 重要: responseオブジェクトをそのまま返す必要があります。
  // NextResponse.next()で新しいレスポンスオブジェクトを作成する場合は、
  // 以下の点に注意してください：
  // 1. 以下のようにリクエストを渡してください：
  //    const myNewResponse = NextResponse.next({ request })
  // 2. 以下のようにクッキーをコピーしてください：
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. myNewResponseオブジェクトを必要に応じて変更しますが、
  //    クッキーは変更しないでください！
  // 4. 最後に：
  //    return myNewResponse
  // これを行わないと、ブラウザとサーバーが同期を失い、
  // ユーザーセッションが早期に終了する可能性があります！

  return response;
}

// Hono用Supabaseクライアントの生成
export async function createSupabaseHono(c: Context<HonoEnv>) {
  const cookie = getCookie(c);
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
    cookies: {
      getAll() {
        return Object.entries(cookie).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(c, name, value, {
            ...options,
            // TODO: 要確認
            sameSite: 'lax',
            priority: 'Medium',
          });
        }
      },
    },
  });
}
