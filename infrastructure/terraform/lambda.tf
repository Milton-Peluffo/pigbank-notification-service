# Obtener Current Account ID
data "aws_caller_identity" "current" {}

# ===== Lambdas =====

# 1. Lambda Principal: send-notifications
resource "aws_lambda_function" "send_notifications" {
  function_name = "${var.project_name}-send-notifications"
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "send-notifications.handler"
  runtime       = var.lambda_runtime
  
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory

  # Referencia al archivo zip compilado (asumimos que está en dist/)
  # Esto es temporal; idealmente usaríamos esbuild para empaquetar
  filename = data.archive_file.lambda_send_notifications.output_path
  source_code_hash = data.archive_file.lambda_send_notifications.output_base64sha256

  environment {
    variables = {
      TABLE_NAME          = aws_dynamodb_table.notification_table.name
      ERROR_TABLE_NAME    = aws_dynamodb_table.notification_error_table.name
      S3_BUCKET_NAME      = aws_s3_bucket.notification_templates.id
      SES_FROM_EMAIL      = var.ses_from_email
      NODE_ENV            = "production"
      LOG_LEVEL           = "info"
    }
  }

  tags = {
    Name = "${var.project_name}-send-notifications-lambda"
  }

  depends_on = [
    aws_iam_role_policy.lambda_policy
  ]
}

# 2. Lambda Error Handler: send-notifications-error
resource "aws_lambda_function" "send_notifications_error" {
  function_name = "${var.project_name}-send-notifications-error"
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "send-notifications-error.handler"
  runtime       = var.lambda_runtime
  
  timeout     = 15
  memory_size = 256

  filename         = data.archive_file.lambda_send_notifications_error.output_path
  source_code_hash = data.archive_file.lambda_send_notifications_error.output_base64sha256

  environment {
    variables = {
      TABLE_NAME       = aws_dynamodb_table.notification_table.name
      ERROR_TABLE_NAME = aws_dynamodb_table.notification_error_table.name
      NODE_ENV         = "production"
      LOG_LEVEL        = "warn"
    }
  }

  tags = {
    Name = "${var.project_name}-send-notifications-error-lambda"
  }

  depends_on = [
    aws_iam_role_policy.lambda_policy
  ]
}

# ===== Event Sources =====

# SQS + Lambda trigger para la Lambda principal
resource "aws_lambda_event_source_mapping" "sqs_notification_trigger" {
  event_source_arn                   = aws_sqs_queue.notification_queue.arn
  function_name                      = aws_lambda_function.send_notifications.function_name
  batch_size                         = var.sqs_batch_size
  maximum_batching_window_in_seconds = var.sqs_batch_window
  function_response_types            = ["ReportBatchItemFailures"]

  depends_on = [aws_lambda_function.send_notifications]
}

# SQS + Lambda trigger para la Lambda de error
resource "aws_lambda_event_source_mapping" "sqs_error_trigger" {
  event_source_arn = aws_sqs_queue.notification_error_queue.arn
  function_name    = aws_lambda_function.send_notifications_error.function_name
  batch_size       = 5

  depends_on = [aws_lambda_function.send_notifications_error]
}

# ===== CloudWatch Log Groups =====

resource "aws_cloudwatch_log_group" "lambda_send_notifications_logs" {
  name              = "/aws/lambda/${aws_lambda_function.send_notifications.function_name}"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${var.project_name}-send-notifications-logs"
  }
}

resource "aws_cloudwatch_log_group" "lambda_error_logs" {
  name              = "/aws/lambda/${aws_lambda_function.send_notifications_error.function_name}"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${var.project_name}-send-notifications-error-logs"
  }
}

# ===== Outputs =====

