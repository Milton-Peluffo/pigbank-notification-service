/**
 * Servicio para obtener y cachear templates HTML desde S3
 */
export declare class TemplateService {
    private s3;
    private cache;
    constructor();
    /**
     * Obtiene un template desde S3 con caché
     * @param templateFile Nombre del archivo (ej: "welcome.html")
     * @returns Contenido HTML del template
     */
    getTemplate(templateFile: string): Promise<string>;
    /**
     * Convierte un stream a string
     */
    private streamToString;
    /**
     * Maneja errores de S3
     */
    private handleS3Error;
    /**
     * Envuelve una promesa con timeout
     */
    private withTimeout;
    /**
     * Limpia el caché (útil para testing)
     */
    clearCache(): void;
}
export declare const templateService: TemplateService;
//# sourceMappingURL=template.service.d.ts.map