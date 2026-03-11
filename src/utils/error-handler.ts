import { NotificationError, TemplateError } from "../types/index.js";
import logger from "./logger.js";

/**
 * Manejador centralizado de errores para logging y formateo
 */
export class ErrorHandler {
  /**
   * Loguea un error de manera consistente
   */
  static logError(error: unknown, context?: Record<string, any>): void {
    if (error instanceof NotificationError) {
      logger.error(
        {
          code: error.code,
          message: error.message,
          details: error.details,
          ...context,
        },
        `${error.name}: ${error.message}`
      );
    } else if (error instanceof Error) {
      logger.error(
        {
          message: error.message,
          stack: error.stack,
          ...context,
        },
        `Error no manejado: ${error.message}`
      );
    } else {
      logger.error(
        {
          error: String(error),
          ...context,
        },
        "Error desconocido"
      );
    }
  }

  /**
   * Convierte cualquier error a NotificationError
   */
  static toNotificationError(error: unknown, context?: string): NotificationError {
    if (error instanceof NotificationError) {
      return error;
    }

    if (error instanceof Error) {
      return new NotificationError("UNKNOWN_ERROR", `${context || ""} ${error.message}`, {
        originalError: error.message,
        stack: error.stack,
      });
    }

    return new NotificationError("UNKNOWN_ERROR", `${context || ""} ${String(error)}`);
  }

  /**
   * Determines if an error is recoverable (should retry)
   */
  static isRetryable(error: unknown): boolean {
    if (error instanceof TemplateError) {
      // No retry template missing errors
      return false;
    }

    if (error instanceof NotificationError) {
      // SES errors (timeout, throttling) are recoverable
      return error.code === "SES_ERROR" || error.code === "DYNAMO_ERROR";
    }

    // By default, unexpected errors are recoverable
    return true;
  }

  /**
   * Formats error to save in DynamoDB
   */
  static formatErrorRecord(error: unknown): {
    code: string;
    message: string;
    details?: Record<string, any>;
  } {
    if (error instanceof NotificationError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
      };
    }

    if (error instanceof Error) {
      return {
        code: "UNKNOWN_ERROR",
        message: error.message,
        details: {
          stack: error.stack,
        },
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: String(error),
    };
  }
}
