# Terraform インフラ管理

Vercel + Supabase のインフラを Terraform で管理します。
アプローチは「既存リソースを `terraform import` で取り込む」Import-First です。

## 前提条件

- Terraform >= 1.9
- Terraform Cloud アカウント（organization: `pinolab`, workspace: `subsy`）
  - Execution mode: **Local** に設定すること
- Vercel API トークン
- Supabase access token

## 初回セットアップ

```bash
# Terraform Cloud にログイン
terraform login

# 変数ファイルを作成
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars を編集して実際の値を設定

# プロバイダーの初期化
terraform init
```

## 既存リソースの Import

### 1. 環境変数 ID の確認

```bash
# Vercel 環境変数の ID 確認（vercel CLI 使用）
vercel env ls

# または Vercel API で確認
curl "https://api.vercel.com/v9/projects/prj_32sdS1T798it6d6eQ4VQe2G6CFLS/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | jq '.envs[] | {id, key, target}'
```

### 2. Import の実行

```bash
# Vercel project
terraform import vercel_project.subsy prj_32sdS1T798it6d6eQ4VQe2G6CFLS

# Vercel 環境変数（各変数ごとに実行。ENV_VAR_ID は上記で確認した ID）
terraform import vercel_project_environment_variable.node_env \
  "prj_32sdS1T798it6d6eQ4VQe2G6CFLS/ENV_VAR_ID"
terraform import vercel_project_environment_variable.next_public_app_env \
  "prj_32sdS1T798it6d6eQ4VQe2G6CFLS/ENV_VAR_ID"
terraform import vercel_project_environment_variable.database_url \
  "prj_32sdS1T798it6d6eQ4VQe2G6CFLS/ENV_VAR_ID"
terraform import vercel_project_environment_variable.line_channel_access_token \
  "prj_32sdS1T798it6d6eQ4VQe2G6CFLS/ENV_VAR_ID"
terraform import vercel_project_environment_variable.line_channel_secret \
  "prj_32sdS1T798it6d6eQ4VQe2G6CFLS/ENV_VAR_ID"
terraform import vercel_project_environment_variable.auth_google_client_id \
  "prj_32sdS1T798it6d6eQ4VQe2G6CFLS/ENV_VAR_ID"
terraform import vercel_project_environment_variable.auth_google_client_secret \
  "prj_32sdS1T798it6d6eQ4VQe2G6CFLS/ENV_VAR_ID"
terraform import vercel_project_environment_variable.openai_api_key \
  "prj_32sdS1T798it6d6eQ4VQe2G6CFLS/ENV_VAR_ID"
terraform import vercel_project_environment_variable.next_public_api_host \
  "prj_32sdS1T798it6d6eQ4VQe2G6CFLS/ENV_VAR_ID"
terraform import vercel_project_environment_variable.next_public_supabase_url \
  "prj_32sdS1T798it6d6eQ4VQe2G6CFLS/ENV_VAR_ID"
terraform import vercel_project_environment_variable.next_public_supabase_anon_key \
  "prj_32sdS1T798it6d6eQ4VQe2G6CFLS/ENV_VAR_ID"

# Supabase project
terraform import supabase_project.subsy fxqwpmmojaggoqupdwuy
```

### 3. 検証

```bash
terraform plan
# → No changes. Your infrastructure matches the configuration.
```

差分が出た場合は、Terraform コードを実際の設定に合わせて修正してください。
特に各環境変数の `target`（environments）は `vercel env ls` で確認した値に合わせること。

## 主要コマンド

```bash
terraform show      # 現在の state を表示
terraform plan      # 差分を確認（apply 前に必ず実行）
terraform apply     # インフラに反映（手動適用）
terraform fmt       # コードフォーマット
terraform validate  # 構文検証
```

## 管理対象

| リソース | 管理 |
|----------|------|
| Vercel project 設定 | Terraform |
| Vercel 環境変数 | Terraform |
| Supabase project | Terraform |
| Supabase Auth 設定 | Terraform |
| データベーススキーマ | Drizzle ORM（Terraform 管理外） |

## 注意事項

- Import 完了前に `terraform apply` しない（既存リソースを削除・再作成してしまう）
- `terraform destroy` は慎重に（Supabase project 削除でデータ全消失）
- `terraform.tfvars` は gitignore 対象（シークレットを含むため絶対にコミットしない）
- `supabase_settings` の属性は `terraform providers schema -json` で確認できる
