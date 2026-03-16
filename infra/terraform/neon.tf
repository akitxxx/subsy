resource "neon_project" "subsy" {
  name       = "subsy"
  region_id  = "aws-ap-southeast-1"
  pg_version = 18

  branch {
    name          = "main"
    database_name = "subsy"
    role_name     = "subsy_owner"
  }

  # サーバーレス環境のためパスワード保存を有効化
  store_password = "yes"
}
