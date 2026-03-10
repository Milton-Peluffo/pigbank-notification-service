# S3 Module - Gestiona el bucket de plantillas de email

# Bucket S3 para templates
resource "aws_s3_bucket" "templates_bucket" {
  bucket = var.templates_bucket_name

  tags = var.tags
}

# Versionado del bucket
resource "aws_s3_bucket_versioning" "templates_versioning" {
  bucket = aws_s3_bucket.templates_bucket.id

  versioning_configuration {
    status = var.versioning_enabled ? "Enabled" : "Suspended"
  }
}

# Encriptación del bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "templates_encryption" {
  bucket = aws_s3_bucket.templates_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = var.sse_algorithm
    }
  }
}

# Bloquear acceso público
resource "aws_s3_bucket_public_access_block" "templates_pab" {
  bucket = aws_s3_bucket.templates_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Política del bucket para permitir acceso a Lambda
resource "aws_s3_bucket_policy" "templates_policy" {
  bucket = aws_s3_bucket.templates_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowLambdaReadTemplates"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.templates_bucket.arn,
          "${aws_s3_bucket.templates_bucket.arn}/*"
        ]
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.templates_pab]
}

# Lifecycle policy para eliminar versiones antiguas
resource "aws_s3_bucket_lifecycle_configuration" "templates_lifecycle" {
  bucket = aws_s3_bucket.templates_bucket.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}
