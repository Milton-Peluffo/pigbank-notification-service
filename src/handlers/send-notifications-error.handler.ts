import { SQSEvent } from "aws-lambda";
import { sqsService, notificationService } from "../services/index.js";

import { NotificationErrorRecord } from "../types/index.js";
import logger from "../utils/logger.js";

/**
 * Lambda handler para procesar mensajes fallidos de la DLQ
 * Guarda información de error para auditoría
 */
export const handler = async (event: SQSEvent): Promise<void> => {
  logger.warn("⚠️ Handler de errores (DLQ) iniciado", {
    recordCount: event.Records?.length || 0,
  });

  const parsedRecords = sqsService.parseEvent(event);

  for (const record of parsedRecords) {
    try {
      await processErrorNotification(record.body);
    } catch (error) {
      logger.error(`Error procesando registro de error: ${record.messageId}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      // No lanzar error, ya que este es el handler de errores
    }
  }

  logger.info("📊 Procesamiento de DLQ completado", {
    total: parsedRecords.length,
  });
};

/**
 * Procesa un mensaje que falló después de reintentos
 * Guarda información de error en notification-error-table
 */
async function processErrorNotification(payload: any): Promise<void> {
  const uuid = require("uuid").v4();
  const createdAt = new Date().toISOString();

  logger.debug(`Guardando error para: ${payload.email}`, {
    template: payload.template,
  });

  const errorRecord: NotificationErrorRecord = {
    uuid,
    createdAt,
    email: payload.email,
    template: payload.template,
    status: "FAILED",
    error: {
      code: "DLQ_MESSAGE",
      message: "Mensaje falló después de máximo número de reintentos",
      details: {
        reason: "Max retries exceeded after 3 attempts",
      },
    },
    payload,
    failureCount: 3,
    updatedAt: new Date().toISOString(),
  };

  await notificationService.saveFailedNotification(errorRecord);

  logger.warn(`Notificación fallida registrada: ${uuid}`, {
    email: payload.email,
    template: payload.template,
  });
}

// Entry point para Lambda DLQ handler
