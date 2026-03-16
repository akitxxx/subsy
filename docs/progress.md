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

## TODO: Clerk + Neon アーキテクチャ移行

- Supabase Auth → Clerk（LINE OAuth）
- Supabase PostgreSQL → Neon（サーバーレス）
- 詳細: `docs/workspace/architecture-migration-plan.md`
