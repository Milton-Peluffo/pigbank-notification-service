import { TemplateConfigMap } from "../types/templates.js";
/**
 * Central configuration of all notification templates
 * Maps each template type to its configuration (subject, file, variables)
 */
export declare const TEMPLATE_CONFIG: TemplateConfigMap;
/**
 * Environment variables with default values
 */
export declare const ENV_CONFIG: {
    AWS_REGION: string;
    TABLE_NAME: string;
    ERROR_TABLE_NAME: string;
    S3_BUCKET_NAME: string;
    SES_FROM_EMAIL: string;
    NODE_ENV: string;
    LOG_LEVEL: string;
};
/**
 * Timeout and retry constants
 */
export declare const CONSTANTS: {
    SES_TIMEOUT_MS: number;
    S3_TIMEOUT_MS: number;
    DYNAMO_TIMEOUT_MS: number;
    TEMPLATE_CACHE_TTL_MS: number;
    MAX_RETRIES: number;
    BATCH_SIZE: number;
};
//# sourceMappingURL=templates.config.d.ts.map