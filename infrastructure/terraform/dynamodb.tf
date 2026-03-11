# ===== DynamoDB Tables =====

# Tabla principal para notificaciones exitosas
resource "aws_dynamodb_table" "notification_table" {
  name           = "${var.project_name}-notification-table"
  billing_mode   = "PAY_PER_REQUEST" # Por demanda, no provisioned
  hash_key       = "uuid"
  range_key      = "createdAt"

  attribute {
    name = "uuid"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  stream_enabled = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  tags = {
    Name        = "${var.project_name}-notification-table"
    Description = "Registra notificaciones enviadas exitosamente"
  }
}

# Tabla para notificaciones fallidas
resource "aws_dynamodb_table" "notification_error_table" {
  name           = "${var.project_name}-notification-error-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "uuid"
  range_key      = "createdAt"

  attribute {
    name = "uuid"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  stream_enabled = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  tags = {
    Name        = "${var.project_name}-notification-error-table"
    Description = "Registra notificaciones que fallaron"
  }
}
