import { Handler, SQSEvent } from "aws-lambda";
import { NotificationRepository } from "../services/notificationRepository";
import { NotificationLog } from "../types/notificationTypes";

/**
 * Lambda handler para procesar mensajes en la Dead Letter Queue (DLQ)
 * Se activa cuando un mensaje falla después de reintentos en SQS
 * Registra logs detallados de errores y puede generar alertas
 */
export const handler: Handler<SQSEvent, void> = async (event) => {
  console.log("=== Procesando mensajes de DLQ ===");
  console.log(`Procesando ${event.Records.length} mensaje(s) en DLQ`);

  const repository = new NotificationRepository();
  let processedCount = 0;

  for (const record of event.Records) {
    try {
      console.log(`\nProcesando DLQ Message ID: ${record.messageId}`);

      // Intenta parsear el mensaje para obtener más contexto
      let messageBody: Record<string, unknown> = {};
      try {
        messageBody = JSON.parse(record.body);
      } catch {
        // Si no se puede parsear, solo registra el body como string
        messageBody = { rawBody: record.body };
      }

      // Crea un log de error en la tabla de errores
      const errorLog: NotificationLog = {
        notificationId: `dlq-${record.messageId}`,
        email: (messageBody.email as string) || "unknown",
        template: (messageBody.template as string) || "unknown",
        status: "FAILURE",
        createdAt: new Date().toISOString(),
        messageId: record.messageId,
        errorMessage: `Mensaje en DLQ después de reintentos. Último atributo de intento: ${record.attributes.ApproximateReceiveCount}`,
      };

      await repository.saveErrorLog(errorLog);
      processedCount++;

      console.log(`✓ DLQ log guardado para mensaje: ${record.messageId}`);

      // TODO: Aquí se podrían enviar alertas (SNS, CloudWatch Alarms, etc.)
      // await sendAlert(errorLog);

      // TODO: También podría retentarse a través de otra cola de reintentos
      // await sendToRetryQueue(messageBody);
    } catch (error) {
      console.error(
        `Error procesando DLQ message ${record.messageId}:`,
        error instanceof Error ? error.message : "Unknown error"
      );
      // Continúa procesando otros mensajes incluso si uno falla
    }
  }

  console.log(`=== DLQ Procesamiento completado: ${processedCount} mensajes ===`);
};
