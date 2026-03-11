import { NotificationRecord, NotificationErrorRecord } from "../types/notifications.js";
/**
 * Servicio para almacenar notificaciones en DynamoDB
 */
export declare class NotificationService {
    private docClient;
    constructor();
    /**
     * Guarda una notificación exitosa en la tabla principal
     */
    saveSuccessfulNotification(record: NotificationRecord): Promise<void>;
    /**
     * Guarda una notificación fallida en la tabla de errores
     */
    saveFailedNotification(record: NotificationErrorRecord): Promise<void>;
    /**
     * Maneja errores de DynamoDB
     */
    private handleDynamoError;
    /**
     * Envuelve una promesa con timeout
     */
    private withTimeout;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=notification.service.d.ts.map