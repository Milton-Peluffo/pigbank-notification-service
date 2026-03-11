import { v4 as uuidv4 } from "uuid";
import { sqsService, emailService, templateService, notificationService, } from "../services/index.js";
import { TEMPLATE_CONFIG, validateConfig } from "../config/index.js";
import { EmailValidator, TemplateRenderer, ErrorHandler } from "../utils/index.js";
import logger from "../utils/logger.js";
/**
 * Lambda handler principal para procesar notificaciones
 * Recibe eventos de la cola SQS, envía emails y guarda en DynamoDB
 */
export const handler = async (event) => {
    logger.info("🚀 Handler de notificaciones iniciado", {
        recordCount: event.Records?.length || 0,
    });
    // Validar configuración de ambiente
    try {
        validateConfig();
    }
    catch (error) {
        logger.fatal("Configuración inválida", { error });
        ErrorHandler.logError(error);
        throw error;
    }
    const batchItemFailures = [];
    const results = [];
    // Parsear todos los records del evento
    const parsedRecords = sqsService.parseEvent(event);
    // Procesar cada record
    for (const record of parsedRecords) {
        try {
            logger.debug(`Procesando record: ${record.messageId}`);
            const result = await processNotification(record.messageId, record.body);
            results.push({
                messageId: record.messageId,
                success: true,
                notificationId: result,
            });
            logger.info(`✅ Record procesado exitosamente: ${record.messageId}`);
        }
        catch (error) {
            ErrorHandler.logError(error, {
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
    logger.info("📊 Procesamiento completado", {
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
    const notificationId = uuidv4();
    const createdAt = new Date().toISOString();
    logger.debug(`Procesando notificación ${notificationId}`, {
        email: payload.email,
        template: payload.template,
    });
    // 2. Validar email
    EmailValidator.validate(payload.email);
    // 3. Validar template
    const template = payload.template;
    const templateConfig = TEMPLATE_CONFIG[template];
    if (!templateConfig) {
        throw new Error(`Template "${template}" no está configurado. Templates válidos: ${Object.keys(TEMPLATE_CONFIG).join(", ")}`);
    }
    // 4. Obtener template HTML desde S3
    const htmlTemplate = await templateService.getTemplate(templateConfig.templateFile);
    // 5. Renderizar template con datos
    const htmlContent = TemplateRenderer.render(htmlTemplate, payload.data);
    // 6. Enviar email con SES
    const messageId_SES = await emailService.sendEmail(payload.email, templateConfig.subject, htmlContent);
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
    await notificationService.saveSuccessfulNotification(notificationRecord);
    logger.debug(`✅ Notificación completada: ${notificationId}`);
    return notificationId;
}
// Entry point para Lambda
//# sourceMappingURL=send-notifications.handler.js.map