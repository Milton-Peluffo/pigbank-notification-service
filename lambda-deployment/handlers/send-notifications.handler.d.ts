import { SQSEvent, SQSBatchResponse } from "aws-lambda";
/**
 * Lambda handler principal para procesar notificaciones
 * Recibe eventos de la cola SQS, envía emails y guarda en DynamoDB
 */
export declare const handler: (event: SQSEvent) => Promise<SQSBatchResponse>;
//# sourceMappingURL=send-notifications.handler.d.ts.map