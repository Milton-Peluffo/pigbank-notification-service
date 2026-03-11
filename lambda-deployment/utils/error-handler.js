"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const index_js_1 = require("../types/index.js");
const logger_js_1 = __importDefault(require("./logger.js"));
/**
 * Manejador centralizado de errores para logging y formateo
 */
class ErrorHandler {
    /**
     * Loguea un error de manera consistente
     */
    static logError(error, context) {
        if (error instanceof index_js_1.NotificationError) {
            logger_js_1.default.error({
                code: error.code,
                message: error.message,
                details: error.details,
                ...context,
            }, `${error.name}: ${error.message}`);
        }
        else if (error instanceof Error) {
            logger_js_1.default.error({
                message: error.message,
                stack: error.stack,
                ...context,
            }, `Error no manejado: ${error.message}`);
        }
        else {
            logger_js_1.default.error({
                error: String(error),
                ...context,
            }, "Error desconocido");
        }
    }
    /**
     * Convierte cualquier error a NotificationError
     */
    static toNotificationError(error, context) {
        if (error instanceof index_js_1.NotificationError) {
            return error;
        }
        if (error instanceof Error) {
            return new index_js_1.NotificationError("UNKNOWN_ERROR", `${context || ""} ${error.message}`, {
                originalError: error.message,
                stack: error.stack,
            });
        }
        return new index_js_1.NotificationError("UNKNOWN_ERROR", `${context || ""} ${String(error)}`);
    }
    /**
     * Determina si un error es recuperable (debería reintentar)
     */
    static isRetryable(error) {
        if (error instanceof index_js_1.TemplateError) {
            // No reintentar errores de template missing
            return false;
        }
        if (error instanceof index_js_1.NotificationError) {
            // SES errors (timeout, throttling) sí son recuperables
            return error.code === "SES_ERROR" || error.code === "DYNAMO_ERROR";
        }
        // Por defecto, errores no esperados son recuperables
        return true;
    }
    /**
     * Formatea error para guardar en DynamoDB
     */
    static formatErrorRecord(error) {
        if (error instanceof index_js_1.NotificationError) {
            return {
                code: error.code,
                message: error.message,
                details: error.details,
            };
        }
        if (error instanceof Error) {
            return {
                code: "UNKNOWN_ERROR",
                message: error.message,
                details: {
                    stack: error.stack,
                },
            };
        }
        return {
            code: "UNKNOWN_ERROR",
            message: String(error),
        };
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=error-handler.js.map