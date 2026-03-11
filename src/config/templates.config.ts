import { TemplateConfigMap } from "../types/templates.js";

/**
 * Configuración central de todas las plantillas de notificación
 * Mapea cada tipo de template a su configuración (asunto, archivo, variables)
 */
export const TEMPLATE_CONFIG: TemplateConfigMap = {
  WELCOME: {
    subject: "¡Bienvenido a PigBank!",
    templateFile: "welcome.html",
    variables: ["name", "lastName"],
    description: "Email de bienvenida al registrarse",
  },
  "USER.LOGIN": {
    subject: "Nuevo inicio de sesión en PigBank",
    templateFile: "user-login.html",
    variables: ["name", "date"],
    description: "Notificación de login",
  },
  "USER.UPDATE": {
    subject: "Tu perfil ha sido actualizado",
    templateFile: "user-update.html",
    variables: ["name", "date", "updateType"],
    description: "Notificación de cambio de perfil",
  },
  "CARD.CREATE": {
    subject: "Tu nueva tarjeta ha sido creada",
    templateFile: "card-create.html",
    variables: ["name", "date", "type", "amount"],
    description: "Notificación de creación de tarjeta",
  },
  "CARD.ACTIVATE": {
    subject: "Tu tarjeta está activada",
    templateFile: "card-activate.html",
    variables: ["name", "date", "type", "amount"],
    description: "Notificación de activación de tarjeta",
  },
  "TRANSACTION.PURCHASE": {
    subject: "Se realizó una compra con tu tarjeta",
    templateFile: "transaction-purchase.html",
    variables: ["name", "date", "merchant", "cardId", "amount"],
    description: "Notificación de compra",
  },
  "TRANSACTION.SAVE": {
    subject: "Dinero añadido a tu cuenta",
    templateFile: "transaction-save.html",
    variables: ["name", "date", "amount"],
    description: "Notificación de depósito",
  },
  "TRANSACTION.PAID": {
    subject: "Pago de tarjeta de crédito procesado",
    templateFile: "transaction-paid.html",
    variables: ["name", "date", "merchant", "amount"],
    description: "Notificación de pago",
  },
  "REPORT.ACTIVITY": {
    subject: "Reporte de actividad de tu cuenta",
    templateFile: "report-activity.html",
    variables: ["name", "date", "url"],
    description: "Reporte de actividad",
  },
};

/**
 * Variables de entorno con valores por defecto
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
 * Constantes de timeout y reintentos
 */
export const CONSTANTS = {
  SES_TIMEOUT_MS: 10000, // 10 segundos para SES
  S3_TIMEOUT_MS: 5000, // 5 segundos para S3
  DYNAMO_TIMEOUT_MS: 5000, // 5 segundos para DynamoDB
  TEMPLATE_CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutos
  MAX_RETRIES: 3,
  BATCH_SIZE: 10,
};
