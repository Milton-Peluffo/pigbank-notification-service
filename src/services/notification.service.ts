import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ENV_CONFIG, CONSTANTS } from "../config/index.js";
import { NotificationRecord, NotificationErrorRecord } from "../types/notifications.js";
import { DynamoError } from "../types/index.js";
import logger from "../utils/logger.js";

/**
 * Servicio para almacenar notificaciones en DynamoDB
 */
export class NotificationService {
  private docClient: DynamoDBDocumentClient;

  constructor() {
    const dynamoDB = new DynamoDBClient({ region: ENV_CONFIG.AWS_REGION });
    this.docClient = DynamoDBDocumentClient.from(dynamoDB);
  }

  /**
   * Guarda una notificación exitosa en la tabla principal
   */
  async saveSuccessfulNotification(record: NotificationRecord): Promise<void> {
    try {
      logger.debug(`Guardando notificación exitosa: ${record.uuid}`);

      const command = new PutCommand({
        TableName: ENV_CONFIG.TABLE_NAME,
        Item: {
          ...record,
          // Agregar TTL (auto-expiración en 90 días)
          ttl: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60,
        },
      });

      await this.withTimeout(
        this.docClient.send(command),
        CONSTANTS.DYNAMO_TIMEOUT_MS,
        "DynamoDB PutItem (success)"
      );

      logger.info(`Notificación guardada: ${record.uuid}`, {
        email: record.email,
        template: record.template,
      });
    } catch (error) {
      logger.error(`Error guardando notificación exitosa: ${record.uuid}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw this.handleDynamoError(error, "saveSuccessfulNotification");
    }
  }

  /**
   * Guarda una notificación fallida en la tabla de errores
   */
  async saveFailedNotification(record: NotificationErrorRecord): Promise<void> {
    try {
      logger.debug(`Guardando notificación fallida: ${record.uuid}`);

      const command = new PutCommand({
        TableName: ENV_CONFIG.ERROR_TABLE_NAME,
        Item: {
          ...record,
          // Agregar TTL (auto-expiración en 30 días)
          ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        },
      });

      await this.withTimeout(
        this.docClient.send(command),
        CONSTANTS.DYNAMO_TIMEOUT_MS,
        "DynamoDB PutItem (error)"
      );

      logger.warn(`Notificación fallida guardada: ${record.uuid}`, {
        email: record.email,
        template: record.template,
        errorCode: record.error.code,
      });
    } catch (error) {
      logger.error(`Error guardando notificación fallida: ${record.uuid}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw this.handleDynamoError(error, "saveFailedNotification");
    }
  }

  /**
   * Maneja errores de DynamoDB
   */
  private handleDynamoError(error: unknown, context: string): DynamoError {
    if (error instanceof Error) {
      if (error.message.includes("Timeout")) {
        return new DynamoError(`Timeout DynamoDB en ${context}`, {
          context,
          code: "TIMEOUT",
        });
      }

      if (error.message.includes("ResourceNotFoundException")) {
        return new DynamoError(
          `Tabla DynamoDB no existe`,
          {
            context,
            code: "TABLE_NOT_FOUND",
          }
        );
      }

      if (error.message.includes("ProvisionedThroughputExceededException")) {
        return new DynamoError(
          `Limite de throughput de DynamoDB excedido`,
          {
            context,
            code: "THROTTLED",
          }
        );
      }
    }

    return new DynamoError(
      `Error DynamoDB en ${context}: ${error instanceof Error ? error.message : String(error)}`,
      {
        context,
        originalError: error,
      }
    );
  }

  /**
   * Envuelve una promesa con timeout
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    context: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Timeout: ${context} excedió ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }
}

// Singleton
export const notificationService = new NotificationService();
