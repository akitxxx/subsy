# Architecture Migration Plan

## 現在の構成

```
Next.js 16 App Router
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
├── 認証: Clerk (LINE OAuth)
├── DB: Neon (PostgreSQL, サーバーレス)
├── ORM: Drizzle ORM
├── IaC: Terraform (Neon + Vercel) + Neon-Managed Vercel Integration
└── テスト: Vitest
```

### 認証: Clerk

- 種別: マネージドな認証サービス（SaaS）
- OAuth: LINE Login のみ
- セッション: Clerk が管理（JWT ベース）
- 鍵ローテーション/セキュリティ: Clerk が管理（SOC 2 Type II）
- 運用: 認証の監視、攻撃防御、メール等は全て Clerk 側
- 料金: Hobby 50K MRU無料、Pro $20/月 + $0.02/MRU超過分
- ネイティブ対応: Expo/iOS/Android 公式SDK（成熟）
- LINE対応: 公式 social connection、Japan region対応

Next.js 側:
- `src/proxy.ts` に clerkMiddleware() を設定
- `<ClerkProvider>` でアプリ全体をラップ
- `auth()` / `currentUser()` でサーバー側からセッション取得
- `<SignInButton>` / `<UserButton>` 等のprebuilt UIコンポーネント

Hono API 側:
- `@hono/clerk-auth` ミドルウェアでセッション検証
- `getAuth(c)` で認証ユーザー取得

DB ユーザー同期:
- Lazy create 方式: 初回 API アクセス時に Clerk userId で DB を検索し、なければ自動作成
- 競合耐性: `upsert / ON CONFLICT DO NOTHING + reselect` で冪等に実装（初回アクセスで複数リクエストが並行しても安全）
- 必要に応じて Clerk Backend API (`clerkClient.users.getUser()`) でプロフィール情報を取得可能
- Webhook は不要（LINE Login のみのためユーザー側の変更も発生しない。将来必要になった時点で追加）

### DB: Neon

- PostgreSQL 特化のサーバーレスホスティング
- scale-to-zero（アイドル時コストなし）
- 接続プーリング内蔵（サーバーレス環境必須）
- DB ブランチ機能（Neon-Managed Vercel Integration による preview branch 自動作成）
- Terraform provider あり（Neon スポンサーのコミュニティ製。公式ではないがリスク限定的、CLI/API で代替可能）

### API: Hono（継続）

- Next.js API Route 内で動作
- ミドルウェア: DB注入、Clerk セッション検証（@hono/clerk-auth）、エラーハンドリング

### ORM: Drizzle ORM（継続）

- 型安全、軽量
- Neon と相性良好
- DB クライアント: `postgres` パッケージから `@neondatabase/serverless` に差し替え（Neon のサーバーレス環境に最適化）

### ホスティング: Vercel（継続）

- Next.js App Router の標準解

### IaC: Terraform + Neon-Managed Integration

責務分担:
- Terraform: インフラの土台（Neon project / main branch / role / database、Vercel project / 環境変数）
- Neon-Managed Vercel Integration: preview branch の動的管理（自動作成・自動削除・環境変数注入）
- Clerk: Dashboard で設定管理（Terraform 管理外）
- TF Cloud: pinolab/subsy workspace、Remote execution、VCS連携、Auto Apply

### 環境変数 (To-Be)

アプリケーション:
| 変数名 | 用途 | NEXT_PUBLIC | 機密 |
|--------|------|-------------|------|
| DATABASE_URL | Neon 接続文字列 | No | Yes |
| CLERK_SECRET_KEY | Clerk バックエンドAPI | No | Yes |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Clerk フロントエンド | Yes | No |
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
| clerk_secret_key | Vercel env へ注入 |
| clerk_publishable_key | Vercel env へ注入 |
| line_channel_access_token | Vercel env へ注入 |
| line_channel_secret | Vercel env へ注入 |
| openai_api_key | Vercel env へ注入 |
| next_public_api_host | Vercel env へ注入 |

### セキュリティ設計

- 認証/セッション管理は Clerk に委譲（SOC 2 Type II、bot protection、brute-force lockout）
- NEXT_PUBLIC にはClerk publishable key のみ（これは公開前提の設計）
- PostgREST / Data API が存在しない → anon key 露出リスクがそもそも発生しない
- 認可は usecase 層で userId フィルタ（DAL/サービス層で一元化）
- Hono ルーター構造で default-deny を実現: public router（`/line` webhook）と private router（その他全 API）に分離し、private router に auth middleware を attach
- LINE Webhook は署名検証必須
- OpenAI キーはサーバーのみ
- 鍵ローテーション/証明書管理は Clerk が自動対応

### ネイティブアプリ対応方針

現時点では Web のみ。Clerk は Expo/iOS/Android の公式SDKを持つため、将来のネイティブ対応時もスムーズに拡張可能。

### 選定根拠

| レイヤー | 選定 | 理由 |
|---------|------|------|
| 認証 | Clerk | マネージド運用、LINE公式対応、ネイティブSDK成熟、セキュリティ(SOC2) |
| DB | Neon | serverless Postgres 最モダン、branching、scale-to-zero、Vercel相性良好 |
| ORM | Drizzle | 継続。型安全、軽量、Neon相性良好 |
| API | Hono | 継続。@hono/clerk-auth でClerk統合可能、既存ミドルウェア資産活用 |
| ホスティング | Vercel | 継続。Next.js App Routerの標準解 |
| IaC | Terraform | 継続。Vercel公式provider + Neonコミュニティprovider |

## 移行フェーズ

### Step 1: Terraform (Neon構築 + Supabase撤去)

- [ ] `infra/terraform/neon.tf` 作成
- [ ] `infra/terraform/supabase.tf` 削除
- [ ] `main.tf` `variables.tf` `vercel.tf` `outputs.tf` `terraform.tfvars.example` `README.md` 更新
- [ ] TF Cloud Variables 更新（Supabase系削除、Neon/Clerk系追加）
- [ ] apply して Neon 環境構築
- [ ] Neon-Managed Vercel Integration を Vercel Marketplace から接続し preview branching を有効化

### Step 2: Clerk 導入 + Supabase Auth 撤去

- [ ] `@clerk/nextjs` `@hono/clerk-auth` パッケージ追加、Supabase パッケージ削除
- [ ] Clerk Dashboard で LINE social connection 設定
- [ ] `<ClerkProvider>` を layout.tsx に追加
- [ ] `src/proxy.ts` を clerkMiddleware() に差し替え
- [ ] Hono ルーター構造を public/private に分離し、private router に @hono/clerk-auth + lazy create middleware を attach
- [ ] `sign-in/page.tsx` を Clerk `<SignIn>` コンポーネントに差し替え
- [ ] `Header.tsx` を Clerk `<UserButton>` に差し替え
- [ ] `signOut.action.ts` 削除（Clerk `<UserButton>` に統合）
- [ ] 型定義更新 (`hono.d.ts` `sessionUser.d.ts` `env.d.ts`)
- [ ] DB スキーマ: user_auths の providerId を Clerk userId に対応させる
- [ ] `provider.enum.ts` から `Google` を削除（enum 自体は LINE bot で使用中のため残す）
- [ ] Supabase 関連ファイル全削除
- [ ] 環境変数更新 (`.env*`)
- [ ] DB クライアント差し替え: `postgres` → `@neondatabase/serverless`（`drizzle.ts` 更新）
- [ ] `package.json` の `db:up`/`db:down` を Neon ローカル開発手段に置き換え
- [ ] テスト更新（`testDataFactory.ts` の ProviderEnum.Google → Line、認証関連テスト）

### Step 3: 検証 + ドキュメント更新

- [ ] 全テスト通過確認
- [ ] LINE OAuth フロー動作確認（LINE Login と Messaging API の user ID 同一性を実アカウントで検証）
- [ ] CLAUDE.md 更新（Supabase → Clerk / Neon に修正）
- [ ] `docs/local_setup.md` 更新（Supabase CLI → Neon ローカル開発手順）
- [ ] `docs/architecture.md` 更新

## 変更対象

削除 (11件):
- `src/shared/lib/supabase/supabase.ts`
- `src/web/features/auth/actions/signInWithGoogle.action.ts`
- `src/web/features/auth/actions/signOut.action.ts`
- `src/web/features/auth/components/GoogleSignInButton.tsx`
- `src/api/features/auth/oauth-callback/oauthCallback.handler.ts`
- `src/api/features/auth/oauth-callback/oauthCallback.usecase.ts`
- `src/app/api/[[...route]]/auth.route.ts`
- `infra/terraform/supabase.tf`
- `supabase/` ディレクトリ（config.toml 含む）

作成 (2件):
- `infra/terraform/neon.tf`
- `src/web/features/auth/components/LineSignInButton.tsx`（Clerk `<SignIn>` で代替できる場合は不要）

変更 (22件):
- `src/app/api/[[...route]]/route.ts` `src/proxy.ts` `src/app/layout.tsx` `src/app/sign-in/page.tsx`
- `src/web/shared/components/Header/Header.tsx`
- `src/api/shared/lib/db/drizzle.ts` `src/api/shared/domain/user/user.repository.ts`
- `src/shared/lib/hono/hono.ts`
- `src/api/shared/types/hono.d.ts` `src/api/shared/types/sessionUser.d.ts`
- `src/shared/types/env.d.ts` `src/shared/enums/user-auth/provider.enum.ts`
- `src/api/shared/test/testDataFactory.ts`
- `package.json` `.env.example` `.env.test`
- `infra/terraform/main.tf` `variables.tf` `vercel.tf` `outputs.tf` `terraform.tfvars.example` `README.md`

ドキュメント更新:
- `CLAUDE.md`
- `docs/local_setup.md`
- `docs/architecture.md`

削除する環境変数: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, AUTH_GOOGLE_CLIENT_ID, AUTH_GOOGLE_CLIENT_SECRET, CLERK_* (5件, 旧デッドコード), supabase_* (3件, TF Cloud), auth_google_* (2件, TF Cloud)

追加する環境変数: CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, neon_api_key (TF Cloud)

パッケージ削除: @supabase/ssr, @supabase/supabase-js, supabase (CLI), postgres
パッケージ追加: @clerk/nextjs, @hono/clerk-auth, @neondatabase/serverless

## 注意事項

- LINE Login と LINE Messaging API は別チャネルだが、同じ LINE provider 配下で作成すること（異なる provider だと user ID が別になり、web ログインと bot ユーザーが紐づかない）
- DB はクリーンスタート（データ移行なし、アプリ運用停止中のため問題なし）
- Neon はサーバーレス環境で接続プーリング必須
- Clerk の LINE social connection は Dashboard で設定（コードではなく管理画面）
- `@hono/clerk-auth` は Clerk 公式では Community 扱い。中身は JWT 検証のみで薄いためリスクは限定的だが、問題があれば Next.js 側の公式 SDK で認証して Hono に userId を渡す方式に切替可能

## 参考リンク

- Clerk: https://clerk.com/docs
  - Next.js quickstart: https://clerk.com/docs/nextjs/getting-started/quickstart
  - LINE social connection: https://clerk.com/docs/guides/configure/auth-strategies/social-connections/line
  - Hono middleware: https://clerk.com/changelog/2023-11-08
  - Expo: https://clerk.com/docs/expo/getting-started/quickstart
  - Pricing: https://clerk.com/pricing
- Neon: https://neon.com/docs
  - Terraform: https://registry.terraform.io/providers/kislerdm/neon/latest/docs
  - Vercel integration overview: https://neon.com/docs/guides/vercel-overview
  - Neon-Managed Vercel Integration: https://neon.com/docs/guides/neon-managed-vercel-integration
  - Connection pooling: https://neon.com/docs/connect/connection-pooling
- LINE: https://developers.line.biz/en/docs/messaging-api/getting-user-ids/
