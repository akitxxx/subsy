# AGENT.md

This file provides guidance to AI coding agents when working with code in this repository.

## AI Conversation Guidelines

基本的には日本語で回答すること

## 開発方針

- プロジェクトのすべてのコンテキスト（コード、インフラ、設定、ドキュメント）をgitで管理する
- AIが自律的に開発できる状態を目指し、必要な情報はリポジトリ内に集約する

## Docs (MUST keep up-to-date)

以下のドキュメントは実装と同期していなければならない。該当する変更を行った場合、同じコミットまたは同じ作業の中で必ず更新すること。

- `docs/context.md` - プロジェクトの背景、意思決定の経緯、ペンディング事項
- `docs/progress.md` - 実装の進捗記録。主要マイルストーン達成時に更新
- `docs/adr.md` - Architecture Decision Records。技術的な意思決定を行った場合は必ず新しい ADR を追記

## 技術スタック

- フレームワーク: Next.js with App Router (v15.1.4)
- APIレイヤー: Hono（APIルーティング用）
- データベース:
  - Supabase（PostgreSQLデータベースと認証）
  - Drizzle ORM（データベースアクセス）
- 認証: Clerk（認証管理）
- UIコンポーネント:
  - Radix UI（アクセシブルなコンポーネント）
  - Tailwind CSS（スタイリング）
  - shadcn/ui（コンポーネントパターン）
- 状態管理:
  - SWR（サーバー状態）
  - React Context（クライアント状態）
  - React Hook Form（フォーム状態）
- テスト: Vite+ (Vitest)
- リンティング/フォーマッティング: Vite+ (Oxlint + Oxfmt + TypeScript type check)
- 外部サービス: LINE Bot SDK、OpenAI API
- 実行環境要件: Node.js v20以上、pnpm v10.5.2以上

## よく使うコマンド

### 開発

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動（Turbopack使用）
pnpm dev

# プロダクションビルド
pnpm build

# プロダクションサーバーの起動
pnpm start
```

### コード品質

```bash
# lint + format + type check を一括実行
pnpm check

# リントの実行
pnpm lint

# コードフォーマット
pnpm format

# 型チェックのみ実行
pnpm typecheck
```

### テスト

```bash
# 全テストの実行
pnpm test

# フロントエンドテストのみ実行
pnpm test:front

# バックエンドテストのみ実行
pnpm test:back

# 特定のテストファイルを実行
pnpm test path/to/test.spec.ts

# ウォッチモードでテストを実行
pnpm test --watch
```

### データベース操作

```bash
# ローカルSupabaseの起動
pnpm db:up

# ローカルSupabaseの停止
pnpm db:down

# マイグレーションファイルの生成
pnpm db:generate

# 開発用データベースへのマイグレーション実行
pnpm db:migrate

# テスト用データベースへのマイグレーション実行
pnpm db:migrate:test

# 開発用データベースのリセット（削除と再作成）
pnpm db:reset

# テスト用データベースのリセット（削除と再作成）
pnpm db:reset:test
```

## アーキテクチャ概要

プロジェクトはモジュラーモノリスアーキテクチャを採用し、関心事の明確な分離を実現しています：

```
クライアント層 (frontend) → 共有層 (shared) ← サーバー層 (api)
```

### 主要ディレクトリ

- `src/` - ソースコードのルート
  - `app/` - Next.js App Routerのページとレイアウト
  - `web/` - フロントエンド実装
    - `features/` - 機能別モジュール（auth、dashboard、subscriptions等）
    - `shared/` - 共通コンポーネント、フック、ユーティリティ
  - `api/` - API実装
    - `features/` - 機能別APIモジュール
    - `shared/` - 共通APIユーティリティ、ドメインロジック、エラーハンドリング
  - `shared/` - フロントエンドとAPI間の共有コード
    - `domain/` - ドメインモデルとロジック
    - `enums/` - 列挙型
    - `types/` - 共通型定義
    - `utils/` - 共有ユーティリティ関数
    - `lib/` - ライブラリ統合

### 設計原則

1. クリーンアーキテクチャパターン: コードベースはオニオンアーキテクチャパターンに従っています：

   - ドメインロジック、アプリケーションサービス、インフラストラクチャ間の明確な分離
   - エンティティクラスと値オブジェクトを用いたドメイン駆動設計の概念

2. 機能ベースの組織化: コードは技術レイヤーではなく主に機能別に整理されています

   - 各機能は独自のディレクトリにコンポーネント、フック、サービスを持つ
   - 機能ディレクトリ内で関連ファイルを同じ場所に配置

3. 単一責任の原則: コンポーネントと関数は焦点を絞った責任を持ちます

   - UIコンポーネントはフックを使用してビジネスロジックから分離
   - APIハンドラーはユースケース上の薄いレイヤー

4. 依存関係の内向きフロー: 依存関係の方向は以下のように流れます：
   - フロントエンド機能 → フロントエンド共有 → 共有
   - API機能 → API共有 → 共有

## API設計

APIレイヤーはHonoを使用してルーティングとリクエスト処理を行います：

1. ハンドラーパターン:

   - 各エンドポイントには専用のハンドラー（`*.handler.ts`）がある
   - ハンドラーは入力を検証し、ユースケースを呼び出し、レスポンスを変換
   - ルート定義は`src/api/app/[feature]/route.ts`に配置

2. ユースケースパターン:

   - ビジネスロジックはユースケース（`*.usecase.ts`）にカプセル化
   - ユースケースはドメインサービスとリポジトリを調整
   - `src/api/features/[feature]/use-cases/`に配置

3. エラーハンドリング:
   - エラークラスとミドルウェアによる標準化されたエラーレスポンス
   - ドメインエラーは適切なHTTPステータスコードにマッピング
   - カスタムエラータイプは`src/api/shared/lib/errors/`に配置

## フロントエンド設計

フロントエンドアーキテクチャはコンポーネントベースのアプローチに従います：

1. コンポーネント構造:

   - UIコンポーネントは`web/shared/components`に配置
   - 機能固有のコンポーネントは`web/features/*/components`に配置
   - コンポーネントはロジック分離のためにフックを使用

2. フックパターン:

   - カスタムフックはデータフェッチと状態管理をカプセル化
   - SWRはサーバー状態（キャッシング、再検証）に使用
   - 機能固有のフックは`web/features/*/hooks`に配置

3. スタイリング:
   - ユーティリティファーストアプローチのTailwind CSS
   - `clsx`と`tailwind-merge`を使用したコンポーネントバリアント

## データベースとデータアクセス

1. データベース: Supabase経由のPostgreSQL

2. ORM: Drizzle ORM

   - スキーマ定義は`src/api/shared/lib/db/schema.ts`
   - マイグレーションは`drizzle/migrations/`

3. リポジトリ:
   - データアクセスのためのリポジトリパターン
   - 各ドメインエンティティは対応するリポジトリを持つ
   - `src/api/shared/domain/*/repository.ts`に配置

## テスト戦略

1. ユニットテスト: 個々の関数とコンポーネントのテスト

   - ファイル命名: `*.spec.ts`または`*.spec.tsx`
   - テスト対象のコードと同じ場所に配置

2. テストセットアップ:
   - Vite+ (Vitest) をテストランナーとして使用
   - テストユーティリティは`src/shared/test/`
   - データベーステストヘルパーは`src/api/shared/test/`

## コア機能

1. 認証（Authentication）:

   - Clerk経由のGoogle OAuth
   - 認証状態管理
   - 保護されたルートとAPIエンドポイント

2. ダッシュボード（Dashboard）:

   - ユーザーデータとサブスクリプションの概要
   - 統計情報のサマリー

3. サブスクリプション（Subscriptions）:

   - サブスクリプションのCRUD操作
   - 詳細表示と管理

4. LINE連携（LINE Integration）:
   - LINEメッセージのWebhookハンドリング
   - メッセージ内容に基づく機能実行

## 環境変数

主要な環境変数は以下のファイルで管理されます：

- `.env.local`（ローカル開発用）
- `.env.test`（テスト環境用）
- 必要な変数：Clerk、Supabase、LINE Bot、OpenAI の設定

## 追加メモ

- プロジェクトはVite+を使用（lint/format/test/type checkを統合、設定は`vite.config.ts`に集約）
- テストを優先し、TDDアプローチを推奨
- TypeScriptによる型安全性をコードベース全体で強制
- ドメインモデルとビジネスロジックは再利用のために共有レイヤーに配置
- フックパターンを使用してUIからロジックを分離
- 環境固有の設定はNext.jsの環境変数システムで処理
- すべてのAPIルートは`/api/`プレフィックスを持つ

## インフラ管理（Terraform）

### 管理ツールとディレクトリ

- ツール: Terraform（HCP Terraform Free、Execution mode: Remote / VCS 連携）
- コード: `infra/terraform/`
- plan: main ブランチへの PR 時に TF Cloud が自動実行
- apply: main マージ時に TF Cloud が自動実行（Auto Apply）

### 初回セットアップ

TF Cloud workspace で VCS 連携・Variables 設定後:

```bash
cd infra/terraform
terraform login
terraform init
```

### 主要コマンド

```bash
terraform show      # state 表示
terraform plan      # 差分確認（ローカル確認用）
terraform fmt       # フォーマット
terraform validate  # 構文検証
# apply は main マージで TF Cloud が自動実行
```

### 管理対象・管理対象外

| リソース | 管理 |
|----------|------|
| Vercel project・環境変数 | Terraform |
| Supabase project・Auth 設定 | Terraform |
| データベーススキーマ | Drizzle ORM（Terraform 管理外） |
