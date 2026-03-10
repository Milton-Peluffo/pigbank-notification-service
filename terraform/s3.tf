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
