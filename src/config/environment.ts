import { z } from "zod";
import { ENV_CONFIG } from "./templates.config.js";
import { ConfigError } from "../types/index.js";

/**
 * Schema de validación para variables de entorno
 */
const EnvSchema = z.object({
  AWS_REGION: z.string().min(1),
  TABLE_NAME: z.string().min(1),
  ERROR_TABLE_NAME: z.string().min(1),
  S3_BUCKET_NAME: z.string().min(1),
  SES_FROM_EMAIL: z.string().email(),
  NODE_ENV: z.enum(["development", "production", "test"]),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]),
});

/**
 * Validar configuración de entorno al iniciar
 */
export function validateConfig(): void {
  try {
    EnvSchema.parse(ENV_CONFIG);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
      throw new ConfigError(`Configuración inválida: ${issues}`);
    }
    throw error;
  }
}

export { ENV_CONFIG };
