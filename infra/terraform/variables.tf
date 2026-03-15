variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "neon_api_key" {
  description = "Neon API key"
  type        = string
  sensitive   = true
}

variable "clerk_secret_key" {
  description = "Clerk secret key for backend API"
  type        = string
  sensitive   = true
}

variable "clerk_publishable_key" {
  description = "Clerk publishable key for frontend"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}

variable "line_channel_access_token" {
  description = "LINE Bot channel access token"
  type        = string
  sensitive   = true
}

variable "line_channel_secret" {
  description = "LINE Bot channel secret"
  type        = string
  sensitive   = true
}

variable "next_public_api_host" {
  description = "API host URL (e.g. https://subsy.vercel.app)"
  type        = string
}
