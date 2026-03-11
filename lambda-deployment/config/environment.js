"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV_CONFIG = void 0;
exports.validateConfig = validateConfig;
const zod_1 = require("zod");
const templates_config_js_1 = require("./templates.config.js");
Object.defineProperty(exports, "ENV_CONFIG", { enumerable: true, get: function () { return templates_config_js_1.ENV_CONFIG; } });
const index_js_1 = require("../types/index.js");
/**
 * Schema de validación para variables de entorno
 */
const EnvSchema = zod_1.z.object({
    AWS_REGION: zod_1.z.string().min(1),
    TABLE_NAME: zod_1.z.string().min(1),
    ERROR_TABLE_NAME: zod_1.z.string().min(1),
    S3_BUCKET_NAME: zod_1.z.string().min(1),
    SES_FROM_EMAIL: zod_1.z.string().email(),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]),
    LOG_LEVEL: zod_1.z.enum(["debug", "info", "warn", "error"]),
});
/**
 * Validar configuración de entorno al iniciar
 */
function validateConfig() {
    try {
        EnvSchema.parse(templates_config_js_1.ENV_CONFIG);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const issues = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
            throw new index_js_1.ConfigError(`Configuración inválida: ${issues}`);
        }
        throw error;
    }
}
//# sourceMappingURL=environment.js.map