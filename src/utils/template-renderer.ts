import Handlebars from "handlebars";

/**
 * Renderiza una plantilla Handlebars con datos
 */
export class TemplateRenderer {
  /**
   * Compila y renderiza un template HTML
   * @param template HTML con variables {{varName}}
   * @param data Objeto con valores de variables
   * @returns HTML renderizado
   */
  static render(template: string, data: Record<string, any>): string {
    try {
      const compiled = Handlebars.compile(template);
      return compiled(data);
    } catch (error) {
      throw new Error(`Error compilando plantilla Handlebars: ${error}`);
    }
  }

  /**
   * Registra un helper personalizado de Handlebars
   */
  static registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
    Handlebars.registerHelper(name, fn);
  }

  /**
   * Extrae variables de una plantilla
   * @param template HTML con {{variables}}
   * @returns Array de variables encontradas
   */
  static extractVariables(template: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables: Set<string> = new Set();
    let match;

    while ((match = regex.exec(template)) !== null) {
      variables.add(match[1].trim());
    }

    return Array.from(variables);
  }
}
