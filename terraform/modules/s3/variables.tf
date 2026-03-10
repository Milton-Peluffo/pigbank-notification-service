# Variables del módulo S3

variable "project_name" {
  type        = string
  description = "Nombre del proyecto"
}

variable "environment" {
  type        = string
  description = "Entorno (dev, staging, prod)"
}

variable "templates_bucket_name" {
  type        = string
  description = "Nombre del bucket S3 para templates"
}

variable "versioning_enabled" {
  type        = bool
  description = "Habilitar versionado en el bucket"
  default     = true
}

variable "sse_algorithm" {
  type        = string
  description = "Algoritmo de encriptación (AES256 o aws:kms)"
  default     = "AES256"

  validation {
    condition     = contains(["AES256", "aws:kms"], var.sse_algorithm)
    error_message = "El sse_algorithm debe ser AES256 o aws:kms."
  }
}

variable "tags" {
  type        = map(string)
  description = "Tags para los recursos"
  default     = {}
}
