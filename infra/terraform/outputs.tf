output "vercel_project_id" {
  description = "Vercel project ID"
  value       = vercel_project.subsy.id
}

output "supabase_project_id" {
  description = "Supabase project ID (project ref)"
  value       = supabase_project.subsy.id
}

output "supabase_url" {
  description = "Supabase API URL"
  value       = "https://${supabase_project.subsy.id}.supabase.co"
}
