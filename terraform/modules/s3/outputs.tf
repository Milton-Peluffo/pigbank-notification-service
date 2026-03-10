# Outputs del módulo S3

output "templates_bucket_name" {
  description = "Nombre del bucket de templates"
  value       = aws_s3_bucket.templates_bucket.id
}

output "templates_bucket_arn" {
  description = "ARN del bucket de templates"
  value       = aws_s3_bucket.templates_bucket.arn
}

output "templates_bucket_region" {
  description = "Región del bucket de templates"
  value       = aws_s3_bucket.templates_bucket.region
}
