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

## ペンディング事項

- Clerk + Neon 移行が最優先（`docs/workspace/architecture-migration-plan.md` 参照）
  - Supabase Auth → Clerk（LINE OAuth 対応）
  - Supabase PostgreSQL → Neon（サーバーレス PostgreSQL）
