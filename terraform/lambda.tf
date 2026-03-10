module "sqs" {
  source = "./modules/sqs"

  project_name = var.project_name
  environment  = var.environment

  # Configuración de la cola principal
  queue_name = "${var.project_name}-notification-email-sqs"

  # Configuración de DLQ
  dlq_name = "${var.project_name}-notification-email-dlq"

  # Configuración de reintentos
  message_retention_seconds          = 1209600  # 14 días
  visibility_timeout_seconds         = 300     # 5 minutos
  max_receive_count                  = 3       # Reintentos antes de DLQ

  tags = {
    Name = "${var.project_name}-notification-queues"
  }
}

module "dynamodb" {
  source = "./modules/dynamodb"

  project_name = var.project_name
  environment  = var.environment

  # Tabla de notificaciones exitosas
  notification_table_name = "${var.project_name}-notification-table"
  
  # Tabla de errores
  error_table_name = "${var.project_name}-notification-error-table"

  # Configuración de capacidad (usar on-demand para desarrollo)
  billing_mode = var.environment == "prod" ? "PROVISIONED" : "PAY_PER_REQUEST"

  # Solo para modo provisioned
  read_capacity_units  = 5
  write_capacity_units = 5

  # TTL configuración (30 días)
  ttl_days = 30

  tags = {
    Name = "${var.project_name}-notification-tables"
  }
}

module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment

  # Nombre del bucket de plantillas
  templates_bucket_name = "${var.project_name}-templates-email-notification-${data.aws_caller_identity.current.account_id}"

  # Habilitar versionado
  versioning_enabled = true

  # Habilitar encriptación
  sse_algorithm = "AES256"

  tags = {
    Name = "${var.project_name}-email-templates"
  }
}

module "lambda" {
  source = "./modules/lambda"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  # Configuración del handler principal
  function_name = "${var.project_name}-notification-handler"
  handler       = "handlers/sendNotifications.handler"
  
  # Runtime
  runtime = "nodejs18.x"

  # Configuración de recursos
  timeout     = 60
  memory_size = 512

  # Variables de ambiente
  environment_variables = {
    AWS_REGION                  = var.aws_region
    NOTIFICATION_QUEUE_URL      = module.sqs.notification_queue_url
    TEMPLATES_BUCKET_NAME       = module.s3.templates_bucket_name
    NOTIFICATION_TABLE_NAME     = module.dynamodb.notification_table_name
    NOTIFICATION_ERROR_TABLE_NAME = module.dynamodb.error_table_name
    SMTP_HOST                   = "email-smtp.${var.aws_region}.amazonaws.com"
    SMTP_PORT                   = "587"
    SMTP_SECURE                 = "true"
    SMTP_FROM_EMAIL             = "noreply@pigbank.com"
    NODE_ENV                    = var.environment
  }

  # Configuración de SQS como trigger
  sqs_queue_arn             = module.sqs.notification_queue_arn
  batch_size                = 10
  batch_window              = 0
  maximum_concurrency       = 10

  # Política de Lambda execution (permisos)
  policy_statements = [
    {
      Effect = "Allow"
      Action = [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ]
      Resource = [
        module.sqs.notification_queue_arn,
        module.sqs.error_queue_arn
      ]
    },
    {
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:ListBucket"
      ]
      Resource = [
        module.s3.templates_bucket_arn,
        "${module.s3.templates_bucket_arn}/*"
      ]
    },
    {
      Effect = "Allow"
      Action = [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ]
      Resource = [
        module.dynamodb.notification_table_arn,
        module.dynamodb.error_table_arn
      ]
    },
    {
      Effect = "Allow"
      Action = [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ]
      Resource = "*"
    },
    {
      Effect = "Allow"
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
      Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"
    }
  ]

  tags = {
    Name = "${var.project_name}-notification-handler"
  }

  depends_on = [
    module.sqs,
    module.s3,
    module.dynamodb
  ]
}

# Lambda para procesar DLQ
module "lambda_error_handler" {
  source = "./modules/lambda"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  function_name = "${var.project_name}-notification-error-handler"
  handler       = "handlers/sendNotificationsError.handler"
  runtime       = "nodejs18.x"
  timeout       = 60
  memory_size   = 256

  environment_variables = {
    AWS_REGION                  = var.aws_region
    NOTIFICATION_ERROR_TABLE_NAME = module.dynamodb.error_table_name
    NODE_ENV                    = var.environment
  }

  sqs_queue_arn       = module.sqs.error_queue_arn
  batch_size          = 10
  batch_window        = 0
  maximum_concurrency = 5

  policy_statements = [
    {
      Effect = "Allow"
      Action = [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ]
      Resource = module.sqs.error_queue_arn
    },
    {
      Effect = "Allow"
      Action = [
        "dynamodb:PutItem"
      ]
      Resource = module.dynamodb.error_table_arn
    },
    {
      Effect = "Allow"
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
      Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"
    }
  ]

  tags = {
    Name = "${var.project_name}-notification-error-handler"
  }

  depends_on = [
    module.sqs,
    module.dynamodb
  ]
}

# Data source para obtener información de la cuenta
data "aws_caller_identity" "current" {}
