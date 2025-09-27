# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AI Basic Guidelines

- 基本的には日本語で回答すること
- ファイル操作はUTF-8エンコーディングを使用すること

## 技術スタック

- **フレームワーク**: Next.js with App Router
- **APIレイヤー**: Hono（APIルーティング用）
- **データベース**:
  - Supabase（PostgreSQLデータベースと認証）
  - Drizzle ORM（データベースアクセス）
- **認証**: Clerk（認証管理）
- **UIコンポーネント**:
  - Radix UI（アクセシブルなコンポーネント）
  - Tailwind CSS（スタイリング）
  - shadcn/ui（コンポーネントパターン）
- **状態管理**:
  - SWR（サーバー状態）
  - React Context（クライアント状態）
  - React Hook Form（フォーム状態）
- **テスト**: Vitest
- **リンティング/フォーマッティング**: Biome
- **外部サービス**: LINE Bot SDK、OpenAI API
- **実行環境要件**: Node.js、pnpm

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
# リントの実行
pnpm lint

# コードフォーマット
pnpm format
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
  - `frontend/` - フロントエンド実装
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

1. **クリーンアーキテクチャパターン**: コードベースはオニオンアーキテクチャパターンに従っています：

   - ドメインロジック、アプリケーションサービス、インフラストラクチャ間の明確な分離
   - エンティティクラスと値オブジェクトを用いたドメイン駆動設計の概念

2. **機能ベースの組織化**: コードは技術レイヤーではなく主に機能別に整理されています

   - 各機能は独自のディレクトリにコンポーネント、フック、サービスを持つ
   - 機能ディレクトリ内で関連ファイルを同じ場所に配置

3. **単一責任の原則**: コンポーネントと関数は焦点を絞った責任を持ちます

   - UIコンポーネントはフックを使用してビジネスロジックから分離
   - APIハンドラーはユースケース上の薄いレイヤー

4. **依存関係の内向きフロー**: 依存関係の方向は以下のように流れます：
   - フロントエンド機能 → フロントエンド共有 → 共有
   - API機能 → API共有 → 共有

## API設計

APIレイヤーはHonoを使用してルーティングとリクエスト処理を行います：

1. **ハンドラーパターン**:

   - 各エンドポイントには専用のハンドラー（`*.handler.ts`）がある
   - ハンドラーは入力を検証し、ユースケースを呼び出し、レスポンスを変換
   - ルート定義は`src/api/app/[feature]/route.ts`に配置

2. **ユースケースパターン**:

   - ビジネスロジックはユースケース（`*.usecase.ts`）にカプセル化
   - ユースケースはドメインサービスとリポジトリを調整
   - `src/api/features/[feature]/use-cases/`に配置

3. **エラーハンドリング**:
   - エラークラスとミドルウェアによる標準化されたエラーレスポンス
   - ドメインエラーは適切なHTTPステータスコードにマッピング
   - カスタムエラータイプは`src/api/shared/lib/errors/`に配置

## フロントエンド設計

フロントエンドアーキテクチャはコンポーネントベースのアプローチに従います：

1. **コンポーネント構造**:

   - UIコンポーネントは`frontend/shared/components`に配置
   - 機能固有のコンポーネントは`frontend/features/*/components`に配置
   - コンポーネントはロジック分離のためにフックを使用

2. **フックパターン**:

   - カスタムフックはデータフェッチと状態管理をカプセル化
   - SWRはサーバー状態（キャッシング、再検証）に使用
   - 機能固有のフックは`frontend/features/*/hooks`に配置

3. **スタイリング**:
   - ユーティリティファーストアプローチのTailwind CSS
   - `clsx`と`tailwind-merge`を使用したコンポーネントバリアント

## データベースとデータアクセス

1. **データベース**: Supabase経由のPostgreSQL

2. **ORM**: Drizzle ORM

   - スキーマ定義は`src/api/shared/lib/db/schema.ts`
   - マイグレーションは`drizzle/migrations/`

3. **リポジトリ**:
   - データアクセスのためのリポジトリパターン
   - 各ドメインエンティティは対応するリポジトリを持つ
   - `src/api/shared/domain/*/repository.ts`に配置

## テスト戦略

1. **ユニットテスト**: 個々の関数とコンポーネントのテスト

   - ファイル命名: `*.spec.ts`または`*.spec.tsx`
   - テスト対象のコードと同じ場所に配置

2. **テストセットアップ**:
   - Vitestをテストランナーとして使用
   - テストユーティリティは`src/shared/test/`
   - データベーステストヘルパーは`src/api/shared/test/`

## コア機能

1. **認証（Authentication）**:

   - Clerk経由のGoogle OAuth
   - 認証状態管理
   - 保護されたルートとAPIエンドポイント

2. **ダッシュボード（Dashboard）**:

   - ユーザーデータとサブスクリプションの概要
   - 統計情報のサマリー

3. **サブスクリプション（Subscriptions）**:

   - サブスクリプションのCRUD操作
   - 詳細表示と管理

4. **LINE連携（LINE Integration）**:
   - LINEメッセージのWebhookハンドリング
   - メッセージ内容に基づく機能実行

## 環境変数

主要な環境変数は以下のファイルで管理されます：

- `.env.local`（ローカル開発用）
- `.env.test`（テスト環境用）
- 必要な変数：Clerk、Supabase、LINE Bot、OpenAI の設定

## 追加メモ

- プロジェクトはリンティングとフォーマッティングにBiomeを使用（ESLintではない）
- テストを優先し、TDDアプローチを推奨
- TypeScriptによる型安全性をコードベース全体で強制
- ドメインモデルとビジネスロジックは再利用のために共有レイヤーに配置
- フックパターンを使用してUIからロジックを分離
- 環境固有の設定はNext.jsの環境変数システムで処理
- すべてのAPIルートは`/api/`プレフィックスを持つ
