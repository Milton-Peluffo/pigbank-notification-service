import { SQSEvent } from "aws-lambda";
import { ParsedNotificationRecord } from "../types/events.js";
/**
 * Servicio para procesar mensajes de SQS
 */
export declare class SQSService {
    /**
     * Parsea un evento SQS y extrae los records válidos
     * @param event Evento de SQS
     * @returns Array de records parseados
     */
    parseEvent(event: SQSEvent): ParsedNotificationRecord[];
    /**
     * Parsea un record individual de SQS
     */
    private parseRecord;
    /**
     * Valida que el payload tenga los campos requeridos
     */
    private validatePayload;
}
export declare const sqsService: SQSService;
//# sourceMappingURL=sqs.service.d.ts.map