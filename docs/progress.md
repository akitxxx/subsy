# Progress

## 2025-01-15: プロジェクト初期構築

- Next.js App Router + Hono + Supabase + Drizzle ORM でプロジェクト作成
- Biome（linter/formatter）、Lefthook（git hooks）を導入
- 基本的な機能ベースのディレクトリ構成を確立

## 2025-01-17: テスト・ローカル DB 環境整備

- Vitest 導入
- Supabase CLI でローカル開発環境構築

## 2025-01-22 〜 2025-02: 認証・API・フロントエンド実装

- Supabase Auth による Google OAuth サインイン実装
- Hono RPC によるフロントエンド-API 間の型安全通信
- SWR によるデータフェッチ
- サブスクリプション CRUD、ダッシュボード、LINE Webhook の基本実装

## 2025-03-02: Clerk パッケージ追加

- `@clerk/nextjs`, `@hono/clerk-auth` を追加（移行準備）

## 2026-02-22: フロントエンドディレクトリ名変更

- `src/frontend` → `src/web` にリネーム

## 2026-03-12: Terraform IaC 導入

- Vercel + Supabase を Terraform で管理開始
- HCP Terraform Free（Remote execution + VCS 連携）

## 2026-03-13 〜 03-14: Effect + ts-pattern リファクタリング

- API 層に Effect を導入（usecase, repository を Effect パイプラインに変換）
- switch/if-else を ts-pattern に置き換え
- エラーハンドリングの型安全性向上

## 2026-03-14: Biome → OXC 移行

- Biome から oxlint + oxfmt に移行

## 2026-03-16: Terraform Neon 移行

- Terraform 管理対象を Supabase → Neon に切り替え
- Neon project / database / role を Terraform で構築

## 2026-03-16: Vite+ 導入

- Vite+ で lint / format / test / type check を統合
- tsgo による型チェック対応

## 2026-03-16: Clerk + Neon アーキテクチャ移行

- Supabase Auth → Clerk に移行完了
  - Next.js middleware で `clerkMiddleware()` による保護ルート制御
  - Hono API で `@hono/clerk-auth` による認証
  - 初回 API アクセス時に Clerk userId で DB ユーザーを自動作成（lazy create）
  - `<ClerkProvider>`, `<UserButton>`, `<SignIn>` 等の Clerk UI コンポーネント導入
- Supabase PostgreSQL → Neon に移行完了
  - DB クライアント: `postgres` → `@neondatabase/serverless` (Pool)
  - Drizzle ORM ドライバー: `drizzle-orm/postgres-js` → `drizzle-orm/neon-serverless`
- ローカル DB: Supabase CLI → Docker Compose (PostgreSQL 18)
- Supabase 関連コード・設定を全削除

## 2026-03-16: コード品質改善 + 開発環境整備

- Clerk+Neon 移行コードのリファクタリング
  - DB 接続のシングルトン化（接続リーク防止）
  - neonConfig 設定の共通ヘルパー抽出
  - route.ts の重複クエリ除去、`findByProviderId` 追加
  - `as string` 型アサーションをランタイムチェックに置換
- テスト失敗 3 件修正（vi.mock パス解決、onError ハンドラ不足）
- lint errors 7 件 + warnings 15 件をすべて解消
- Pre-commit hooks を Vite+ (`vp staged`) に統一、Lefthook 除去

## 2026-03-16: P0 ブロッカー解消

- ホームページリダイレクト: `src/app/page.tsx` で認証済みユーザーを `/dashboard` へ redirect
- サインアウト後リダイレクト: `ClerkProvider` に `afterSignOutUrl="/sign-in"` を設定
- エラーハンドリング UI:
  - `src/app/not-found.tsx` 新規作成（404ページ）
  - ダッシュボードに SWR エラー表示（エラーメッセージ + 再試行ボタン）とローディング Skeleton を追加
  - `useGetSubscriptions` に `refetch` を追加

## 次のタスク

### P1 - 重要

- テストカバレッジ拡大（フロントエンドテスト追加）
- バリデーション強化（金額形式・日付妥当性チェック）

### P2 - 改善

- UI/UX 改善（モバイル最適化）
- サブスク一覧のフィルタ・ソート
- ヘルスチェック エンドポイント（`/api/health`）
