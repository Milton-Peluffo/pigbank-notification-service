# Lambda Module - Gestiona la función Lambda para procesar notificaciones

# Compresión del código fuente
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../dist"
  output_path = "${path.module}/lambda_function_${var.function_name}.zip"
}

# Role de Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# Política inline para permisos específicos
resource "aws_iam_role_policy" "lambda_policy" {
  count = length(var.policy_statements) > 0 ? 1 : 0
  name  = "${var.function_name}-policy"
  role  = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = var.policy_statements
  })
}

# Policy attachment para logs básicos
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Policy attachment para SQS
resource "aws_iam_role_policy_attachment" "lambda_sqs_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"
}

# Función Lambda
resource "aws_lambda_function" "notification_handler" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = var.function_name
  role             = aws_iam_role.lambda_role.arn
  handler          = var.handler
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = var.runtime
  timeout          = var.timeout
  memory_size      = var.memory_size

  # Variables de ambiente
  environment {
    variables = var.environment_variables
  }

  # Logs en CloudWatch
  logging_config {
    log_format = "JSON"
    log_group  = aws_cloudwatch_log_group.lambda_logs.name
  }

  tags = var.tags

  depends_on = [
    aws_iam_role_policy.lambda_policy,
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_iam_role_policy_attachment.lambda_sqs_execution
  ]
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = 14

  tags = var.tags
}

# Event Source Mapping - SQS to Lambda
resource "aws_lambda_event_source_mapping" "sqs_mapping" {
  event_source_arn                   = var.sqs_queue_arn
  function_name                      = aws_lambda_function.notification_handler.function_name
  batch_size                         = var.batch_size
  batch_window                       = var.batch_window
  maximum_concurrency                = var.maximum_concurrency
  function_response_types            = ["ReportBatchItemFailures"]

  # Política de reintentos
  bisect_batch_on_function_error     = true
  maximum_event_age_in_seconds       = 3600
  maximum_retry_attempts             = 2
}

# Permiso para que SQS invoque Lambda
resource "aws_lambda_permission" "allow_sqs" {
  statement_id  = "AllowSQSInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.notification_handler.function_name
  principal     = "sqs.amazonaws.com"
  source_arn    = var.sqs_queue_arn
}
