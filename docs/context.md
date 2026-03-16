# Context

## コアコンセプト

サブスクリプション管理アプリ。LINE をメイン UI とし、LINE 上でサブスク登録・通知・管理を完結させる。Web ダッシュボードは補助的な位置づけ。

## ターゲットユーザー

LINE ユーザー（日本）

## 差別化ポイント

- LINE でサブスク登録・通知・管理をすべて完結
- Web ダッシュボードは補助（詳細確認・一括操作向け）

## 現在のフェーズ

MVP 開発中

## 技術基盤

- 認証: Clerk（マネージド認証）
- データベース: Neon（サーバーレス PostgreSQL）
- ORM: Drizzle ORM
- ローカル DB: Docker Compose (PostgreSQL)
