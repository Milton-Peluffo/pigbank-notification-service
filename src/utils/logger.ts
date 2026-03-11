import pino from "pino";
import { ENV_CONFIG } from "../config/index.js";

/**
 * Logger singleton for the service
 * In development shows colors, in production is JSON format
 */
const isDev = ENV_CONFIG.NODE_ENV === "development";

export const logger = pino(
  {
    level: ENV_CONFIG.LOG_LEVEL,
    transport: isDev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            singleLine: false,
            translateTime: "SYS:standard",
          },
        }
      : undefined,
  },
  pino.destination({ sync: false })
);

export default logger;
