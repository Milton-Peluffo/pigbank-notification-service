# ===== IAM Role para Lambda =====

resource "aws_iam_role" "lambda_exec_role" {
  name = "${var.project_name}-notification-lambda-role"

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

  tags = {
    Name = "${var.project_name}-lambda-role"
  }
}

# ===== La política principal =====

resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # CloudWatch Logs
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:*:*"
      },
      # SQS
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:ChangeMessageVisibility"
        ]
        Resource = [
          aws_sqs_queue.notification_queue.arn,
          aws_sqs_queue.notification_error_queue.arn
        ]
      },
      # S3 (Leer templates)
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.notification_templates.arn}/*"
      },
      # DynamoDB
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          aws_dynamodb_table.notification_table.arn,
          aws_dynamodb_table.notification_error_table.arn
        ]
      },
      # SES
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# ===== Outputs =====
output "lambda_role_arn" {
  value       = aws_iam_role.lambda_exec_role.arn
  description = "ARN del role IAM para Lambda"
}

output "lambda_role_name" {
  value       = aws_iam_role.lambda_exec_role.name
  description = "Nombre del role IAM para Lambda"
}
