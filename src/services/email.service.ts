import {
  SESClient,
  SendEmailCommand,
  MessageRejected,
  ConfigurationSetDoesNotExistException,
} from "@aws-sdk/client-ses";
import { ENV_CONFIG, CONSTANTS } from "../config/index.js";
import { SESError } from "../types/index.js";
import logger from "../utils/logger.js";

/**
 * Servicio para enviar emails via AWS SES
 */
export class EmailService {
  private ses: SESClient;

  constructor() {
    this.ses = new SESClient({ region: ENV_CONFIG.AWS_REGION });
  }

  /**
   * Envía un email via SES
   * @param recipient Email del destinatario
   * @param subject Asunto del email
   * @param htmlContent Contenido HTML del email
   * @param textContent Contenido texto (opcional)
   * @returns Message ID de SES
   */
  async sendEmail(
    recipient: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<string> {
    const command = new SendEmailCommand({
      Source: ENV_CONFIG.SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [recipient],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: "UTF-8",
          },
          ...(textContent && {
            Text: {
              Data: textContent,
              Charset: "UTF-8",
            },
          }),
        },
      },
    });

    try {
      logger.debug(`Enviando email a ${recipient} con asunto: ${subject}`);

      const response = await this.withTimeout(
        this.ses.send(command),
        CONSTANTS.SES_TIMEOUT_MS,
        "SES sendEmail"
      );

      logger.info(`Email enviado exitosamente a ${recipient}`, {
        messageId: response.MessageId,
        recipient,
      });

      return response.MessageId!;
    } catch (error) {
      logger.error(`Error enviando email a ${recipient}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw this.handleSESError(error, recipient);
    }
  }

  /**
   * Maneja errores específicos de SES
   */
  private handleSESError(error: unknown, recipient: string): SESError {
    if (error instanceof MessageRejected) {
      return new SESError(
        `Email rechazado por SES: ${error.message}`,
        {
          recipient,
          code: "MESSAGE_REJECTED",
        }
      );
    }

    if (error instanceof ConfigurationSetDoesNotExistException) {
      return new SESError(
        "ConfigurationSet de SES no existe",
        {
          recipient,
          code: "CONFIG_SET_NOT_FOUND",
        }
      );
    }

    if (error instanceof Error) {
      if (error.name === "ThrottlingException") {
        return new SESError(
          "SES está siendo throttled - reintentar más tarde",
          {
            recipient,
            code: "THROTTLED",
          }
        );
      }

      if (error.message.includes("MessageRejected")) {
        return new SESError(
          `Email rechazado: ${error.message}`,
          {
            recipient,
            code: "MESSAGE_REJECTED",
          }
        );
      }
    }

    return new SESError(
      `Error desconocido de SES: ${error instanceof Error ? error.message : String(error)}`,
      {
        recipient,
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
export const emailService = new EmailService();
