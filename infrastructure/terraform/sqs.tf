# ===== SQS Queues =====

# Cola principal para notificaciones (USAR LA EXISTENTE del compañero)
data "aws_sqs_queue" "notification_queue" {
  name = "notification-email-sqs"
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

# Configurar DLQ redrive policy (referencia a la cola existente)
resource "aws_sqs_queue_redrive_policy" "notification_queue_dlq" {
  queue_url = data.aws_sqs_queue.notification_queue.id
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.notification_error_queue.arn
    maxReceiveCount     = 3
  })
}
