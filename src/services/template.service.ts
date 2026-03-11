import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import NodeCache from "node-cache";
import { ENV_CONFIG, CONSTANTS } from "../config/index.js";
import { TemplateError } from "../types/index.js";
import logger from "../utils/logger.js";

/**
 * Servicio para obtener y cachear templates HTML desde S3
 */
export class TemplateService {
  private s3: S3Client;
  private cache: NodeCache;

  constructor() {
    this.s3 = new S3Client({ region: ENV_CONFIG.AWS_REGION });
    // Usar TTL en milisegundos
    this.cache = new NodeCache({
      stdTTL: CONSTANTS.TEMPLATE_CACHE_TTL_MS / 1000, // node-cache usa segundos
      checkperiod: 60,
    });
  }

  /**
   * Obtiene un template desde S3 con caché
   * @param templateFile Nombre del archivo (ej: "welcome.html")
   * @returns Contenido HTML del template
   */
  async getTemplate(templateFile: string): Promise<string> {
    // Buscar en caché primero
    const cached = this.cache.get<string>(templateFile);
    if (cached) {
      logger.debug(`Template ${templateFile} obtenido del caché`);
      return cached;
    }

    try {
      logger.debug(`Obteniendo template ${templateFile} desde S3`);

      const command = new GetObjectCommand({
        Bucket: ENV_CONFIG.S3_BUCKET_NAME,
        Key: templateFile,
      });

      const response = await this.withTimeout(
        this.s3.send(command),
        CONSTANTS.S3_TIMEOUT_MS,
        `S3 GetObject ${templateFile}`
      );

      if (!response.Body) {
        throw new Error("S3 Body está vacío");
      }

      // Convertir stream a string
      const content = await this.streamToString(response.Body);

      // Guardar en caché
      this.cache.set(templateFile, content);

      logger.debug(`Template ${templateFile} cacheado exitosamente`);
      return content;
    } catch (error) {
      logger.error(`Error obteniendo template ${templateFile}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw this.handleS3Error(error, templateFile);
    }
  }

  /**
   * Convierte un stream a string
   */
  private async streamToString(stream: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];

      stream.on("data", (chunk: Uint8Array) => {
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
  private handleS3Error(error: unknown, templateFile: string): TemplateError {
    if (error instanceof Error) {
      if (error.name === "NoSuchKey") {
        return new TemplateError(`Template ${templateFile} no existe en S3`, {
          templateFile,
          code: "NOT_FOUND",
        });
      }

      if (error.name === "NoSuchBucket") {
        return new TemplateError(
          `Bucket ${ENV_CONFIG.S3_BUCKET_NAME} no existe`,
          {
            bucket: ENV_CONFIG.S3_BUCKET_NAME,
            code: "BUCKET_NOT_FOUND",
          }
        );
      }

      if (error.message.includes("Timeout")) {
        return new TemplateError(`Timeout obteniendo template: ${error.message}`, {
          templateFile,
          code: "TIMEOUT",
        });
      }
    }

    return new TemplateError(
      `Error obteniendo template ${templateFile}: ${error instanceof Error ? error.message : String(error)}`,
      {
        templateFile,
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

  /**
   * Limpia el caché (útil para testing)
   */
  clearCache(): void {
    this.cache.flushAll();
  }
}

// Singleton
export const templateService = new TemplateService();
