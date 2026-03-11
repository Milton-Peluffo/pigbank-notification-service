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
  message_retention_seconds = 14 * 24 * 60 * 60 # 14 días
  
  tags = {
    Name        = "${var.project_name}-notification-error-queue"
    Description = "DLQ para mensajes que fallaron"
  }
}

# Configurar DLQ redrive policy
resource "aws_sqs_queue_redrive_policy" "notification_queue_dlq" {
  queue_url = aws_sqs_queue.notification_queue.id
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.notification_error_queue.arn
    maxReceiveCount     = 3
  })
}
