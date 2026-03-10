module "dynamodb" {
  source = "./modules/dynamodb"

  project_name = var.project_name
  environment  = var.environment

  # Tabla de notificaciones exitosas
  notification_table_name = "${var.project_name}-notification-table"
  
  # Tabla de errores
  error_table_name = "${var.project_name}-notification-error-table"

  # Configuración de capacidad (usar on-demand para desarrollo)
  billing_mode = var.environment == "prod" ? "PROVISIONED" : "PAY_PER_REQUEST"

  # Solo para modo provisioned
  read_capacity_units  = 5
  write_capacity_units = 5

  # TTL configuración (30 días)
  ttl_days = 30

  tags = {
    Name = "${var.project_name}-notification-tables"
  }
}
