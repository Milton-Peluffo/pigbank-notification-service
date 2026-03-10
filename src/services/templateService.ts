import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Servicio para gestionar plantillas de correo almacenadas en S3
 * Descarga y cachea templates para mejorar performance
 */
export class TemplateService {
  private s3Client: S3Client;
  private templateCache: Map<string, string>;
  private bucketName: string;

  constructor(bucketName?: string) {
    this.s3Client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
    this.templateCache = new Map();
    this.bucketName = bucketName || process.env.TEMPLATES_BUCKET_NAME || "templates-email-notification";
  }

  /**
   * Obtiene un template de correo desde S3
   * Primero busca en cache para evitar llamadas repetidas a S3
   *
   * @param templateName - Nombre del template sin extensión (ej: "welcome")
   * @returns Promise<string> - Contenido HTML del template
   */
  async getTemplate(templateName: string): Promise<string> {
    // Busca en cache primero
    const cacheKey = this.getCacheKey(templateName);
    if (this.templateCache.has(cacheKey)) {
      console.log(`Template ${templateName} obtenido del cache`);
      return this.templateCache.get(cacheKey)!;
    }

    // Si no está en cache, descarga de S3
    const template = await this.downloadTemplateFromS3(templateName);

    // Guarda en cache para futuras llamadas
    this.templateCache.set(cacheKey, template);

    return template;
  }

  /**
   * Descarga un template desde S3
   *
   * @param templateName - Nombre del template sin extensión
   * @returns Promise<string> - Contenido HTML
   */
  private async downloadTemplateFromS3(templateName: string): Promise<string> {
    const key = `${templateName}.html`;

    try {
      console.log(
        `Descargando template ${templateName} desde S3 bucket ${this.bucketName}`
      );

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error("Respuesta de S3 sin contenido");
      }

      // Convierte el stream en string
      const template = await response.Body.transformToString("utf-8");
      return template;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      throw new Error(
        `Error descargando template '${templateName}' desde S3: ${errorMessage}`
      );
    }
  }

  /**
   * Limpia el cache de templates
   * Útil para testing o cuando se actualicen templates en S3
   *
   * @param templateName - Template específico a limpiar (opcional)
   */
  clearCache(templateName?: string): void {
    if (templateName) {
      this.templateCache.delete(this.getCacheKey(templateName));
      console.log(`Cache limpiado para template: ${templateName}`);
    } else {
      this.templateCache.clear();
      console.log("Cache de templates completamente limpiado");
    }
  }

  /**
   * Verifica si un template existe en S3
   *
   * @param templateName - Nombre del template a verificar
   * @returns Promise<boolean>
   */
  async templateExists(templateName: string): Promise<boolean> {
    const key = `${templateName}.html`;

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      // Si el objeto no existe, S3 lanza un error
      return false;
    }
  }

  /**
   * Obtiene la clave para el cache
   */
  private getCacheKey(templateName: string): string {
    return `${this.bucketName}:${templateName}`;
  }

  /**
   * Obtiene información del bucket y región
   */
  getConfiguration(): { bucket: string; region: string } {
    return {
      bucket: this.bucketName,
      region: process.env.AWS_REGION || "us-east-1",
    };
  }
}
