import { SQSEvent, SQSBatchResponse } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import {
  sqsService,
  emailService,
  templateService,
  notificationService,
} from "../services/index.js";
import { TEMPLATE_CONFIG, validateConfig } from "../config/index.js";
import { EmailValidator, TemplateRenderer, ErrorHandler } from "../utils/index.js";
import { NotificationTemplate, NotificationRecord } from "../types/index.js";
import logger from "../utils/logger.js";

/**
 * Main Lambda handler to process notifications
 * Receives SQS queue events, sends emails and saves to DynamoDB
 */
export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  logger.info("STARTED Notification handler", {
    recordCount: event.Records?.length || 0,
  });

  // Validate environment configuration
  try {
    validateConfig();
  } catch (error) {
    logger.fatal("Invalid configuration", { error });
    ErrorHandler.logError(error);
    throw error;
  }

  const batchItemFailures: Array<{ itemId: string }> = [];
  const results = [];

  // Parse all event records
  const parsedRecords = sqsService.parseEvent(event);

  // Process each record
  for (const record of parsedRecords) {
    try {
      logger.debug(`Processing record: ${record.messageId}`);

      const result = await processNotification(record.messageId, record.body);

      results.push({
        messageId: record.messageId,
        success: true,
        notificationId: result,
      });

      logger.info(`SUCCESS Record processed: ${record.messageId}`);
    } catch (error) {
      ErrorHandler.logError(error, {
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

  logger.info("SUMMARY Processing completed", {
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
 * Processes a single notification
 * 1. Validates data
 * 2. Gets template and config
 * 3. Renders HTML
 * 4. Sends with SES
 * 5. Saves to DynamoDB
 */
async function processNotification(_messageId: string, payload: any): Promise<string> {
  // 1. Generate ID and timestamp (internal)
  const notificationId = uuidv4();
  const createdAt = new Date().toISOString();

  logger.debug(`Processing notification ${notificationId}`, {
    email: payload.email,
    template: payload.template,
  });

  // 2. Validate email
  EmailValidator.validate(payload.email);

  // 3. Validate template
  const template = payload.template as NotificationTemplate;
  const templateConfig = TEMPLATE_CONFIG[template];

  if (!templateConfig) {
    throw new Error(
      `Template "${template}" is not configured. Valid templates: ${Object.keys(TEMPLATE_CONFIG).join(", ")}`
    );
  }

  // 4. Get template HTML from S3
  const htmlTemplate = await templateService.getTemplate(templateConfig.templateFile);

  // 5. Render template with data
  const htmlContent = TemplateRenderer.render(htmlTemplate, payload.data);

  // 6. Send email with SES
  const messageId_SES = await emailService.sendEmail(
    payload.email,
    templateConfig.subject,
    htmlContent
  );

  // 7. Save to DynamoDB main table
  const notificationRecord: NotificationRecord = {
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

  logger.debug(`SUCCESS Notification completed: ${notificationId}`);
  return notificationId;
}

// Entry point for Lambda
