import type { Handler, SQSBatchResponse, SQSEvent, SQSRecord } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { EmailService } from "../services/emailService";
import { TemplateService } from "../services/templateService";
import { NotificationRepository } from "../services/notificationRepository";
import { TemplateParser } from "../utils/templateParser";
import type { NotificationMessage, NotificationLog } from "../types/notificationTypes";

/**
 * Lambda handler para procesar mensajes de notificaciones desde SQS
 * Maneja el flujo completo:
 * 1. Lee mensaje SQS
 * 2. Obtiene template de S3
 * 3. Reemplaza variables en template
 * 4. Envía email
 * 5. Registra resultado en DynamoDB
 */
export const handler: Handler<SQSEvent, SQSBatchResponse> = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  console.log("=== Iniciando procesamiento de notificaciones ===");
  console.log(`Procesando ${event.Records.length} mensaje(s)`);

  // Inicializa servicios
  const emailService = new EmailService();
  const templateService = new TemplateService();
  const repository = new NotificationRepository();

  // Array para registrar fallos de procesamiento
  const failedMessageIds: string[] = [];

  // Procesa cada mensaje del batch
  for (const record of event.Records) {
    try {
      await processSingleRecord(
        record,
        emailService,
        templateService,
        repository
      );
    } catch (error) {
      // Si falla el procesamiento, registra el ID del mensaje para DLQ
      failedMessageIds.push(record.messageId);
      console.error(
        `Error procesando mensaje ${record.messageId}:`,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  console.log("=== Procesamiento completado ===");

  // Retorna items fallidos para que SQS los env�e a DLQ
  return {
    batchItemFailures: failedMessageIds.map((messageId) => ({
      itemIdentifier: messageId,
    })),
  };
};

/**
 * Procesa un único registro de SQS
 */
async function processSingleRecord(
  record: SQSRecord,
  emailService: EmailService,
  templateService: TemplateService,
  repository: NotificationRepository
): Promise<void> {
  const notificationId = uuidv4();
  let notificationMessage: NotificationMessage | undefined;

  try {
    // Parse del mensaje SQS
    notificationMessage = JSON.parse(record.body) as NotificationMessage;

    console.log(
      `Procesando notificación: ${notificationMessage.template} -> ${notificationMessage.email}`
    );

    // Validaciones básicas
    validateNotificationMessage(notificationMessage);

    // Obtiene el template de S3
    const template = await templateService.getTemplate(
      notificationMessage.template.toLowerCase()
    );

    // Valida que todas las variables requeridas están disponibles
    const missingVariables = TemplateParser.validateVariables(
      template,
      notificationMessage.data
    );

    if (missingVariables.length > 0) {
      throw new Error(
        `Variables faltantes en template: ${missingVariables.join(", ")}`
      );
    }

    // Procesa el template reemplazando variables
    const processedHtml = TemplateParser.parse(
      template,
      notificationMessage.data
    );

    // Envía el email
    await emailService.sendEmail(
      notificationMessage.email,
      `Welcome to PigBank`, // Subject puede ser parametrizable
      processedHtml
    );

    // Registra éxito en DynamoDB
    const successLog: NotificationLog = {
      notificationId,
      email: notificationMessage.email,
      template: notificationMessage.template,
      status: "SUCCESS",
      createdAt: new Date().toISOString(),
      messageId: record.messageId,
    };

    await repository.saveSuccessLog(successLog);

    console.log(`✓ Notificación procesada exitosamente: ${notificationId}`);
  } catch (error) {
    // En caso de error, registra en tabla de errores
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    const errorLog: NotificationLog = {
      notificationId,
      email: notificationMessage?.email || "unknown@example.com",
      template: notificationMessage?.template || "UNKNOWN",
      status: "FAILURE",
      createdAt: new Date().toISOString(),
      messageId: record.messageId,
      errorMessage,
    };

    try {
      await repository.saveErrorLog(errorLog);
    } catch (repoError) {
      console.error(
        "Error guardando log de error:",
        repoError instanceof Error ? repoError.message : "Unknown error"
      );
    }

    // Re-lanza el error para que se registre como fallo en batch
    throw error;
  }
}

/**
 * Valida que el mensaje de notificación tenga los campos requeridos
 */
function validateNotificationMessage(message: NotificationMessage): void {
  if (!message.email) {
    throw new Error("Campo 'email' es requerido");
  }

  if (!message.template) {
    throw new Error("Campo 'template' es requerido");
  }

  if (!message.data || typeof message.data !== "object") {
    throw new Error("Campo 'data' es requerido y debe ser un objeto");
  }

  // Valida email básico
  if (!EmailService.validateEmail(message.email)) {
    throw new Error(`Email inválido: ${message.email}`);
  }
}
