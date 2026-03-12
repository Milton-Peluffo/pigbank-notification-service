/**
 * Status of a notification
 */
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "RETRY";

/**
 * Record in the successful notifications table
 */
export interface NotificationRecord {
  uuid: string; // PK
  createdAt: string; // SK (ISO format)
  email: string;
  template: string;
  status: NotificationStatus;
  messageId: string; // ID returned by SES
  content: {
    subject: string;
    data: Record<string, any>;
  };
  updatedAt: string;
  ttl?: number; // For auto-expiration (useful)
}

/**
 * Record in the notifications table with error
 */
export interface NotificationErrorRecord {
  uuid: string; // PK
  createdAt: string; // SK (ISO format)
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