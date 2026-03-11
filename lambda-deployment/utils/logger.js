"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const index_js_1 = require("../config/index.js");
/**
 * Logger singleton for the service
 * In development shows colors, in production is JSON format
 */
const isDev = index_js_1.ENV_CONFIG.NODE_ENV === "development";
exports.logger = (0, pino_1.default)({
    level: index_js_1.ENV_CONFIG.LOG_LEVEL,
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
}, pino_1.default.destination({ sync: false }));
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map