# Outputs del módulo DynamoDB

output "notification_table_name" {
  description = "Nombre de la tabla de notificaciones"
  value       = aws_dynamodb_table.notification_table.name
}

output "notification_table_arn" {
  description = "ARN de la tabla de notificaciones"
  value       = aws_dynamodb_table.notification_table.arn
}

output "error_table_name" {
  description = "Nombre de la tabla de errores"
  value       = aws_dynamodb_table.error_table.name
}

output "error_table_arn" {
  description = "ARN de la tabla de errores"
  value       = aws_dynamodb_table.error_table.arn
}
