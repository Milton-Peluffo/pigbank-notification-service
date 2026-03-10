# Variables del módulo Lambda

variable "project_name" {
  type        = string
  description = "Nombre del proyecto"
}

variable "environment" {
  type        = string
  description = "Entorno (dev, staging, prod)"
}

variable "aws_region" {
  type        = string
  description = "Región de AWS"
}

variable "function_name" {
  type        = string
  description = "Nombre de la función Lambda"
}

variable "handler" {
  type        = string
  description = "Handler de la función (path.function)"
}

variable "runtime" {
  type        = string
  description = "Runtime de la función Lambda"
  default     = "nodejs18.x"
}

variable "timeout" {
  type        = number
  description = "Timeout de la función en segundos"
  default     = 60
}

variable "memory_size" {
  type        = number
  description = "Memoria asignada en MB"
  default     = 512
}

variable "environment_variables" {
  type        = map(string)
  description = "Variables de ambiente para Lambda"
  default     = {}
}

variable "sqs_queue_arn" {
  type        = string
  description = "ARN de la cola SQS"
}

variable "batch_size" {
  type        = number
  description = "Tamaño del batch de mensajes"
  default     = 10
}

variable "batch_window" {
  type        = number
  description = "Ventana de batch en segundos"
  default     = 0
}

variable "maximum_concurrency" {
  type        = number
  description = "Concurrencia máxima"
  default     = 10
}

variable "policy_statements" {
  type = list(object({
    Effect   = string
    Action   = list(string)
    Resource = list(string)
  }))
  description = "Statements de política IAM para la función Lambda"
  default     = []
}

variable "tags" {
  type        = map(string)
  description = "Tags para los recursos"
  default     = {}
}
