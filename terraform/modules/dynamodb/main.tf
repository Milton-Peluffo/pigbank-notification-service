# DynamoDB Module - Gestiona las tablas para logs de notificaciones

# Tabla de notificaciones exitosas
resource "aws_dynamodb_table" "notification_table" {
  name           = var.notification_table_name
  billing_mode   = var.billing_mode
  hash_key       = "notificationId"
  range_key      = "createdAt"

  # Atributos de la tabla
  attribute {
    name = "notificationId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  # Global Secondary Index para buscar por email
  global_secondary_index {
    name            = "email-createdAt-index"
    hash_key        = "email"
    range_key       = "createdAt"
    projection_type = "ALL"

    # Solo si es modo provisioned
    dynamic "read_capacity_units" {
      for_each = var.billing_mode == "PROVISIONED" ? [1] : []
      content {
        read_capacity_units = var.read_capacity_units
      }
    }

    dynamic "write_capacity_units" {
      for_each = var.billing_mode == "PROVISIONED" ? [1] : []
      content {
        write_capacity_units = var.write_capacity_units
      }
    }
  }

  attribute {
    name = "email"
    type = "S"
  }

  # Configuración de capacidad si es provisioned
  dynamic "read_capacity_units" {
    for_each = var.billing_mode == "PROVISIONED" ? [1] : []
    content {
      read_capacity_units = var.read_capacity_units
    }
  }

  dynamic "write_capacity_units" {
    for_each = var.billing_mode == "PROVISIONED" ? [1] : []
    content {
      write_capacity_units = var.write_capacity_units
    }
  }

  # TTL para limpiar registros antiguos
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = var.tags
}

# Tabla de errores
resource "aws_dynamodb_table" "error_table" {
  name           = var.error_table_name
  billing_mode   = var.billing_mode
  hash_key       = "notificationId"
  range_key      = "createdAt"

  attribute {
    name = "notificationId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "email-createdAt-index"
    hash_key        = "email"
    range_key       = "createdAt"
    projection_type = "ALL"

    dynamic "read_capacity_units" {
      for_each = var.billing_mode == "PROVISIONED" ? [1] : []
      content {
        read_capacity_units = var.read_capacity_units
      }
    }

    dynamic "write_capacity_units" {
      for_each = var.billing_mode == "PROVISIONED" ? [1] : []
      content {
        write_capacity_units = var.write_capacity_units
      }
    }
  }

  attribute {
    name = "email"
    type = "S"
  }

  dynamic "read_capacity_units" {
    for_each = var.billing_mode == "PROVISIONED" ? [1] : []
    content {
      read_capacity_units = var.read_capacity_units
    }
  }

  dynamic "write_capacity_units" {
    for_each = var.billing_mode == "PROVISIONED" ? [1] : []
    content {
      write_capacity_units = var.write_capacity_units
    }
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = var.tags
}
