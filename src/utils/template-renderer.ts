import Handlebars from "handlebars";

/**
 * Renderiza una plantilla Handlebars con datos
 */
export class TemplateRenderer {
  /**
   * Renderiza un template con los datos proporcionados
   * @param template Template HTML
   * @param data Datos para renderizar
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

// Registrar helper para manejar date o loginDate
TemplateRenderer.registerHelper('dateOrLoginDate', function(data: any) {
  return data.date || data.loginDate || '';
});
