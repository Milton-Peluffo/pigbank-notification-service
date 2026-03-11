# ===== SQS Queues =====

# Cola principal para notificaciones
resource "aws_sqs_queue" "notification_queue" {
  name                      = "${var.project_name}-${var.notification_queue_name}"
  visibility_timeout_seconds = 45 # Tiene que ser > que Lambda timeout
  message_retention_seconds  = 14 * 24 * 60 * 60 # 14 días
  
  tags = {
    Name        = "${var.project_name}-notification-queue"
    Description = "Cola principal para procesar notificaciones"
  }
}

# Cola de Dead Letter Queue (DLQ) para mensajes fallidos
resource "aws_sqs_queue" "notification_error_queue" {
  name                     = "${var.project_name}-${var.notification_error_queue_name}"
  message_retention_seconds = 30 * 24 * 60 * 60 # 30 días
  
  tags = {
    Name        = "${var.project_name}-notification-error-queue"
    Description = "DLQ para mensajes que fallaron"
  }
}

# Configurar DLQ redrive policy
resource "aws_sqs_queue_redrive_policy" "notification_queue_dlq" {
  queue_url             = aws_sqs_queue.notification_queue.id
  max_receive_count     = 3 # Máximo 3 reintentos antes de enviar a DLQ
  dead_letter_target_arn = aws_sqs_queue.notification_error_queue.arn
}

# ===== Outputs =====
output "notification_queue_url" {
  value       = aws_sqs_queue.notification_queue.url
  description = "URL de la cola SQS principal"
}

output "notification_queue_arn" {
  value       = aws_sqs_queue.notification_queue.arn
  description = "ARN de la cola SQS principal"
}

output "notification_error_queue_url" {
  value       = aws_sqs_queue.notification_error_queue.url
  description = "URL de la DLQ"
}

output "notification_error_queue_arn" {
  value       = aws_sqs_queue.notification_error_queue.arn
  description = "ARN de la DLQ"
}
