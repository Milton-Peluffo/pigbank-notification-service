import { SQSEvent } from "aws-lambda";
import { sqsService, notificationService } from "../services/index.js";

import { NotificationErrorRecord } from "../types/index.js";
import logger from "../utils/logger.js";

/**
 * Lambda handler to process failed messages from DLQ
 * Saves error information for auditing
 */
export const handler = async (event: SQSEvent): Promise<void> => {
  logger.warn("STARTED Error handler (DLQ)", {
    recordCount: event.Records?.length || 0,
  });

  const parsedRecords = sqsService.parseEvent(event);

  for (const record of parsedRecords) {
    try {
      await processErrorNotification(record.body);
    } catch (error) {
      logger.error(`Error processing error record: ${record.messageId}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw error, since this is the error handler
    }
  }

  logger.info("SUMMARY DLQ processing completed", {
    total: parsedRecords.length,
  });
};

/**
 * Processes a message that failed after retries
 * Saves error information to notification-error-table
 */
async function processErrorNotification(payload: any): Promise<void> {
  const uuid = require("uuid").v4();
  const createdAt = new Date().toISOString();

  logger.debug(`Saving error for: ${payload.email}`, {
    template: payload.template,
  });

  const errorRecord: NotificationErrorRecord = {
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

  await notificationService.saveFailedNotification(errorRecord);

  logger.warn(`Failed notification registered: ${uuid}`, {
    email: payload.email,
    template: payload.template,
  });
}

// Entry point para Lambda DLQ handler
