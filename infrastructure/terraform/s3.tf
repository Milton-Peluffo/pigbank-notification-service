# ===== S3 Bucket =====

resource "aws_s3_bucket" "notification_templates" {
  bucket = "${var.project_name}-${var.template_bucket_name}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name        = "${var.project_name}-templates-bucket"
    Description = "Almacena templates HTML para notificaciones de email"
  }
}

# Habilitar versionado
resource "aws_s3_bucket_versioning" "notification_templates_versioning" {
  bucket = aws_s3_bucket.notification_templates.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "notification_templates_pab" {
  bucket = aws_s3_bucket.notification_templates.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ===== Outputs =====
output "template_bucket_name" {
  value       = aws_s3_bucket.notification_templates.id
  description = "Nombre del bucket S3 para templates"
}

output "template_bucket_arn" {
  value       = aws_s3_bucket.notification_templates.arn
  description = "ARN del bucket S3 para templates"
}
