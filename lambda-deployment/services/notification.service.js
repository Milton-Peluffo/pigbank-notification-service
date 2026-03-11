"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const index_js_1 = require("../config/index.js");
const index_js_2 = require("../types/index.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
/**
 * Servicio para almacenar notificaciones en DynamoDB
 */
class NotificationService {
    constructor() {
        const dynamoDB = new client_dynamodb_1.DynamoDBClient({ region: index_js_1.ENV_CONFIG.AWS_REGION });
        this.docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoDB);
    }
    /**
     * Guarda una notificación exitosa en la tabla principal
     */
    async saveSuccessfulNotification(record) {
        try {
            logger_js_1.default.debug(`Guardando notificación exitosa: ${record.uuid}`);
            const command = new lib_dynamodb_1.PutCommand({
                TableName: index_js_1.ENV_CONFIG.TABLE_NAME,
                Item: {
                    ...record,
                    // Agregar TTL (auto-expiración en 90 días)
                    ttl: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60,
                },
            });
            await this.withTimeout(this.docClient.send(command), index_js_1.CONSTANTS.DYNAMO_TIMEOUT_MS, "DynamoDB PutItem (success)");
            logger_js_1.default.info(`Notificación guardada: ${record.uuid}`, {
                email: record.email,
                template: record.template,
            });
        }
        catch (error) {
            logger_js_1.default.error(`Error guardando notificación exitosa: ${record.uuid}`, {
                error: error instanceof Error ? error.message : String(error),
            });
            throw this.handleDynamoError(error, "saveSuccessfulNotification");
        }
    }
    /**
     * Guarda una notificación fallida en la tabla de errores
     */
    async saveFailedNotification(record) {
        try {
            logger_js_1.default.debug(`Guardando notificación fallida: ${record.uuid}`);
            const command = new lib_dynamodb_1.PutCommand({
                TableName: index_js_1.ENV_CONFIG.ERROR_TABLE_NAME,
                Item: {
                    ...record,
                    // Agregar TTL (auto-expiración en 30 días)
                    ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
                },
            });
            await this.withTimeout(this.docClient.send(command), index_js_1.CONSTANTS.DYNAMO_TIMEOUT_MS, "DynamoDB PutItem (error)");
            logger_js_1.default.warn(`Notificación fallida guardada: ${record.uuid}`, {
                email: record.email,
                template: record.template,
                errorCode: record.error.code,
            });
        }
        catch (error) {
            logger_js_1.default.error(`Error guardando notificación fallida: ${record.uuid}`, {
                error: error instanceof Error ? error.message : String(error),
            });
            throw this.handleDynamoError(error, "saveFailedNotification");
        }
    }
    /**
     * Maneja errores de DynamoDB
     */
    handleDynamoError(error, context) {
        if (error instanceof Error) {
            if (error.message.includes("Timeout")) {
                return new index_js_2.DynamoError(`Timeout DynamoDB en ${context}`, {
                    context,
                    code: "TIMEOUT",
                });
            }
            if (error.message.includes("ResourceNotFoundException")) {
                return new index_js_2.DynamoError(`Tabla DynamoDB no existe`, {
                    context,
                    code: "TABLE_NOT_FOUND",
                });
            }
            if (error.message.includes("ProvisionedThroughputExceededException")) {
                return new index_js_2.DynamoError(`Limite de throughput de DynamoDB excedido`, {
                    context,
                    code: "THROTTLED",
                });
            }
        }
        return new index_js_2.DynamoError(`Error DynamoDB en ${context}: ${error instanceof Error ? error.message : String(error)}`, {
            context,
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
exports.NotificationService = NotificationService;
// Singleton
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map