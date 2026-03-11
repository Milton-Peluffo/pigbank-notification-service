"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const index_js_1 = require("../services/index.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
/**
 * Lambda handler para procesar mensajes fallidos de la DLQ
 * Guarda información de error para auditoría
 */
const handler = async (event) => {
    logger_js_1.default.warn("⚠️ Handler de errores (DLQ) iniciado", {
        recordCount: event.Records?.length || 0,
    });
    const parsedRecords = index_js_1.sqsService.parseEvent(event);
    for (const record of parsedRecords) {
        try {
            await processErrorNotification(record.body);
        }
        catch (error) {
            logger_js_1.default.error(`Error procesando registro de error: ${record.messageId}`, {
                error: error instanceof Error ? error.message : String(error),
            });
            // No lanzar error, ya que este es el handler de errores
        }
    }
    logger_js_1.default.info("📊 Procesamiento de DLQ completado", {
        total: parsedRecords.length,
    });
};
exports.handler = handler;
/**
 * Procesa un mensaje que falló después de reintentos
 * Guarda información de error en notification-error-table
 */
async function processErrorNotification(payload) {
    const uuid = require("uuid").v4();
    const createdAt = new Date().toISOString();
    logger_js_1.default.debug(`Guardando error para: ${payload.email}`, {
        template: payload.template,
    });
    const errorRecord = {
        uuid,
        createdAt,
        email: payload.email,
        template: payload.template,
        status: "FAILED",
        error: {
            code: "DLQ_MESSAGE",
            message: "Mensaje falló después de máximo número de reintentos",
            details: {
                reason: "Max retries exceeded after 3 attempts",
            },
        },
        payload,
        failureCount: 3,
        updatedAt: new Date().toISOString(),
    };
    await index_js_1.notificationService.saveFailedNotification(errorRecord);
    logger_js_1.default.warn(`Notificación fallida registrada: ${uuid}`, {
        email: payload.email,
        template: payload.template,
    });
}
// Entry point para Lambda DLQ handler
//# sourceMappingURL=send-notifications-error.handler.js.map