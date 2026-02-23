resource "vercel_project" "subsy" {
  name = "subsy"
}

# 環境変数の target（environments）は変数ごとに異なる設定が Vercel GUI で行われています。
# import 前に以下のコマンドで実際の設定を確認し、各リソースの target を合わせてください:
#   vercel env ls

resource "vercel_project_environment_variable" "node_env" {
  project_id = vercel_project.subsy.id
  key        = "NODE_ENV"
  value      = "production"
  target     = ["production"]
}

resource "vercel_project_environment_variable" "next_public_app_env" {
  project_id = vercel_project.subsy.id
  key        = "NEXT_PUBLIC_APP_ENV"
  value      = "production"
  target     = ["production"]
}

resource "vercel_project_environment_variable" "database_url" {
  project_id = vercel_project.subsy.id
  key        = "DATABASE_URL"
  value      = "postgresql://postgres.fxqwpmmojaggoqupdwuy:${var.supabase_db_password}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
  target     = ["production"]
}

resource "vercel_project_environment_variable" "line_channel_access_token" {
  project_id = vercel_project.subsy.id
  key        = "LINE_CHANNEL_ACCESS_TOKEN"
  value      = var.line_channel_access_token
  target     = ["production"]
}

resource "vercel_project_environment_variable" "line_channel_secret" {
  project_id = vercel_project.subsy.id
  key        = "LINE_CHANNEL_SECRET"
  value      = var.line_channel_secret
  target     = ["production"]
}

resource "vercel_project_environment_variable" "auth_google_client_id" {
  project_id = vercel_project.subsy.id
  key        = "AUTH_GOOGLE_CLIENT_ID"
  value      = var.auth_google_client_id
  target     = ["production"]
}

resource "vercel_project_environment_variable" "auth_google_client_secret" {
  project_id = vercel_project.subsy.id
  key        = "AUTH_GOOGLE_CLIENT_SECRET"
  value      = var.auth_google_client_secret
  target     = ["production"]
}

resource "vercel_project_environment_variable" "openai_api_key" {
  project_id = vercel_project.subsy.id
  key        = "OPENAI_API_KEY"
  value      = var.openai_api_key
  target     = ["production"]
}

resource "vercel_project_environment_variable" "next_public_api_host" {
  project_id = vercel_project.subsy.id
  key        = "NEXT_PUBLIC_API_HOST"
  value      = var.next_public_api_host
  target     = ["production"]
}

resource "vercel_project_environment_variable" "next_public_supabase_url" {
  project_id = vercel_project.subsy.id
  key        = "NEXT_PUBLIC_SUPABASE_URL"
  value      = "https://${supabase_project.subsy.id}.supabase.co"
  target     = ["production"]
}

resource "vercel_project_environment_variable" "next_public_supabase_anon_key" {
  project_id = vercel_project.subsy.id
  key        = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  value      = var.supabase_anon_key
  target     = ["production"]
}
