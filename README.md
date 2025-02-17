# Subsy

サブスクリプション管理アプリケーション

## 開発環境のセットアップ

### 必要要件

- Node.js (v18以上)
- pnpm
- Docker (Supabaseのローカル開発用)
- Supabase CLI
  ```bash
  # macOSの場合
  brew install supabase/tap/supabase

  # Windowsの場合（Windows Package Manager）
  winget install supabase.cli

  # Linuxの場合
  curl -fsSL https://cli.supabase.com/install.sh | sh

  # npmを使用する場合（すべてのOS）
  npm install -g supabase
  ```
  詳細は[Supabase CLI公式ドキュメント](https://supabase.com/docs/guides/cli)を参照してください。

### 初期セットアップ手順

1. パッケージのインストール
```bash
pnpm install
```

2. 環境変数の設定
- `.env.development`ファイルを`.env.local`としてコピー
```bash
cp .env.development .env.local
```
- 一部の環境変数については、個別で入力

3. ローカルデータベースの起動
```bash
# Supabaseの開発用DBを起動
pnpm db:up

# テスト用DBを作成（Dockerコマンド）
docker exec supabase_db_subsy createdb -U postgres test
```

4. データベースのマイグレーション
```bash
# 開発用DBのマイグレーション
pnpm db:reset

# テスト用DBのマイグレーション
pnpm db:reset:test
```

5. 開発サーバーの起動
```bash
pnpm dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

6. テストDBのセットアップとテスト実行
```bash
# テスト用DBのマイグレーション
pnpm db:reset:test

# すべてのテストを実行
pnpm test
```

## 開発ガイドライン

- このプロジェクトは [Next.js](https://nextjs.org) App Routerを使用しています
- UIコンポーネントには [shadcn/ui](https://ui.shadcn.com/) を使用しています
- データベースには Supabase (PostgreSQL) を使用しています
- APIルートには [Hono](https://hono.dev/) を使用しています
- ORMには [Drizzle](https://orm.drizzle.team/) を使用しています
