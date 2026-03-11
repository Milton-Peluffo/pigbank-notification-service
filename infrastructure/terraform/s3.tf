# ===== S3 Bucket for Templates =====

resource "aws_s3_bucket" "notification_templates" {
  bucket = "${var.project_name}-${var.template_bucket_name}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name        = "${var.project_name}-notification-templates"
    Description = "Bucket para templates HTML de notificaciones"
  }
}

# Configurar el bucket para acceso público a los templates (si es necesario)
resource "aws_s3_bucket_public_access_block" "notification_templates" {
  bucket = aws_s3_bucket.notification_templates.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Habilitar versionado
resource "aws_s3_bucket_versioning" "notification_templates_versioning" {
  bucket = aws_s3_bucket.notification_templates.id

  versioning_configuration {
    status = "Enabled"
  }
}

