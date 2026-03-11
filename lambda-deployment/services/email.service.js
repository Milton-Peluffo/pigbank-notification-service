"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const index_js_1 = require("../config/index.js");
const index_js_2 = require("../types/index.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
/**
 * Servicio para enviar emails via AWS SES
 */
class EmailService {
    constructor() {
        this.ses = new client_ses_1.SESClient({ region: index_js_1.ENV_CONFIG.AWS_REGION });
    }
    /**
     * Envía un email via SES
     * @param recipient Email del destinatario
     * @param subject Asunto del email
     * @param htmlContent Contenido HTML del email
     * @param textContent Contenido texto (opcional)
     * @returns Message ID de SES
     */
    async sendEmail(recipient, subject, htmlContent, textContent) {
        const command = new client_ses_1.SendEmailCommand({
            Source: index_js_1.ENV_CONFIG.SES_FROM_EMAIL,
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
            logger_js_1.default.debug(`Enviando email a ${recipient} con asunto: ${subject}`);
            const response = await this.withTimeout(this.ses.send(command), index_js_1.CONSTANTS.SES_TIMEOUT_MS, "SES sendEmail");
            logger_js_1.default.info(`Email enviado exitosamente a ${recipient}`, {
                messageId: response.MessageId,
                recipient,
            });
            return response.MessageId;
        }
        catch (error) {
            logger_js_1.default.error(`Error enviando email a ${recipient}`, {
                error: error instanceof Error ? error.message : String(error),
            });
            throw this.handleSESError(error, recipient);
        }
    }
    /**
     * Maneja errores específicos de SES
     */
    handleSESError(error, recipient) {
        if (error instanceof client_ses_1.MessageRejected) {
            return new index_js_2.SESError(`Email rechazado por SES: ${error.message}`, {
                recipient,
                code: "MESSAGE_REJECTED",
            });
        }
        if (error instanceof client_ses_1.ConfigurationSetDoesNotExistException) {
            return new index_js_2.SESError("ConfigurationSet de SES no existe", {
                recipient,
                code: "CONFIG_SET_NOT_FOUND",
            });
        }
        if (error instanceof Error) {
            if (error.name === "ThrottlingException") {
                return new index_js_2.SESError("SES está siendo throttled - reintentar más tarde", {
                    recipient,
                    code: "THROTTLED",
                });
            }
            if (error.message.includes("MessageRejected")) {
                return new index_js_2.SESError(`Email rechazado: ${error.message}`, {
                    recipient,
                    code: "MESSAGE_REJECTED",
                });
            }
        }
        return new index_js_2.SESError(`Error desconocido de SES: ${error instanceof Error ? error.message : String(error)}`, {
            recipient,
            originalError: error,
        });
    }
    /**
     * Envuelve una promesa con timeout
     */
    async withTimeout(promise, timeoutMs, context) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${context} excedió ${timeoutMs}ms`)), timeoutMs)),
        ]);
    }
}
exports.EmailService = EmailService;
// Singleton
exports.emailService = new EmailService();
//# sourceMappingURL=email.service.js.map