import { NotificationError } from "../types/index.js";
/**
 * Manejador centralizado de errores para logging y formateo
 */
export declare class ErrorHandler {
    /**
     * Loguea un error de manera consistente
     */
    static logError(error: unknown, context?: Record<string, any>): void;
    /**
     * Convierte cualquier error a NotificationError
     */
    static toNotificationError(error: unknown, context?: string): NotificationError;
    /**
     * Determina si un error es recuperable (debería reintentar)
     */
    static isRetryable(error: unknown): boolean;
    /**
     * Formatea error para guardar en DynamoDB
     */
    static formatErrorRecord(error: unknown): {
        code: string;
        message: string;
        details?: Record<string, any>;
    };
}
//# sourceMappingURL=error-handler.d.ts.map