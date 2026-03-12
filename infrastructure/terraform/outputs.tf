# ===== SQS Outputs =====

output "notification_queue_url" {
  value       = data.aws_sqs_queue.notification_queue.url
  description = "URL de la cola SQS principal para notificaciones"
}

output "notification_queue_arn" {
  value       = data.aws_sqs_queue.notification_queue.arn
  description = "ARN de la cola SQS principal"
}

output "notification_error_queue_url" {
  value       = aws_sqs_queue.notification_error_queue.url
  description = "URL de la Dead Letter Queue (DLQ)"
}

output "notification_error_queue_arn" {
  value       = aws_sqs_queue.notification_error_queue.arn
  description = "ARN de la DLQ"
}

# ===== DynamoDB Outputs =====

output "notification_table_name" {
  value       = aws_dynamodb_table.notification_table.name
  description = "Nombre de la tabla de notificaciones exitosas"
}

output "notification_table_arn" {
  value       = aws_dynamodb_table.notification_table.arn
  description = "ARN de la tabla de notificaciones"
}

output "notification_error_table_name" {
  value       = aws_dynamodb_table.notification_error_table.name
  description = "Nombre de la tabla de notificaciones con error"
}

output "notification_error_table_arn" {
  value       = aws_dynamodb_table.notification_error_table.arn
  description = "ARN de la tabla de notificaciones con error"
}

# ===== S3 Outputs =====

output "template_bucket_name" {
  value       = aws_s3_bucket.notification_templates.id
  description = "Nombre del bucket S3 para templates HTML"
}

output "template_bucket_arn" {
  value       = aws_s3_bucket.notification_templates.arn
  description = "ARN del bucket S3"
}

# ===== Lambda Outputs =====

output "lambda_send_notifications_arn" {
  value       = aws_lambda_function.send_notifications.arn
  description = "ARN de la Lambda principal de notificaciones"
}

output "lambda_send_notifications_function_name" {
  value       = aws_lambda_function.send_notifications.function_name
  description = "Nombre de la Lambda principal"
}

output "lambda_send_notifications_role_arn" {
  value       = aws_iam_role.lambda_exec_role.arn
  description = "ARN del rol IAM de Lambda"
}

output "lambda_error_arn" {
  value       = aws_lambda_function.send_notifications_error.arn
  description = "ARN de la Lambda manejadora de errores"
}

output "lambda_error_function_name" {
  value       = aws_lambda_function.send_notifications_error.function_name
  description = "Nombre de la Lambda manejadora de errores"
}

# ===== Summary Output =====

output "deployment_summary" {
  value = {
    notification_queue_url = data.aws_sqs_queue.notification_queue.url
    error_queue_url        = aws_sqs_queue.notification_error_queue.url
    notification_table     = aws_dynamodb_table.notification_table.name
    error_table            = aws_dynamodb_table.notification_error_table.name
    template_bucket        = aws_s3_bucket.notification_templates.id
    lambda_main            = aws_lambda_function.send_notifications.function_name
    lambda_error           = aws_lambda_function.send_notifications_error.function_name
  }
  description = "Resumen de los recursos desplegados"
}
