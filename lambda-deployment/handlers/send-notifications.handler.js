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
 * Main Lambda handler to process notifications
 * Receives SQS queue events, sends emails and saves to DynamoDB
 */
const handler = async (event) => {
    logger_js_1.default.info("STARTED Notification handler", {
        recordCount: event.Records?.length || 0,
    });
    // Validate environment configuration
    try {
        (0, index_js_2.validateConfig)();
    }
    catch (error) {
        logger_js_1.default.fatal("Invalid configuration", { error });
        index_js_3.ErrorHandler.logError(error);
        throw error;
    }
    const batchItemFailures = [];
    const results = [];
    // Parse all event records
    const parsedRecords = index_js_1.sqsService.parseEvent(event);
    // Process each record
    for (const record of parsedRecords) {
        try {
            logger_js_1.default.debug(`Processing record: ${record.messageId}`);
            const result = await processNotification(record.messageId, record.body);
            results.push({
                messageId: record.messageId,
                success: true,
                notificationId: result,
            });
            logger_js_1.default.info(`SUCCESS Record processed: ${record.messageId}`);
        }
        catch (error) {
            index_js_3.ErrorHandler.logError(error, {
                messageId: record.messageId,
                email: record.body.email,
            });
            // Add to failures for SQS retry
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
    logger_js_1.default.info("SUMMARY Processing completed", {
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
 * Processes a single notification
 * 1. Validates data
 * 2. Gets template and config
 * 3. Renders HTML
 * 4. Sends with SES
 * 5. Saves to DynamoDB
 */
async function processNotification(_messageId, payload) {
    // 1. Generate ID and timestamp (internal)
    const notificationId = (0, uuid_1.v4)();
    const createdAt = new Date().toISOString();
    logger_js_1.default.debug(`Processing notification ${notificationId}`, {
        email: payload.email,
        template: payload.template,
    });
    // 2. Validate email
    index_js_3.EmailValidator.validate(payload.email);
    // 3. Validate template
    const template = payload.template;
    const templateConfig = index_js_2.TEMPLATE_CONFIG[template];
    if (!templateConfig) {
        throw new Error(`Template "${template}" is not configured. Valid templates: ${Object.keys(index_js_2.TEMPLATE_CONFIG).join(", ")}`);
    }
    // 4. Get template HTML from S3
    const htmlTemplate = await index_js_1.templateService.getTemplate(templateConfig.templateFile);
    // 5. Render template with data
    const htmlContent = index_js_3.TemplateRenderer.render(htmlTemplate, payload.data);
    // 6. Send email with SES
    const messageId_SES = await index_js_1.emailService.sendEmail(payload.email, templateConfig.subject, htmlContent);
    // 7. Save to DynamoDB main table
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
    logger_js_1.default.debug(`SUCCESS Notification completed: ${notificationId}`);
    return notificationId;
}
// Entry point for Lambda
//# sourceMappingURL=send-notifications.handler.js.map