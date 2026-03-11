variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "pig-bank"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "ses_from_email" {
  description = "Email sender para SES"
  type        = string
  default     = "noreply@pigbank.com"
}

variable "notification_queue_name" {
  description = "Nombre de la cola SQS de entrada"
  type        = string
  default     = "notification-email-sqs"
}

variable "notification_error_queue_name" {
  description = "Nombre de la cola SQS de errores (DLQ)"
  type        = string
  default     = "notification-email-error-sqs"
}

variable "template_bucket_name" {
  description = "Nombre del bucket S3 para templates"
  type        = string
  default     = "templates-email-notification"
}

variable "lambda_timeout" {
  description = "Lambda function timeout en segundos"
  type        = number
  default     = 30
}

variable "lambda_memory" {
  description = "Lambda function memory en MB"
  type        = number
  default     = 512
}

variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs20.x"
}

variable "sqs_batch_size" {
  description = "Tamaño del batch para SQS trigger"
  type        = number
  default     = 10
}

variable "sqs_batch_window" {
  description = "Ventana de batch para SQS en segundos"
  type        = number
  default     = 5
}

variable "log_retention_days" {
  description = "Retención de logs en CloudWatch"
  type        = number
  default     = 14
}
