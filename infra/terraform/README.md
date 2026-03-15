# Terraform インフラ管理

Vercel + Neon のインフラを Terraform で管理します。

## 前提条件

- Terraform >= 1.9
- Terraform Cloud アカウント（organization: `pinolab`, workspace: `subsy`）
  - Execution mode: Remote（VCS 連携）
- TF Cloud workspace の Variables に全変数を設定済みであること

## 初回セットアップ

```bash
# Terraform Cloud にログイン
terraform login

# プロバイダーの初期化
terraform init
```

## 主要コマンド

```bash
terraform show      # 現在の state を表示
terraform plan      # 差分確認（ローカル確認用、実行は TF Cloud 上）
terraform fmt       # コードフォーマット
terraform validate  # 構文検証
# apply は main マージで TF Cloud が自動実行（Auto Apply）
```

## 管理対象

| リソース | 管理 |
|----------|------|
| Vercel project 設定 | Terraform |
| Vercel 環境変数 | Terraform |
| Neon project / branch / role / database | Terraform |
| Neon preview branching | Neon-Managed Vercel Integration |
| Clerk 設定 | Clerk Dashboard（Terraform 管理外） |
| データベーススキーマ | Drizzle ORM（Terraform 管理外） |

## 責務分担

- Terraform: インフラの土台（Neon project / main branch / role / database、Vercel project / 環境変数）
- Neon-Managed Vercel Integration: preview branch の動的管理（自動作成・自動削除・環境変数注入）
- Clerk: Dashboard で設定管理（Terraform 管理外）

## 注意事項

- `terraform destroy` は慎重に（Neon project 削除でデータ全消失）
- シークレットは TF Cloud Variables で管理（ローカルに `terraform.tfvars` は不要）
- Neon の DATABASE_URL は production のみ Terraform 管理。preview/development は Neon-Managed Integration が自動注入
