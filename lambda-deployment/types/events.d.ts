/**
 * Templates de notificación soportados por el servicio
 */
export type NotificationTemplate = "WELCOME" | "USER.LOGIN" | "USER.UPDATE" | "CARD.CREATE" | "CARD.ACTIVATE" | "TRANSACTION.PURCHASE" | "TRANSACTION.SAVE" | "TRANSACTION.PAID" | "REPORT.ACTIVITY";
/**
 * Estructura de datos para cada tipo de notificación según el enunciado
 * Pero adaptada al formato del compañero (con email)
 */
export interface NotificationData {
    name?: string;
    lastName?: string;
    timestamp?: string;
    deviceInfo?: string;
    updateType?: string;
    cardType?: string;
    lastDigits?: string;
    amount?: number;
    merchant?: string;
    cardId?: string;
    accountType?: string;
    dueDate?: string;
    period?: string;
    transactionCount?: number;
    url?: string;
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
    id: string;
    createdAt: string;
    subject: string;
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
//# sourceMappingURL=events.d.ts.map