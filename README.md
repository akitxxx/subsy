# Subsy

サブスクリプション管理アプリケーション

## 開発環境のセットアップ

### 必要要件

- Node.js (v18以上)
- pnpm
- Docker (Supabaseのローカル開発用)

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
pnpm db:up
```
※ Supabaseのローカル環境を使用するため、事前に`supabase`のセットアップが必要です。
※ `pnpm db:up`実行時に開発用DBと一緒にテスト用DBも自動的に作成されます

4. データベースのマイグレーション
```bash
pnpm db:reset
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

# テストをウォッチモードで実行
pnpm test:watch
```

## 開発ガイドライン

- このプロジェクトは [Next.js](https://nextjs.org) App Routerを使用しています
- UIコンポーネントには [shadcn/ui](https://ui.shadcn.com/) を使用しています
- データベースには Supabase (PostgreSQL) を使用しています

## 困ったときは

- チームのSlackチャンネル `#subsy-dev` で質問してください
- [プロジェクトWiki](https://wiki.example.com/subsy)も参照してください

## ライセンス

社内プロジェクト - All rights reserved
