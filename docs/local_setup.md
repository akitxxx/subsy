# ローカル環境構築手順

このドキュメントでは、Subsyアプリケーションのローカル開発環境を構築する手順を説明します。

## 前提条件

以下のツールがインストールされていることを確認してください：

- Node.js (v20以上)
- pnpm (v10.5.1以上)
- Docker Desktop

## 環境構築手順

### 1. 依存パッケージのインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.example`ファイルを`.env`としてコピーします：

```bash
cp .env.example .env
```

必要に応じて`.env`ファイル内の値を編集してください。特に以下の項目は個別に設定が必要です：

- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### 3. ローカルデータベースの起動

Docker Compose で PostgreSQL を起動します：

```bash
pnpm db:up
```

初回起動時にテスト用DB（`test`）が自動作成されます。

### 4. データベースのマイグレーション

開発用データベースにマイグレーションを適用します：

```bash
pnpm db:reset
```

テスト用データベースにマイグレーションを適用します：

```bash
pnpm db:reset:test
```

### 5. 開発サーバーの起動

```bash
pnpm dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

## テストの実行

すべてのテストを実行するには：

```bash
pnpm test
```

フロントエンドのテストのみを実行するには：

```bash
pnpm test:front
```

バックエンドのテストのみを実行するには：

```bash
pnpm test:back
```
