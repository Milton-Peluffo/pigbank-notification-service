"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const index_js_1 = require("../services/index.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
/**
 * Lambda handler to process failed messages from DLQ
 * Saves error information for auditing
 */
const handler = async (event) => {
    logger_js_1.default.warn("STARTED Error handler (DLQ)", {
        recordCount: event.Records?.length || 0,
    });
    const parsedRecords = index_js_1.sqsService.parseEvent(event);
    for (const record of parsedRecords) {
        try {
            await processErrorNotification(record.body);
        }
        catch (error) {
            logger_js_1.default.error(`Error processing error record: ${record.messageId}`, {
                error: error instanceof Error ? error.message : String(error),
            });
            // Don't throw error, since this is the error handler
        }
    }
    logger_js_1.default.info("SUMMARY DLQ processing completed", {
        total: parsedRecords.length,
    });
};
exports.handler = handler;
/**
 * Processes a message that failed after retries
 * Saves error information to notification-error-table
 */
async function processErrorNotification(payload) {
    const uuid = require("uuid").v4();
    const createdAt = new Date().toISOString();
    logger_js_1.default.debug(`Saving error for: ${payload.email}`, {
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
            message: "Message failed after maximum number of retries",
            details: {
                reason: "Max retries exceeded after 3 attempts",
            },
        },
        payload,
        failureCount: 3,
        updatedAt: new Date().toISOString(),
    };
    await index_js_1.notificationService.saveFailedNotification(errorRecord);
    logger_js_1.default.warn(`Failed notification registered: ${uuid}`, {
        email: payload.email,
        template: payload.template,
    });
}
// Entry point para Lambda DLQ handler
//# sourceMappingURL=send-notifications-error.handler.js.map