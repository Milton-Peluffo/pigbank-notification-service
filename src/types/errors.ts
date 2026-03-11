/**
 * Error base para el servicio de notificaciones
 */
export class NotificationError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "NotificationError";
  }
}

/**
 * Error de validación de entrada
 */
export class ValidationError extends NotificationError {
  constructor(message: string, details?: Record<string, any>) {
    super("VALIDATION_ERROR", message, details);
    this.name = "ValidationError";
  }
}

/**
 * Error al obtener o procesar plantilla
 */
export class TemplateError extends NotificationError {
  constructor(message: string, details?: Record<string, any>) {
    super("TEMPLATE_ERROR", message, details);
    this.name = "TemplateError";
  }
}

/**
 * Error al enviar email via SES
 */
export class SESError extends NotificationError {
  constructor(message: string, details?: Record<string, any>) {
    super("SES_ERROR", message, details);
    this.name = "SESError";
  }
}

/**
 * Error al operar con DynamoDB
 */
export class DynamoError extends NotificationError {
  constructor(message: string, details?: Record<string, any>) {
    super("DYNAMO_ERROR", message, details);
    this.name = "DynamoError";
  }
}

/**
 * Error de configuración o ambiente
 */
export class ConfigError extends NotificationError {
  constructor(message: string, details?: Record<string, any>) {
    super("CONFIG_ERROR", message, details);
    this.name = "ConfigError";
  }
}

/**
 * Error al procesar un registro SQS
 */
export class SQSProcessingError extends NotificationError {
  constructor(
    public messageId: string,
    message: string,
    details?: Record<string, any>
  ) {
    super("SQS_PROCESSING_ERROR", message, details);
    this.name = "SQSProcessingError";
  }
}
