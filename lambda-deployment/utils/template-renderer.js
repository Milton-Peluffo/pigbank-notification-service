"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateRenderer = void 0;
const handlebars_1 = __importDefault(require("handlebars"));
/**
 * Renderiza una plantilla Handlebars con datos
 */
class TemplateRenderer {
    /**
     * Compila y renderiza un template HTML
     * @param template HTML con variables {{varName}}
     * @param data Objeto con valores de variables
     * @returns HTML renderizado
     */
    static render(template, data) {
        try {
            const compiled = handlebars_1.default.compile(template);
            return compiled(data);
        }
        catch (error) {
            throw new Error(`Error compilando plantilla Handlebars: ${error}`);
        }
    }
    /**
     * Registra un helper personalizado de Handlebars
     */
    static registerHelper(name, fn) {
        handlebars_1.default.registerHelper(name, fn);
    }
    /**
     * Extrae variables de una plantilla
     * @param template HTML con {{variables}}
     * @returns Array de variables encontradas
     */
    static extractVariables(template) {
        const regex = /\{\{([^}]+)\}\}/g;
        const variables = new Set();
        let match;
        while ((match = regex.exec(template)) !== null) {
            variables.add(match[1].trim());
        }
        return Array.from(variables);
    }
}
exports.TemplateRenderer = TemplateRenderer;
//# sourceMappingURL=template-renderer.js.map