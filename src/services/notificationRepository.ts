import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { NotificationLog } from "../types/notificationTypes";

/**
 * Servicio para almacenar y recuperar logs de notificaciones en DynamoDB
 * Mantiene un registro de todos los intentos de envío
 */
export class NotificationRepository {
  private client: DynamoDBDocumentClient;
  private tableName: string;
  private errorTableName: string;

  constructor(tableName?: string, errorTableName?: string) {
    const dynamoDbClient = new DynamoDBClient({
      region: process.env.AWS_REGION || "us-east-1",
    });

    this.client = DynamoDBDocumentClient.from(dynamoDbClient);
    this.tableName = tableName || process.env.NOTIFICATION_TABLE_NAME || "notification-table";
    this.errorTableName =
      errorTableName || process.env.NOTIFICATION_ERROR_TABLE_NAME || "notification-error-table";
  }

  /**
   * Guarda un log exitoso de notificación en DynamoDB
   *
   * @param log - Objeto NotificationLog con detalles de la notificación
   * @returns Promise<void>
   */
  async saveSuccessLog(log: NotificationLog): Promise<void> {
    try {
      const item = this.buildLogItem(log, "SUCCESS");

      const command = new PutCommand({
        TableName: this.tableName,
        Item: item,
      });

      await this.client.send(command);
      console.log(
        `Log de notificación exitosa guardado. ID: ${log.notificationId}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      throw new Error(
        `Error guardando log exitoso en DynamoDB: ${errorMessage}`
      );
    }
  }

  /**
   * Guarda un log de fallo en la tabla de errores
   *
   * @param log - Objeto NotificationLog con información del error
   * @returns Promise<void>
   */
  async saveErrorLog(log: NotificationLog): Promise<void> {
    try {
      const item = this.buildLogItem(log, "FAILURE");

      const command = new PutCommand({
        TableName: this.errorTableName,
        Item: item,
      });

      await this.client.send(command);
      console.log(
        `Log de error guardado en tabla de errores. ID: ${log.notificationId}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      throw new Error(
        `Error guardando log de error en DynamoDB: ${errorMessage}`
      );
    }
  }

  /**
   * Construye el item a insertar en DynamoDB
   * Incluye atributos requeridos y auditoria
   */
  private buildLogItem(
    log: NotificationLog,
    status: "SUCCESS" | "FAILURE"
  ): Record<string, unknown> {
    return {
      notificationId: log.notificationId, // PK
      createdAt: log.createdAt || new Date().toISOString(), // SK
      email: log.email,
      template: log.template,
      status: status,
      messageId: log.messageId,
      ...(log.errorMessage && { errorMessage: log.errorMessage }),
      timestamp: Math.floor(Date.now() / 1000), // Para TTL si está configurado
    };
  }

  /**
   * Retorna los nombres de las tablas configuradas
   */
  getTableNames(): { success: string; error: string } {
    return {
      success: this.tableName,
      error: this.errorTableName,
    };
  }
}
