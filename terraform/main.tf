terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Descomentar y configurar el backend para producción
  # backend "s3" {
  #   bucket         = "pigbank-terraform-state"
  #   key            = "notification-service/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Service     = "notification-service"
      ManagedBy   = "terraform"
      CreatedAt   = timestamp()
    }
  }
}

# Variables globales
variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
  default     = "dev"
}

variable "project_name" {
  type        = string
  description = "Project name"
  default     = "pigbank"
}

variable "service_name" {
  type        = string
  description = "Service name"
  default     = "notification-service"
}

# Outputs globales
output "notification_queue_url" {
  description = "URL de la cola SQS de notificaciones"
  value       = module.sqs.notification_queue_url
}

output "notification_queue_arn" {
  description = "ARN de la cola SQS de notificaciones"
  value       = module.sqs.notification_queue_arn
}

output "error_queue_url" {
  description = "URL de la cola SQS de errores (DLQ)"
  value       = module.sqs.error_queue_url
}

output "lambda_function_arn" {
  description = "ARN de la función Lambda principal"
  value       = module.lambda.function_arn
}

output "lambda_function_name" {
  description = "Nombre de la función Lambda principal"
  value       = module.lambda.function_name
}

output "notification_table_name" {
  description = "Nombre de la tabla DynamoDB de notificaciones"
  value       = module.dynamodb.notification_table_name
}

output "templates_bucket_name" {
  description = "Nombre del bucket S3 de plantillas"
  value       = module.s3.templates_bucket_name
}
