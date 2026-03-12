/**
 * Status of a notification
 */
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "RETRY";
/**
 * Record in the successful notifications table
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
 * Record in the notifications table with error
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