# Outputs del módulo SQS

output "notification_queue_url" {
  description = "URL de la cola de notificaciones"
  value       = aws_sqs_queue.notification_queue.url
}

output "notification_queue_arn" {
  description = "ARN de la cola de notificaciones"
  value       = aws_sqs_queue.notification_queue.arn
}

output "error_queue_url" {
  description = "URL de la Dead Letter Queue"
  value       = aws_sqs_queue.error_queue.url
}

output "error_queue_arn" {
  description = "ARN de la Dead Letter Queue"
  value       = aws_sqs_queue.error_queue.arn
}
