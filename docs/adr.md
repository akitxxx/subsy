# Architecture Decision Records

## ADR-001: Next.js App Router + Hono を API レイヤーとして採用

2025-01-15

- Next.js App Router をフロントエンドフレームワークとして採用
- API レイヤーには Hono を採用し、Next.js API Route 内で動作させる
- Hono RPC によるフロントエンド-API 間の型安全な通信

## ADR-002: Supabase (PostgreSQL + Auth) を DB/認証基盤として採用

2025-01-17

- Supabase を PostgreSQL ホスティング + 認証基盤として採用
- Google OAuth によるサインインフロー
- Supabase CLI でローカル開発環境を構築
- Superseded by ADR-010

## ADR-003: Drizzle ORM 採用

2025-01-15

- 型安全で軽量な ORM として Drizzle を採用
- PostgreSQL との直接接続
- マイグレーション管理も Drizzle Kit で統一

## ADR-004: モジュラーモノリス + 機能ベースのディレクトリ構成

2025-01-15

- `src/web/features/`, `src/api/features/`, `src/shared/` の 3 層構造
- 技術レイヤーではなく機能（feature）単位でコードを整理
- 依存関係は内向き（features → shared → domain）

## ADR-005: Effect 導入（API 層のエラーハンドリング）

2026-03-13

- API 層に Effect を導入し、型安全なエラーハンドリングを実現
- usecase, repository を Effect パイプラインに変換
- `runEffect` ヘルパーで Hono ハンドラーと統合

## ADR-006: OXC (oxlint + oxfmt) 採用（Biome から移行）

2026-03-14

- Biome から OXC（oxlint + oxfmt）に移行
- oxlint: 高速な Rust 製 linter
- oxfmt: Prettier 互換のフォーマッター

## ADR-007: Vite+ を Quality Layer として採用

2026-03-16

- Vite+ で lint / format / test / type check を統合
- 設定を `vite.config.ts` に集約
- tsgo による高速な型チェック対応

## ADR-008: ts-pattern で条件分岐を置き換え

2026-03-13

- switch/if-else を ts-pattern の `match` に置き換え
- 網羅性チェック（exhaustive matching）による型安全性向上
- API 層のハンドラー・ユースケースで使用

## ADR-009: Terraform (HCP Terraform Free) で IaC 管理

2026-03-12

- Terraform でインフラをコード管理
- HCP Terraform Free の Remote execution + VCS 連携
- PR 時に自動 plan、main マージ時に Auto Apply
- 管理対象: Vercel project・環境変数、DB project

## ADR-010: Clerk + Neon 移行（Supabase 置き換え）

2026-03-16 (実施済み)

- Supabase Auth → Clerk に移行（マネージド認証）
- Supabase PostgreSQL → Neon に移行（サーバーレス、scale-to-zero）
- DB クライアント: `postgres` → `@neondatabase/serverless`
- Drizzle ORM ドライバー: `drizzle-orm/postgres-js` → `drizzle-orm/neon-serverless`
- ローカル DB: Supabase CLI → Docker Compose (PostgreSQL)
- Supersedes ADR-002
