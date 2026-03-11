import { SQSEvent, SQSRecord } from "aws-lambda";

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
 * Payload que recibe el servicio desde la cola SQS
 * Enviado desde el microservicio de usuarios
 */
export interface IncomingSQSPayload {
  email: string;
  template: NotificationTemplate;
  data: Record<string, any>;
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
