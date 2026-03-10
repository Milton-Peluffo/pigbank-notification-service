# Variables del módulo DynamoDB

variable "project_name" {
  type        = string
  description = "Nombre del proyecto"
}

variable "environment" {
  type        = string
  description = "Entorno (dev, staging, prod)"
}

variable "notification_table_name" {
  type        = string
  description = "Nombre de la tabla de notificaciones"
}

variable "error_table_name" {
  type        = string
  description = "Nombre de la tabla de errores"
}

variable "billing_mode" {
  type        = string
  description = "Modo de facturación (PAY_PER_REQUEST o PROVISIONED)"
  default     = "PAY_PER_REQUEST"

  validation {
    condition     = contains(["PAY_PER_REQUEST", "PROVISIONED"], var.billing_mode)
    error_message = "El billing_mode debe ser PAY_PER_REQUEST o PROVISIONED."
  }
}

variable "read_capacity_units" {
  type        = number
  description = "Unidades de capacidad de lectura para modo PROVISIONED"
  default     = 5
}

variable "write_capacity_units" {
  type        = number
  description = "Unidades de capacidad de escritura para modo PROVISIONED"
  default     = 5
}

variable "ttl_days" {
  type        = number
  description = "Días para mantener registros antes de auto-eliminarlos"
  default     = 30
}

variable "tags" {
  type        = map(string)
  description = "Tags para los recursos"
  default     = {}
}
