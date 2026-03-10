import type { TemplateVariables } from "../types/notificationTypes";

/**
 * Servicio de análisis y reemplazo de variables en plantillas HTML
 * Reemplaza placeholders con formato {{variableName}} con valores reales
 */
export class TemplateParser {
  /**
   * Reemplaza placeholders en un HTML con valores de datos
   * Ejemplo: "Hello {{name}}" -> "Hello Jane"
   *
   * @param template - HTML del template con placeholders
   * @param variables - Object con valores a reemplazar
   * @returns HTML procesado con variables reemplazadas
   */
  static parse(template: string, variables: TemplateVariables): string {
    try {
      let processedTemplate = template;

      // Itera sobre cada variable y reemplaza sus placeholders
      for (const [key, value] of Object.entries(variables)) {
        // Crea un regex seguro para el placeholder {{key}}
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        processedTemplate = processedTemplate.replace(placeholder, String(value));
      }

      return processedTemplate;
    } catch (error) {
      throw new Error(
        `Error al procesar template: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Valida que todos los placeholders requeridos están en las variables
   * Útil para detectar errores antes de enviar el email
   *
   * @param template - HTML del template
   * @param variables - Variables disponibles
   * @returns Array con nombres de placeholders no encontrados
   */
  static validateVariables(template: string, variables: TemplateVariables): string[] {
    try {
      // Busca todos los placeholders en formato {{variable}}
      const placeholderRegex = /\{\{(\w+)\}\}/g;
      const missingVariables: string[] = [];
      let match;

      while ((match = placeholderRegex.exec(template)) !== null) {
        const variableName = match[1];
        if (variableName && !(variableName in variables)) {
          missingVariables.push(variableName);
        }
      }

      return missingVariables;
    } catch (error) {
      throw new Error(
        `Error al validar template: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
