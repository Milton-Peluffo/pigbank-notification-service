/**
 * Estado de una notificación
 */
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "RETRY";
/**
 * Registro en la tabla de notificaciones exitosas
 */
export interface NotificationRecord {
    uuid: string;
    createdAt: string;
    email: string;
    template: string;
    status: NotificationStatus;
    messageId: string;
    content: {
        subject: string;
        data: Record<string, any>;
    };
    updatedAt: string;
    ttl?: number;
}
/**
 * Registro en la tabla de notificaciones con error
 */
export interface NotificationErrorRecord {
    uuid: string;
    createdAt: string;
    email: string;
    template: string;
    status: "FAILED";
    error: {
        code: string;
        message: string;
        details?: Record<string, any>;
    };
    payload: Record<string, any>;
    failureCount: number;
    updatedAt: string;
    ttl?: number;
}
//# sourceMappingURL=notifications.d.ts.map