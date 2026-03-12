variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "supabase_access_token" {
  description = "Supabase management API access token"
  type        = string
  sensitive   = true
}

variable "supabase_db_password" {
  description = "Supabase database password"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "Supabase anonymous (public) API key"
  type        = string
}

variable "auth_google_client_id" {
  description = "Google OAuth client ID"
  type        = string
}

variable "auth_google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
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
