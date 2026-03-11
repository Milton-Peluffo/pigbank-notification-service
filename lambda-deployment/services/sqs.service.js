"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqsService = exports.SQSService = void 0;
const index_js_1 = require("../types/index.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
/**
 * Servicio para procesar mensajes de SQS
 */
class SQSService {
    /**
     * Parsea un evento SQS y extrae los records válidos
     * @param event Evento de SQS
     * @returns Array de records parseados
     */
    parseEvent(event) {
        if (!event.Records || !Array.isArray(event.Records)) {
            logger_js_1.default.warn("SQS event sin Records");
            return [];
        }
        const parsed = [];
        for (const record of event.Records) {
            try {
                const payload = this.parseRecord(record);
                parsed.push({
                    messageId: record.messageId,
                    receiptHandle: record.receiptHandle,
                    body: payload,
                    attributes: record.attributes,
                });
            }
            catch (error) {
                logger_js_1.default.error(`Error parseando record SQS ${record.messageId}`, {
                    error: error instanceof Error ? error.message : String(error),
                });
                // Continuar con otros records
            }
        }
        logger_js_1.default.info(`SQS Event parseado: ${parsed.length}/${event.Records.length} records válidos`);
        return parsed;
    }
    /**
     * Parsea un record individual de SQS
     */
    parseRecord(record) {
        if (!record.body) {
            throw new index_js_1.ValidationError("SQS Record body está vacío", {
                messageId: record.messageId,
            });
        }
        let payload;
        try {
            payload = JSON.parse(record.body);
        }
        catch (error) {
            throw new index_js_1.ValidationError("SQS body no es JSON válido", {
                messageId: record.messageId,
                body: record.body.substring(0, 100),
            });
        }
        this.validatePayload(payload, record.messageId);
        return payload;
    }
    /**
     * Valida que el payload tenga los campos requeridos
     */
    validatePayload(payload, messageId) {
        if (!payload.email) {
            throw new index_js_1.ValidationError("Campo 'email' es requerido", {
                messageId,
                payload: JSON.stringify(payload).substring(0, 100),
            });
        }
        if (!payload.template) {
            throw new index_js_1.ValidationError("Campo 'template' es requerido", {
                messageId,
                email: payload.email,
            });
        }
        if (!payload.data || typeof payload.data !== "object") {
            throw new index_js_1.ValidationError("Campo 'data' es requerido y debe ser un objeto", {
                messageId,
                email: payload.email,
                template: payload.template,
            });
        }
    }
}
exports.SQSService = SQSService;
// Singleton
exports.sqsService = new SQSService();
//# sourceMappingURL=sqs.service.js.map