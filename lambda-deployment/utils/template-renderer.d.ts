import Handlebars from "handlebars";
/**
 * Renderiza una plantilla Handlebars con datos
 */
export declare class TemplateRenderer {
    /**
     * Renderiza un template con los datos proporcionados
     * @param template Template HTML
     * @param data Datos para renderizar
     * @returns HTML renderizado
     */
    static render(template: string, data: Record<string, any>): string;
    /**
     * Registra un helper personalizado de Handlebars
     */
    static registerHelper(name: string, fn: Handlebars.HelperDelegate): void;
    /**
     * Extrae variables de una plantilla
     * @param template HTML con {{variables}}
     * @returns Array de variables encontradas
     */
    static extractVariables(template: string): string[];
}
//# sourceMappingURL=template-renderer.d.ts.map