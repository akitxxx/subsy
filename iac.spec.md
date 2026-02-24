# IaC 化仕様（Terraform）

## 概要

Vercel + Supabase Cloud はすでに稼働中。インフラ設定を壊さず Terraform のコードとして表現し、
git に集約することで AI エージェントが自律的にインフラを把握・操作できる状態にする。
アプローチは「新規作成」ではなく「既存リソースを terraform import で取り込む」。

---

## AI エージェント向け実装ガイドライン

実装を担当する AI エージェントは、不明な情報があれば必ずユーザーに確認してから作業を進めること。
推測や `YOUR_XXX` プレースホルダーのまま実装しない。

確認が必要な情報の例:
- Terraform Cloud の organization 名・workspace 名
- Vercel の project ID・team ID（個人アカウントかチームか）
- Supabase の project reference ID・organization ID・リージョン
- 各種 API token・secret の値
- カスタムドメインの有無

---

## 基本方針: Import-First

1. 既存環境を調査して Terraform コードを書く
2. `terraform import` で既存リソースを state に登録
3. `terraform plan` で "No changes" になれば完成（コードと実態が一致）

---

## 環境情報（確認済み）

| 項目 | 値 |
|------|-----|
| Terraform Cloud organization | `pinolab` |
| Terraform Cloud workspace | `subsy` |
| Vercel アカウント種別 | 個人（Personal）— team_id 不要 |
| Vercel プロジェクト名 | `subsy` |
| Vercel Project ID | `prj_32sdS1T798it6d6eQ4VQe2G6CFLS` |
| カスタムドメイン | なし（`subsy.vercel.app` のみ） |
| Supabase project reference | `fxqwpmmojaggoqupdwuy` |
| Supabase organization slug | `pinolab` |
| Supabase リージョン | `ap-northeast-1`（東京） |

---

## ディレクトリ構成

```
infra/terraform/
├── main.tf                    # provider設定・Terraform Cloud backend
├── variables.tf               # 変数定義
├── outputs.tf                 # 出力値
├── vercel.tf                  # Vercel project・環境変数
├── supabase.tf                # Supabase project・Auth設定
├── .terraform.lock.hcl        # providerバージョンロック（git管理対象）
├── terraform.tfvars.example   # 変数テンプレート（git管理対象）
└── README.md                  # インフラ操作ガイド
.github/workflows/terraform-plan.yml  # PR時にterraform planを実行
```

変更対象:
- `.gitignore` — Terraform関連エントリ追加
- `CLAUDE.md` — インフラ管理セクション追記

---

## main.tf

```hcl
terraform {
  required_version = ">= 1.9"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }

  cloud {
    organization = "pinolab"
    workspaces {
      name = "subsy"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
  # 個人アカウントのため team は不要
}

provider "supabase" {
  access_token = var.supabase_access_token
}
```

---

## variables.tf

`sensitive = true` を設定する変数:
`vercel_api_token`, `supabase_access_token`, `supabase_db_password`,
`auth_google_client_secret`, `openai_api_key`, `line_channel_access_token`, `line_channel_secret`

定義する変数一覧（`.env.example` の本番相当）:

| 変数名 | sensitive | 用途 |
|--------|-----------|------|
| `vercel_api_token` | yes | Vercel API 認証 |
| `supabase_access_token` | yes | Supabase API 認証 |
| `supabase_db_password` | yes | Supabase DB パスワード |
| `auth_google_client_id` | no | Google OAuth Client ID |
| `auth_google_client_secret` | yes | Google OAuth Client Secret |
| `openai_api_key` | yes | OpenAI API キー |
| `line_channel_access_token` | yes | LINE Bot アクセストークン |
| `line_channel_secret` | yes | LINE Bot チャンネルシークレット |
| `next_public_api_host` | no | API ホスト URL（例: `https://subsy.vercel.app`） |

---

## vercel.tf

- `vercel_project.subsy` — 既存プロジェクトを import して管理（ID: `prj_32sdS1T798it6d6eQ4VQe2G6CFLS`）
- `vercel_project_environment_variable.*` — 環境変数を全件定義

### 環境変数リソース一覧

各変数の `environments` は Vercel GUI で個別に設定済み（production のみ・全環境など変数によって異なる）。
実装前に以下で現状を確認し、Terraform コードに正確に反映すること:

```bash
vercel env ls
```

`.env.example` に対応する環境変数（全 11 件）:

| リソース名 | 環境変数キー | 値の参照元 |
|------------|-------------|------------|
| `node_env` | `NODE_ENV` | `"production"` （固定値） |
| `next_public_app_env` | `NEXT_PUBLIC_APP_ENV` | `"production"` （固定値） |
| `database_url` | `DATABASE_URL` | Supabase transaction pooler URL（ポート 6543） |
| `line_channel_access_token` | `LINE_CHANNEL_ACCESS_TOKEN` | `var.line_channel_access_token` |
| `line_channel_secret` | `LINE_CHANNEL_SECRET` | `var.line_channel_secret` |
| `auth_google_client_id` | `AUTH_GOOGLE_CLIENT_ID` | `var.auth_google_client_id` |
| `auth_google_client_secret` | `AUTH_GOOGLE_CLIENT_SECRET` | `var.auth_google_client_secret` |
| `openai_api_key` | `OPENAI_API_KEY` | `var.openai_api_key` |
| `next_public_api_host` | `NEXT_PUBLIC_API_HOST` | `var.next_public_api_host` |
| `next_public_supabase_url` | `NEXT_PUBLIC_SUPABASE_URL` | `supabase_project.subsy` の output |
| `next_public_supabase_anon_key` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `supabase_project.subsy` の output |

DATABASE_URL の形式:
```
postgresql://postgres.fxqwpmmojaggoqupdwuy:[DB_PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

カスタムドメインなし → `vercel_project_domain` リソースは不要。

---

## supabase.tf

- `supabase_project.subsy` — project ref: `fxqwpmmojaggoqupdwuy`、リージョン: `ap-northeast-1`
- `supabase_settings.subsy` — Google OAuth 設定（client_id/secret, site_url, redirect_urls）

実装時に `terraform providers schema -json` で利用可能な属性を確認すること。

---

## terraform.tfvars.example（git管理対象）

全変数のテンプレート。値は `YOUR_XXX` プレースホルダーで記述。
実際の値は `terraform.tfvars`（gitignore対象）に設定する。

---

## .gitignore への追記

```
# Terraform
infra/terraform/.terraform/
infra/terraform/terraform.tfvars
infra/terraform/*.tfstate
infra/terraform/*.tfstate.backup
```

※ `.terraform.lock.hcl` は git 管理対象

---

## terraform-plan.yml

GitHub Actions ワークフローは使用しない。Terraform Cloud の VCS 連携で代替。

TF Cloud workspace 設定（手動・初回のみ）:

- General > Execution Mode: **Remote** に変更
- Version Control: GitHub リポジトリを接続
  - Working Directory: `infra/terraform`
  - VCS Trigger Paths: `infra/terraform/**`（推奨）
- Auto Apply: 有効（main マージ時に自動 apply）

動作:

- PR 時: TF Cloud が Speculative Plan を実行し、PR コメントに結果を投稿
- main マージ時: TF Cloud が自動 apply

---

## State 管理

Terraform Cloud（HCP Terraform Free）、Execution mode: **Remote**（VCS 連携）。

- plan: main ブランチへの PR 時に TF Cloud が自動実行（Speculative Plan）
- apply: PR の main へのマージ時に TF Cloud が自動実行（Auto Apply）
- state: TF Cloud にクラウド保管、ロック・バージョン管理が自動化
- Variables: TF Cloud workspace の Variables に設定（`terraform.tfvars` は不要）

---

## CLAUDE.md 追記内容

インフラ管理セクションを末尾に追加:
- 管理ツール・ディレクトリ構成
- 初回セットアップ手順（`terraform login` → `init` → TF Cloud Variables 設定）
- 主要操作コマンド（`show` / `plan` / `fmt` / `validate`）
- apply は main マージで TF Cloud が自動実行
- 管理対象・管理対象外の明記（スキーマは Drizzle 管理のまま）

---

## 実装順序

### Step 1: コード作成

1. `.gitignore` に Terraform エントリ追加
2. `infra/terraform/` の全ファイル作成
3. `CLAUDE.md` 追記

### Step 2: 環境セットアップ（初回のみ・手動）

4. Terraform Cloud でワークスペース設定
   - organization `pinolab` / workspace `subsy` を作成
   - General > Execution Mode: **Remote** に変更
   - Version Control: GitHub リポジトリを接続
     - Working Directory: `infra/terraform`
     - VCS Trigger Paths: `infra/terraform/**`
   - Auto Apply: 有効
   - Variables: 全変数を Terraform Variables として設定（sensitive 変数は Sensitive にチェック）
5. `terraform login` を実行
6. `terraform init`

### Step 3: Import（既存リソースの取り込み）

```bash
# Vercel project
terraform import vercel_project.subsy prj_32sdS1T798it6d6eQ4VQe2G6CFLS

# Vercel 環境変数（各変数ごとに実行）
# ENV_VAR_ID の取得: vercel env ls --environment=production
# または Vercel API: GET https://api.vercel.com/v9/projects/prj_32sdS1T798it6d6eQ4VQe2G6CFLS/env
terraform import vercel_project_environment_variable.database_url \
  "prj_32sdS1T798it6d6eQ4VQe2G6CFLS/ENV_VAR_ID/production"

# Supabase project
terraform import supabase_project.subsy fxqwpmmojaggoqupdwuy
```

### Step 4: 検証

```bash
terraform plan
# → No changes. Your infrastructure matches the configuration.
```

---

## 注意事項

- Import 完了前に `terraform apply` しない（既存リソースを削除・再作成しない）
- Supabase provider の制限 → 実装時に `terraform providers schema -json` で利用可能な属性を確認
- `terraform destroy` は慎重に（Supabase project 削除で全データ消失）
- データベーススキーマは Drizzle ORM で管理 → Terraform 管理対象外
