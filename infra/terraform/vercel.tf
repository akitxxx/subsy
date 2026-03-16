resource "vercel_project" "subsy" {
  name      = "subsy"
  framework = "nextjs"

  git_repository = {
    type              = "github"
    repo              = "akitxxx/subsy"
    production_branch = "main"
  }
}

# 環境変数の target（environments）は変数ごとに異なる設定が Vercel GUI で行われています。
# import 前に以下のコマンドで実際の設定を確認し、各リソースの target を合わせてください:
#   vercel env ls

resource "vercel_project_environment_variable" "next_public_app_env" {
  project_id = vercel_project.subsy.id
  key        = "NEXT_PUBLIC_APP_ENV"
  value      = "production"
  target     = ["production"]
}

# DATABASE_URL は Neon-Managed Vercel Integration が preview/development に自動注入する
# Terraform では production のみ管理
resource "vercel_project_environment_variable" "database_url" {
  project_id = vercel_project.subsy.id
  key        = "DATABASE_URL"
  value      = neon_project.subsy.connection_uri_pooler
  target     = ["production"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "clerk_secret_key" {
  project_id = vercel_project.subsy.id
  key        = "CLERK_SECRET_KEY"
  value      = var.clerk_secret_key
  target     = ["production", "preview", "development"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "next_public_clerk_publishable_key" {
  project_id = vercel_project.subsy.id
  key        = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  value      = var.clerk_publishable_key
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "line_channel_access_token" {
  project_id = vercel_project.subsy.id
  key        = "LINE_CHANNEL_ACCESS_TOKEN"
  value      = var.line_channel_access_token
  target     = ["production", "preview", "development"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "line_channel_secret" {
  project_id = vercel_project.subsy.id
  key        = "LINE_CHANNEL_SECRET"
  value      = var.line_channel_secret
  target     = ["production", "preview", "development"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "openai_api_key" {
  project_id = vercel_project.subsy.id
  key        = "OPENAI_API_KEY"
  value      = var.openai_api_key
  target     = ["production", "preview", "development"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "next_public_api_host" {
  project_id = vercel_project.subsy.id
  key        = "NEXT_PUBLIC_API_HOST"
  value      = var.next_public_api_host
  target     = ["production"]
}

resource "vercel_project_environment_variable" "enable_experimental_corepack" {
  project_id = vercel_project.subsy.id
  key        = "ENABLE_EXPERIMENTAL_COREPACK"
  value      = "1"
  target     = ["production", "preview", "development"]
}
