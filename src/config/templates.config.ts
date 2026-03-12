import { TemplateConfigMap } from "../types/templates.js";

/**
 * Central configuration of all notification templates
 * Maps each template type to its configuration (subject, file, variables)
 */
export const TEMPLATE_CONFIG: TemplateConfigMap = {
  WELCOME: {
    subject: "Welcome to PigBank!",
    templateFile: "welcome.html",
    variables: ["name", "lastName"],
    description: "Welcome email upon registration",
  },
  "USER.LOGIN": {
    subject: "New login to PigBank",
    templateFile: "user-login.html",
    variables: ["name", "lastName", "date"],
    description: "Login notification",
  },
  "USER.UPDATE": {
    subject: "Your profile has been updated",
    templateFile: "user-update.html",
    variables: ["name", "lastName", "date"],
    description: "Profile update notification",
  },
  "CARD.CREATE": {
    subject: "Your new card has been created",
    templateFile: "card-create.html",
    variables: ["name", "date", "type", "amount"],
    description: "Card creation notification",
  },
  "CARD.ACTIVATE": {
    subject: "Your card is activated",
    templateFile: "card-activate.html",
    variables: ["name", "date", "type", "amount"],
    description: "Card activation notification",
  },
  "TRANSACTION.PURCHASE": {
    subject: "A purchase was made with your card",
    templateFile: "transaction-purchase.html",
    variables: ["name", "date", "merchant", "cardId", "amount"],
    description: "Purchase notification",
  },
  "TRANSACTION.SAVE": {
    subject: "Money added to your account",
    templateFile: "transaction-save.html",
    variables: ["name", "date", "amount"],
    description: "Deposit notification",
  },
  "TRANSACTION.PAID": {
    subject: "Credit card payment processed",
    templateFile: "transaction-paid.html",
    variables: ["name", "date", "merchant", "amount"],
    description: "Payment notification",
  },
  "REPORT.ACTIVITY": {
    subject: "Your account activity report",
    templateFile: "report-activity.html",
    variables: ["name", "date", "url"],
    description: "Activity report",
  },
};

/**
 * Environment variables with default values
 */
export const ENV_CONFIG = {
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  TABLE_NAME: process.env.TABLE_NAME || "pig-bank-notification-table",
  ERROR_TABLE_NAME: process.env.ERROR_TABLE_NAME || "pig-bank-notification-error-table",
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "templates-email-notification",
  SES_FROM_EMAIL: process.env.SES_FROM_EMAIL || "noreply@pigbank.com",
  NODE_ENV: process.env.NODE_ENV || "production",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};

/**
 * Timeout and retry constants
 */
export const CONSTANTS = {
  SES_TIMEOUT_MS: 10000, // 10 seconds for SES
  S3_TIMEOUT_MS: 5000, // 5 seconds for S3
  DYNAMO_TIMEOUT_MS: 5000, // 5 seconds for DynamoDB
  TEMPLATE_CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  MAX_RETRIES: 3,
  BATCH_SIZE: 10,
};
