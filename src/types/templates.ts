import { NotificationTemplate } from "./events.js";

/**
 * Configuración de una plantilla de email
 */
export interface TemplateConfig {
  subject: string;
  templateFile: string;
  variables: string[];
  description?: string;
}

/**
 * Mapeo de template type → configuración
 */
export type TemplateConfigMap = Record<NotificationTemplate, TemplateConfig>;

/**
 * Datos renderizados de una plantilla
 */
export interface RenderedTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Información de caché de una plantilla
 */
export interface CachedTemplate {
  content: string;
  timestamp: number;
  hash: string;
}
