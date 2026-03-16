terraform {
  required_version = ">= 1.9"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 4.0"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.13"
    }
  }

  cloud {
    organization = "pinolab"
    project = "subsy"
    workspaces {
      name = "subsy"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
  # 個人アカウントのため team は不要
}

provider "neon" {
  api_key = var.neon_api_key
}
