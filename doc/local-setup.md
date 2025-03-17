# ローカル環境構築手順

このドキュメントでは、Subsyアプリケーションのローカル開発環境を構築する手順を説明します。

## 前提条件

以下のツールがインストールされていることを確認してください：

- Node.js (v20以上)
- pnpm (v10.5.1以上)
- Docker Desktop
- Supabase CLI

### Supabase CLIのインストール

```bash
npm install -g supabase
```

## 環境構築手順

### 1. 依存パッケージのインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.example`ファイルを`.env`としてコピーします：

```bash
cp .env.example.env
```

必要に応じて`.env`ファイル内の値を編集してください。特に以下の項目は個別に設定が必要な場合があります：

- `AUTH_GOOGLE_CLIENT_ID`
- `AUTH_GOOGLE_CLIENT_SECRET`

### 3. ローカルデータベースの起動

Supabaseのローカル開発環境を起動します：

```bash
pnpm db:up
```

テスト用データベースを作成します：

```bash
docker exec supabase_db_subsy createdb -U postgres test
```

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