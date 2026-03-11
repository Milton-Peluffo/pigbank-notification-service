"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const uuid_1 = require("uuid");
const index_js_1 = require("../services/index.js");
const index_js_2 = require("../config/index.js");
const index_js_3 = require("../utils/index.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
/**
 * Lambda handler principal para procesar notificaciones
 * Recibe eventos de la cola SQS, envía emails y guarda en DynamoDB
 */
const handler = async (event) => {
    logger_js_1.default.info("🚀 Handler de notificaciones iniciado", {
        recordCount: event.Records?.length || 0,
    });
    // Validar configuración de ambiente
    try {
        (0, index_js_2.validateConfig)();
    }
    catch (error) {
        logger_js_1.default.fatal("Configuración inválida", { error });
        index_js_3.ErrorHandler.logError(error);
        throw error;
    }
    const batchItemFailures = [];
    const results = [];
    // Parsear todos los records del evento
    const parsedRecords = index_js_1.sqsService.parseEvent(event);
    // Procesar cada record
    for (const record of parsedRecords) {
        try {
            logger_js_1.default.debug(`Procesando record: ${record.messageId}`);
            const result = await processNotification(record.messageId, record.body);
            results.push({
                messageId: record.messageId,
                success: true,
                notificationId: result,
            });
            logger_js_1.default.info(`✅ Record procesado exitosamente: ${record.messageId}`);
        }
        catch (error) {
            index_js_3.ErrorHandler.logError(error, {
                messageId: record.messageId,
                email: record.body.email,
            });
            // Agregar a failures para que SQS lo reintentar
            batchItemFailures.push({
                itemId: record.messageId,
            });
            results.push({
                messageId: record.messageId,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    logger_js_1.default.info("📊 Procesamiento completado", {
        total: parsedRecords.length,
        successful: results.filter((r) => r.success).length,
        failed: batchItemFailures.length,
    });
    return {
        batchItemFailures: batchItemFailures.map((failure) => ({
            itemIdentifier: failure.itemId,
        })),
    };
};
exports.handler = handler;
/**
 * Procesa una notificación individual
 * 1. Valida datos
 * 2. Obtiene template y config
 * 3. Renderiza HTML
 * 4. Envía con SES
 * 5. Guarda en DynamoDB
 */
async function processNotification(_messageId, payload) {
    // 1. Generar ID y timestamp (internamente)
    const notificationId = (0, uuid_1.v4)();
    const createdAt = new Date().toISOString();
    logger_js_1.default.debug(`Procesando notificación ${notificationId}`, {
        email: payload.email,
        template: payload.template,
    });
    // 2. Validar email
    index_js_3.EmailValidator.validate(payload.email);
    // 3. Validar template
    const template = payload.template;
    const templateConfig = index_js_2.TEMPLATE_CONFIG[template];
    if (!templateConfig) {
        throw new Error(`Template "${template}" no está configurado. Templates válidos: ${Object.keys(index_js_2.TEMPLATE_CONFIG).join(", ")}`);
    }
    // 4. Obtener template HTML desde S3
    const htmlTemplate = await index_js_1.templateService.getTemplate(templateConfig.templateFile);
    // 5. Renderizar template con datos
    const htmlContent = index_js_3.TemplateRenderer.render(htmlTemplate, payload.data);
    // 6. Enviar email con SES
    const messageId_SES = await index_js_1.emailService.sendEmail(payload.email, templateConfig.subject, htmlContent);
    // 7. Guardar en DynamoDB tabla principal
    const notificationRecord = {
        uuid: notificationId,
        createdAt,
        email: payload.email,
        template,
        status: "SENT",
        messageId: messageId_SES,
        content: {
            subject: templateConfig.subject,
            data: payload.data,
        },
        updatedAt: new Date().toISOString(),
    };
    await index_js_1.notificationService.saveSuccessfulNotification(notificationRecord);
    logger_js_1.default.debug(`✅ Notificación completada: ${notificationId}`);
    return notificationId;
}
// Entry point para Lambda
//# sourceMappingURL=send-notifications.handler.js.map