"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateService = exports.TemplateService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const node_cache_1 = __importDefault(require("node-cache"));
const index_js_1 = require("../config/index.js");
const index_js_2 = require("../types/index.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
/**
 * Servicio para obtener y cachear templates HTML desde S3
 */
class TemplateService {
    constructor() {
        this.s3 = new client_s3_1.S3Client({ region: index_js_1.ENV_CONFIG.AWS_REGION });
        // Usar TTL en milisegundos
        this.cache = new node_cache_1.default({
            stdTTL: index_js_1.CONSTANTS.TEMPLATE_CACHE_TTL_MS / 1000, // node-cache usa segundos
            checkperiod: 60,
        });
    }
    /**
     * Obtiene un template desde S3 con caché
     * @param templateFile Nombre del archivo (ej: "welcome.html")
     * @returns Contenido HTML del template
     */
    async getTemplate(templateFile) {
        // Buscar en caché primero
        const cached = this.cache.get(templateFile);
        if (cached) {
            logger_js_1.default.debug(`Template ${templateFile} obtenido del caché`);
            return cached;
        }
        try {
            logger_js_1.default.debug(`Obteniendo template ${templateFile} desde S3`);
            const command = new client_s3_1.GetObjectCommand({
                Bucket: index_js_1.ENV_CONFIG.S3_BUCKET_NAME,
                Key: templateFile,
            });
            const response = await this.withTimeout(this.s3.send(command), index_js_1.CONSTANTS.S3_TIMEOUT_MS, `S3 GetObject ${templateFile}`);
            if (!response.Body) {
                throw new Error("S3 Body está vacío");
            }
            // Convertir stream a string
            const content = await this.streamToString(response.Body);
            // Guardar en caché
            this.cache.set(templateFile, content);
            logger_js_1.default.debug(`Template ${templateFile} cacheado exitosamente`);
            return content;
        }
        catch (error) {
            logger_js_1.default.error(`Error obteniendo template ${templateFile}`, {
                error: error instanceof Error ? error.message : String(error),
            });
            throw this.handleS3Error(error, templateFile);
        }
    }
    /**
     * Convierte un stream a string
     */
    async streamToString(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on("data", (chunk) => {
                chunks.push(chunk);
            });
            stream.on("end", () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer.toString("utf-8"));
            });
            stream.on("error", reject);
        });
    }
    /**
     * Maneja errores de S3
     */
    handleS3Error(error, templateFile) {
        if (error instanceof Error) {
            if (error.name === "NoSuchKey") {
                return new index_js_2.TemplateError(`Template ${templateFile} no existe en S3`, {
                    templateFile,
                    code: "NOT_FOUND",
                });
            }
            if (error.name === "NoSuchBucket") {
                return new index_js_2.TemplateError(`Bucket ${index_js_1.ENV_CONFIG.S3_BUCKET_NAME} no existe`, {
                    bucket: index_js_1.ENV_CONFIG.S3_BUCKET_NAME,
                    code: "BUCKET_NOT_FOUND",
                });
            }
            if (error.message.includes("Timeout")) {
                return new index_js_2.TemplateError(`Timeout obteniendo template: ${error.message}`, {
                    templateFile,
                    code: "TIMEOUT",
                });
            }
        }
        return new index_js_2.TemplateError(`Error obteniendo template ${templateFile}: ${error instanceof Error ? error.message : String(error)}`, {
            templateFile,
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
    /**
     * Limpia el caché (útil para testing)
     */
    clearCache() {
        this.cache.flushAll();
    }
}
exports.TemplateService = TemplateService;
// Singleton
exports.templateService = new TemplateService();
//# sourceMappingURL=template.service.js.map