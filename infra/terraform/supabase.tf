resource "supabase_project" "subsy" {
  name              = "subsy"
  organization_id   = "pinolab"
  database_password = var.supabase_db_password
  region            = "ap-northeast-1"
}

# Auth 設定（Google OAuth 等）
# 利用可能な属性は以下で確認:
#   terraform providers schema -json | jq '.provider_schemas."registry.terraform.io/supabase/supabase".resource_schemas.supabase_settings'
resource "supabase_settings" "subsy" {
  project_ref = supabase_project.subsy.id

  auth = jsonencode({
    site_url                  = var.next_public_api_host
    additional_redirect_urls  = [var.next_public_api_host]
    external_google_enabled   = true
    external_google_client_id = var.auth_google_client_id
    external_google_secret    = var.auth_google_client_secret
  })
}
