import { SQSEvent } from "aws-lambda";
/**
 * Lambda handler para procesar mensajes fallidos de la DLQ
 * Guarda información de error para auditoría
 */
export declare const handler: (event: SQSEvent) => Promise<void>;
//# sourceMappingURL=send-notifications-error.handler.d.ts.map