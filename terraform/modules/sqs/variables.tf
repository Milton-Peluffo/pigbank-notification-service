# Variables del módulo SQS

variable "project_name" {
  type        = string
  description = "Nombre del proyecto"
}

variable "environment" {
  type        = string
  description = "Entorno (dev, staging, prod)"
}

variable "queue_name" {
  type        = string
  description = "Nombre de la cola SQS"
}

variable "dlq_name" {
  type        = string
  description = "Nombre de la Dead Letter Queue"
}

variable "message_retention_seconds" {
  type        = number
  description = "Tiempo de retención de mensajes en segundos"
  default     = 1209600 # 14 días
}

variable "visibility_timeout_seconds" {
  type        = number
  description = "Timeout de visibilidad de mensajes en segundos"
  default     = 300 # 5 minutos
}

variable "max_receive_count" {
  type        = number
  description = "Número máximo de recepciones antes de enviar a DLQ"
  default     = 3
}

variable "tags" {
  type        = map(string)
  description = "Tags para los recursos"
  default     = {}
}
