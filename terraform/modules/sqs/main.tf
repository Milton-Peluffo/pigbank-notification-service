# SQS Module - Gestiona las colas de mensajes para notificaciones

# Cola Principal de Notificaciones
resource "aws_sqs_queue" "notification_queue" {
  name                      = var.queue_name
  message_retention_seconds = var.message_retention_seconds
  visibility_timeout_seconds = var.visibility_timeout_seconds
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.error_queue.arn
    maxReceiveCount     = var.max_receive_count
  })

  tags = var.tags
}

# Cola de Errores (Dead Letter Queue)
resource "aws_sqs_queue" "error_queue" {
  name                      = var.dlq_name
  message_retention_seconds = var.message_retention_seconds

  tags = var.tags
}

# Políticas de acceso a las colas
resource "aws_sqs_queue_policy" "notification_queue_policy" {
  queue_url = aws_sqs_queue.notification_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "sqs.amazonaws.com"
          ]
        }
        Action   = "sqs:*"
        Resource = aws_sqs_queue.notification_queue.arn
      }
    ]
  })
}

resource "aws_sqs_queue_policy" "error_queue_policy" {
  queue_url = aws_sqs_queue.error_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "sqs.amazonaws.com"
          ]
        }
        Action   = "sqs:*"
        Resource = aws_sqs_queue.error_queue.arn
      }
    ]
  })
}
