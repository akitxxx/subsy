resource "neon_project" "subsy" {
  name      = "subsy"
  region_id = "aws-ap-northeast-1"

  branch {
    name          = "main"
    database_name = "subsy"
    role_name     = "subsy_owner"
  }

  # サーバーレス環境のためパスワード保存を有効化
  store_password = true
}
