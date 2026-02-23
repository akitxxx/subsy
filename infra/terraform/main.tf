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
