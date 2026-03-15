# Architecture Migration Plan

## 現在の構成

```
Next.js 15 App Router
├── API: Hono (Next.js API Route 内)
├── 認証: Supabase Auth (Google OAuth のみ)
├── DB: Supabase PostgreSQL
├── ORM: Drizzle ORM + postgres (TCP直接接続)
├── デプロイ: Vercel
├── IaC: Terraform (Supabase + Vercel)
└── テスト: Vitest
```

## 移行後の構成 (To-Be)

```
Next.js App Router (Vercel)
├── API: Hono (継続)
├── 認証: Better Auth (LINE OAuth のみ)
├── DB: Neon (PostgreSQL, サーバーレス)
├── ORM: Drizzle ORM
├── IaC: Terraform (Neon + Vercel)
└── テスト: Vitest
```

### 認証: Better Auth

- 種別: OSS フル認証ライブラリ（外部認証サービスではない）
- 処理: 全て自分のアプリ + 自分の DB 内で完結
- OAuth: LINE Login のみ
- セッション: cookie ベース + DB セッション（Better Auth 管理）
- cookie cache: 署名付き短命 cookie でDB ヒットを削減（JWT access/refresh token に近い仕組み）
- 鍵ローテーション: 組み込み（BETTER_AUTH_SECRETS で複数バージョン管理、ダウンタイムなし）
- Hono 統合: 公式
- Drizzle adapter: 公式（認証テーブルも Drizzle スキーマで一元管理）
- ネイティブ対応: Expo プラグインあり（将来必要時）。不足なら Clerk 移行を検討

サーバー側:
- `src/api/shared/lib/auth/auth.ts` に Better Auth 設定
- `src/app/api/auth/[...all]/route.ts` で認証 API を提供
- Hono ミドルウェアでセッション検証、sessionUser をコンテキストに注入

クライアント側:
- `src/api/shared/lib/auth/auth-client.ts` に createAuthClient()
- signIn("line") / signOut() / useSession() のみ

DB テーブル (Better Auth が管理):
- user: ユーザー基本情報
- session: セッション
- account: OAuth プロバイダー連携
- verification: メール検証等

### DB: Neon

- PostgreSQL 特化のサーバーレスホスティング
- scale-to-zero（アイドル時コストなし）
- 接続プーリング内蔵（サーバーレス環境必須）
- DB ブランチ機能（Vercel preview 連携、ブランチ作成 ~1秒）
- Terraform provider あり（Neon スポンサーのコミュニティ製。公式ではないがリスク限定的、CLI/API で代替可能）

### API: Hono（継続）

- Next.js API Route 内で動作
- ミドルウェア: DB注入、Better Auth セッション検証、エラーハンドリング
- Better Auth の Hono 公式統合を使用

### ORM: Drizzle ORM（継続）

- 型安全、軽量
- Better Auth / Neon 両方と相性良好
- 認証テーブルも含めスキーマ一元管理

### ホスティング: Vercel（継続）

- Next.js App Router の標準解

### IaC: Terraform（継続）

- Vercel: 公式 provider
- Neon: コミュニティ provider（Neon スポンサー）
- TF Cloud: pinolab/subsy workspace、Remote execution、VCS連携、Auto Apply

### 環境変数 (To-Be)

アプリケーション:
| 変数名 | 用途 | NEXT_PUBLIC | 機密 |
|--------|------|-------------|------|
| DATABASE_URL | Neon 接続文字列 | No | Yes |
| BETTER_AUTH_SECRET | セッション署名 | No | Yes |
| LINE_LOGIN_CHANNEL_ID | LINE Login OAuth | No | No |
| LINE_LOGIN_CHANNEL_SECRET | LINE Login OAuth | No | Yes |
| LINE_CHANNEL_ACCESS_TOKEN | LINE Messaging API | No | Yes |
| LINE_CHANNEL_SECRET | LINE Messaging API 署名検証 | No | Yes |
| OPENAI_API_KEY | OpenAI API | No | Yes |
| NEXT_PUBLIC_APP_ENV | 環境識別 | Yes | No |
| NEXT_PUBLIC_API_HOST | APIホスト | Yes | No |

Terraform (TF Cloud Variables):
| 変数名 | 用途 |
|--------|------|
| vercel_api_token | Vercel 管理 |
| neon_api_key | Neon 管理 |
| better_auth_secret | Vercel env へ注入 |
| line_login_channel_id | Vercel env へ注入 |
| line_login_channel_secret | Vercel env へ注入 |
| line_channel_access_token | Vercel env へ注入 |
| line_channel_secret | Vercel env へ注入 |
| openai_api_key | Vercel env へ注入 |
| next_public_api_host | Vercel env へ注入 |

### セキュリティ設計

- NEXT_PUBLIC 環境変数にシークレットを含めない（Supabase anon key 露出問題の再発防止）
- PostgREST / Data API が存在しない → anon key 露出リスクがそもそも発生しない
- 認可は usecase 層で userId フィルタ（DAL/サービス層で一元化）
- Hono ミドルウェアで全 API エンドポイントに認証チェック
- LINE Webhook は署名検証必須
- OpenAI キーはサーバーのみ
- DB ロール最小権限分離（app / migration / readonly）
- Better Auth の鍵ローテーションで定期的なシークレット更新が可能

### ネイティブアプリ対応方針

現時点では Web のみ。将来必要になった場合:
1. Better Auth の Expo 統合を試す
2. 不足する場合（LINE SDK ネイティブ連携、MFA、組織管理等）Clerk 移行を検討

### 選定根拠サマリ（Claude + Codex 合意）

| レイヤー | 選定 | 理由 |
|---------|------|------|
| 認証 | Better Auth | Hono公式統合、データが自分のDB、Supabase移行ガイドあり、OSS無料、LINE公式対応 |
| DB | Neon | serverless Postgres 最モダン、branching、scale-to-zero、Vercel相性良好 |
| ORM | Drizzle | 継続。型安全、軽量、Better Auth/Neon両方と相性良好 |
| API | Hono | 継続。Better Auth公式統合、既存ミドルウェア資産活用 |
| ホスティング | Vercel | 継続。Next.js App Routerの標準解 |
| IaC | Terraform | 継続。Vercel公式provider + Neonコミュニティprovider |

## 移行フェーズ

### Step 1: Terraform (Neon構築 + Supabase撤去)

- [ ] `infra/terraform/neon.tf` 作成
- [ ] `infra/terraform/supabase.tf` 削除
- [ ] `main.tf` `variables.tf` `vercel.tf` `outputs.tf` `terraform.tfvars.example` `README.md` 更新
- [ ] TF Cloud Variables 更新（Supabase系削除、Neon系追加）
- [ ] apply して Neon 環境構築

### Step 2: Better Auth 導入 + Supabase Auth 撤去

- [ ] `better-auth` パッケージ追加、Supabase パッケージ削除
- [ ] Better Auth サーバー設定・Route Handler・クライアント作成
- [ ] LINE ログイン UI 作成
- [ ] Hono ミドルウェアを Better Auth セッション検証に差し替え
- [ ] Next.js Middleware (`proxy.ts`) を Better Auth に差し替え
- [ ] `layout.tsx` `sign-in/page.tsx` `Header.tsx` のセッション/ログアウト差し替え
- [ ] 型定義更新 (`hono.d.ts` `sessionUser.d.ts` `env.d.ts`)
- [ ] DB スキーマに Better Auth テーブル追加、マイグレーション実行
- [ ] Supabase 関連ファイル全削除
- [ ] 環境変数更新 (`.env*`)
- [ ] デッドコード削除（Clerk系環境変数、Google OAuth、ProviderEnum）

### Step 3: データ移行 + 検証

- [ ] Supabase → Neon へ pg_dump / pg_restore
- [ ] 全テスト通過確認
- [ ] LINE OAuth フロー動作確認
- [ ] CLAUDE.md の Clerk 記載を修正
- [ ] Supabase プロジェクト廃止

## 変更対象

削除 (9件):
- `src/shared/lib/supabase/supabase.ts`
- `src/web/features/auth/actions/signInWithGoogle.action.ts`
- `src/web/features/auth/components/GoogleSignInButton.tsx`
- `src/api/features/auth/oauth-callback/oauthCallback.handler.ts`
- `src/api/features/auth/oauth-callback/oauthCallback.usecase.ts`
- `src/app/api/[[...route]]/auth.route.ts`
- `infra/terraform/supabase.tf`
- `supabase/` ディレクトリ

作成 (5件):
- `src/api/shared/lib/auth/auth.ts`
- `src/api/shared/lib/auth/auth-client.ts`
- `src/app/api/auth/[...all]/route.ts`
- `src/web/features/auth/actions/signInWithLine.action.ts`
- `infra/terraform/neon.tf`

変更 (17件):
- `src/app/api/[[...route]]/route.ts` `src/proxy.ts` `src/app/layout.tsx` `src/app/sign-in/page.tsx`
- `src/web/shared/components/Header/Header.tsx`
- `src/api/shared/types/hono.d.ts` `src/api/shared/types/sessionUser.d.ts`
- `src/api/shared/lib/db/schema.ts` `src/shared/types/env.d.ts` `src/shared/enums/user-auth/provider.enum.ts`
- `package.json` `.env.example` `.env.test`
- `infra/terraform/main.tf` `variables.tf` `vercel.tf` `outputs.tf`

削除する環境変数: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, AUTH_GOOGLE_CLIENT_ID, AUTH_GOOGLE_CLIENT_SECRET, CLERK_* (5件, デッドコード), supabase_* (3件, TF Cloud), auth_google_* (2件, TF Cloud)

追加する環境変数: BETTER_AUTH_SECRET, LINE_LOGIN_CHANNEL_ID, LINE_LOGIN_CHANNEL_SECRET, neon_api_key (TF Cloud)

パッケージ削除: @supabase/ssr, @supabase/supabase-js, supabase (CLI)
パッケージ追加: better-auth

## 注意事項

- LINE Login と LINE Messaging API は別チャネル。環境変数を混同しない
- Auth 移行で全セッション無効化（再ログイン必要）
- Neon はサーバーレス環境で接続プーリング必須

## 参考リンク

- Better Auth: https://better-auth.com
  - LINE: https://better-auth.com/docs/authentication/line
  - Drizzle adapter: https://better-auth.com/docs/adapters/drizzle
  - Hono: https://better-auth.com/docs/integrations/hono
  - Supabase migration: https://better-auth.com/docs/guides/supabase-migration-guide
  - Session management: https://better-auth.com/docs/concepts/session-management
  - Security: https://better-auth.com/docs/reference/security
- Neon: https://neon.com/docs
  - Terraform: https://registry.terraform.io/providers/kislerdm/neon/latest/docs
  - Vercel: https://neon.com/docs/guides/vercel
  - Connection pooling: https://neon.com/docs/connect/connection-pooling
