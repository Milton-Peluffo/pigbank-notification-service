/**
 * Estado de una notificación
 */
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "RETRY";

/**
 * Registro en la tabla de notificaciones exitosas
 */
export interface NotificationRecord {
  uuid: string; // PK
  createdAt: string; // SK (ISO format)
  email: string;
  template: string;
  status: NotificationStatus;
  messageId: string; // ID retornado por SES
  content: {
    subject: string;
    data: Record<string, any>;
  };
  updatedAt: string;
  ttl?: number; // Para auto-expiración (útil)
}

/**
 * Registro en la tabla de notificaciones con error
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
