/**
 * Error base para el servicio de notificaciones
 */
export declare class NotificationError extends Error {
    code: string;
    details?: Record<string, any> | undefined;
    constructor(code: string, message: string, details?: Record<string, any> | undefined);
}
/**
 * Error de validación de entrada
 */
export declare class ValidationError extends NotificationError {
    constructor(message: string, details?: Record<string, any>);
}
/**
 * Error al obtener o procesar plantilla
 */
export declare class TemplateError extends NotificationError {
    constructor(message: string, details?: Record<string, any>);
}
/**
 * Error al enviar email via SES
 */
export declare class SESError extends NotificationError {
    constructor(message: string, details?: Record<string, any>);
}
/**
 * Error al operar con DynamoDB
 */
export declare class DynamoError extends NotificationError {
    constructor(message: string, details?: Record<string, any>);
}
/**
 * Error de configuración o ambiente
 */
export declare class ConfigError extends NotificationError {
    constructor(message: string, details?: Record<string, any>);
}
/**
 * Error al procesar un registro SQS
 */
export declare class SQSProcessingError extends NotificationError {
    messageId: string;
    constructor(messageId: string, message: string, details?: Record<string, any>);
}
//# sourceMappingURL=errors.d.ts.map