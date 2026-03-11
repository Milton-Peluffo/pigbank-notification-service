import { SQSEvent, SQSRecord } from "aws-lambda";
import { IncomingSQSPayload, ParsedNotificationRecord } from "../types/events.js";
import { ValidationError } from "../types/index.js";
import logger from "../utils/logger.js";

/**
 * Servicio para procesar mensajes de SQS
 */
export class SQSService {
  /**
   * Parsea un evento SQS y extrae los records válidos
   * @param event Evento de SQS
   * @returns Array de records parseados
   */
  parseEvent(event: SQSEvent): ParsedNotificationRecord[] {
    if (!event.Records || !Array.isArray(event.Records)) {
      logger.warn("SQS event sin Records");
      return [];
    }

    const parsed: ParsedNotificationRecord[] = [];

    for (const record of event.Records) {
      try {
        const payload = this.parseRecord(record);
        parsed.push({
          messageId: record.messageId,
          receiptHandle: record.receiptHandle,
          body: payload,
          attributes: record.attributes,
        });
      } catch (error) {
        logger.error(`Error parseando record SQS ${record.messageId}`, {
          error: error instanceof Error ? error.message : String(error),
        });
        // Continuar con otros records
      }
    }

    logger.info(`SQS Event parseado: ${parsed.length}/${event.Records.length} records válidos`);
    return parsed;
  }

  /**
   * Parsea un record individual de SQS
   */
  private parseRecord(record: SQSRecord): IncomingSQSPayload {
    if (!record.body) {
      throw new ValidationError("SQS Record body está vacío", {
        messageId: record.messageId,
      });
    }

    let payload: IncomingSQSPayload;

    try {
      payload = JSON.parse(record.body) as IncomingSQSPayload;
    } catch (error) {
      throw new ValidationError("SQS body no es JSON válido", {
        messageId: record.messageId,
        body: record.body.substring(0, 100),
      });
    }

    this.validatePayload(payload, record.messageId);
    return payload;
  }

  /**
   * Valida que el payload tenga los campos requeridos
   */
  private validatePayload(payload: any, messageId: string): void {
    if (!payload.email) {
      throw new ValidationError("Campo 'email' es requerido", {
        messageId,
        payload: JSON.stringify(payload).substring(0, 100),
      });
    }

    if (!payload.template) {
      throw new ValidationError("Campo 'template' es requerido", {
        messageId,
        email: payload.email,
      });
    }

    if (!payload.data || typeof payload.data !== "object") {
      throw new ValidationError("Campo 'data' es requerido y debe ser un objeto", {
        messageId,
        email: payload.email,
        template: payload.template,
      });
    }
  }
}

// Singleton
export const sqsService = new SQSService();
