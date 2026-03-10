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
