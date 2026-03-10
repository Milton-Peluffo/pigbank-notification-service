/**
 * Tipos de notificación disponibles en el sistema
 */
export enum NotificationType {
  WELCOME = "WELCOME",
  PASSWORD_RESET = "PASSWORD_RESET",
  CONFIRMATION = "CONFIRMATION",
}

/**
 * Estructura de datos de la notificación que viene del SQS
 */
export interface NotificationMessage {
  email: string;
  template: NotificationType | string;
  data: Record<string, string | number | boolean>;
}

/**
 * Estructura de evento de SQS
 */
export interface SQSEvent {
  Records: SQSRecord[];
}

/**
 * Estructura de un registro individual de SQS
 */
export interface SQSRecord {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes: {
    ApproximateReceiveCount: string;
    SentTimestamp: string;
    SenderId: string;
    ApproximateFirstReceiveTimestamp: string;
  };
  messageAttributes: Record<string, unknown>;
  md5OfBody: string;
  eventSource: string;
  eventSourceARN: string;
  awsRegion: string;
}

/**
 * Estructura de respuesta del Lambda
 */
export interface SQSBatchResponse {
  batchItemFailures: Array<{
    itemId: string;
  }>;
}

/**
 * Registro de notificación para almacenamiento en DynamoDB
 */
export interface NotificationLog {
  notificationId: string; // UUID
  email: string;
  template: string;
  status: "SUCCESS" | "FAILURE";
  createdAt: string; // ISO timestamp
  messageId?: string; // SQS Message ID
  errorMessage?: string;
}

/**
 * Configuración de variables para el template
 */
export interface TemplateVariables {
  [key: string]: string | number | boolean;
}
