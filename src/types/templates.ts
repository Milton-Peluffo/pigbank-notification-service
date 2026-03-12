import { NotificationTemplate } from "./events.js";

/**
 * Configuration of an email template
 */
export interface TemplateConfig {
  subject: string;
  templateFile: string;
  variables: string[];
  description?: string;
}

/**
 * Mapping of template type → configuration
 */
export type TemplateConfigMap = Record<NotificationTemplate, TemplateConfig>;

/**
 * Rendered data of a template
 */
export interface RenderedTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Cache information of a template
 */
export interface CachedTemplate {
  content: string;
  timestamp: number;
  hash: string;
}
