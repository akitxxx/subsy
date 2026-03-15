output "vercel_project_id" {
  description = "Vercel project ID"
  value       = vercel_project.subsy.id
}

output "neon_project_id" {
  description = "Neon project ID"
  value       = neon_project.subsy.id
}

output "neon_connection_uri_pooler" {
  description = "Neon pooled connection URI"
  value       = neon_project.subsy.connection_uri_pooler
  sensitive   = true
}
