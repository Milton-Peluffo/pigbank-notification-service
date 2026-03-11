/**
 * Templates de notificación soportados por el servicio
 */
export type NotificationTemplate =
  | "WELCOME"
  | "USER.LOGIN"
  | "USER.UPDATE"
  | "CARD.CREATE"
  | "CARD.ACTIVATE"
  | "TRANSACTION.PURCHASE"
  | "TRANSACTION.SAVE"
  | "TRANSACTION.PAID"
  | "REPORT.ACTIVITY";

/**
 * Estructura de datos para cada tipo de notificación según el enunciado
 * Pero adaptada al formato del compañero (con email)
 */
export interface NotificationData {
  // WELCOME
  name?: string;
  lastName?: string;
  
  // USER.LOGIN
  timestamp?: string;
  deviceInfo?: string;
  
  // USER.UPDATE
  updateType?: string;
  
  // CARD.CREATE y CARD.ACTIVATE
  cardType?: string;
  lastDigits?: string;
  
  // TRANSACTION.PURCHASE
  amount?: number;
  merchant?: string;
  cardId?: string;
  
  // TRANSACTION.SAVE
  accountType?: string;
  
  // TRANSACTION.PAID
  dueDate?: string;
  
  // REPORT.ACTIVITY
  period?: string;
  transactionCount?: number;
  url?: string;
  
  // Campos genéricos para fecha
  date?: string;
}

/**
 * Payload que recibe el servicio desde la cola SQS
 * Formato del compañero A: email + template + data
 */
export interface IncomingSQSPayload {
  email: string;
  template: NotificationTemplate;
  data: NotificationData;
}

/**
 * Payload enriquecido internamente con datos generados por el servicio
 */
export interface NotificationPayload extends IncomingSQSPayload {
  id: string; // UUID generado internamente
  createdAt: string; // ISO timestamp generado internamente
  subject: string; // Obtenido de la config de templates
}

/**
 * Estructura de un registro de SQS parseado
 */
export interface ParsedNotificationRecord {
  messageId: string;
  receiptHandle: string;
  body: IncomingSQSPayload;
  attributes: Record<string, any>;
}

/**
 * Resultado del procesamiento de un registro
 */
export interface ProcessingResult {
  messageId: string;
  success: boolean;
  error?: string;
  notificationId?: string;
}

/**
 * Respuesta de AWS Lambda para SQS (batch item failures)
 */
export interface LambdaResponse {
  batchItemFailures: Array<{
    itemId: string;
  }>;
}
