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
     * Determines if an error is recoverable (should retry)
     */
    static isRetryable(error: unknown): boolean;
    /**
     * Formats error to save in DynamoDB
     */
    static formatErrorRecord(error: unknown): {
        code: string;
        message: string;
        details?: Record<string, any>;
    };
}
//# sourceMappingURL=error-handler.d.ts.map