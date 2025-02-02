import type { HonoEnv } from '@/types/api/hono';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { type Context, Next } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { cookies } from 'next/headers';

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
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// サーバー用Supabaseクライアントの生成
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
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
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

export async function createSupabaseHono(c: Context<HonoEnv>) {
  const cookie = getCookie(c);
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      secure: true,
      httpOnly: true,
    },
    cookies: {
      getAll() {
        return Object.entries(cookie).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(c, name, value, {
            ...options,
            // TOOD: 要確認
            sameSite: 'strict',
            priority: 'High',
          });
        }
      },
    },
  });
}
