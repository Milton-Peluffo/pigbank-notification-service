# Outputs del módulo Lambda

output "function_arn" {
  description = "ARN de la función Lambda"
  value       = aws_lambda_function.notification_handler.arn
}

output "function_name" {
  description = "Nombre de la función Lambda"
  value       = aws_lambda_function.notification_handler.function_name
}

output "function_invoke_arn" {
  description = "Invoke ARN de la función Lambda"
  value       = aws_lambda_function.notification_handler.invoke_arn
}

output "role_arn" {
  description = "ARN del IAM role de Lambda"
  value       = aws_iam_role.lambda_role.arn
}

output "log_group_name" {
  description = "Nombre del CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.lambda_logs.name
}
