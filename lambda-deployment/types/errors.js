"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQSProcessingError = exports.ConfigError = exports.DynamoError = exports.SESError = exports.TemplateError = exports.ValidationError = exports.NotificationError = void 0;
/**
 * Error base para el servicio de notificaciones
 */
class NotificationError extends Error {
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "NotificationError";
    }
}
exports.NotificationError = NotificationError;
/**
 * Error de validación de entrada
 */
class ValidationError extends NotificationError {
    constructor(message, details) {
        super("VALIDATION_ERROR", message, details);
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
/**
 * Error al obtener o procesar plantilla
 */
class TemplateError extends NotificationError {
    constructor(message, details) {
        super("TEMPLATE_ERROR", message, details);
        this.name = "TemplateError";
    }
}
exports.TemplateError = TemplateError;
/**
 * Error al enviar email via SES
 */
class SESError extends NotificationError {
    constructor(message, details) {
        super("SES_ERROR", message, details);
        this.name = "SESError";
    }
}
exports.SESError = SESError;
/**
 * Error al operar con DynamoDB
 */
class DynamoError extends NotificationError {
    constructor(message, details) {
        super("DYNAMO_ERROR", message, details);
        this.name = "DynamoError";
    }
}
exports.DynamoError = DynamoError;
/**
 * Error de configuración o ambiente
 */
class ConfigError extends NotificationError {
    constructor(message, details) {
        super("CONFIG_ERROR", message, details);
        this.name = "ConfigError";
    }
}
exports.ConfigError = ConfigError;
/**
 * Error al procesar un registro SQS
 */
class SQSProcessingError extends NotificationError {
    constructor(messageId, message, details) {
        super("SQS_PROCESSING_ERROR", message, details);
        this.messageId = messageId;
        this.name = "SQSProcessingError";
    }
}
exports.SQSProcessingError = SQSProcessingError;
//# sourceMappingURL=errors.js.map