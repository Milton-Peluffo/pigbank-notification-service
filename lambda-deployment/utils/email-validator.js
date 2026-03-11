"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailValidator = void 0;
const index_js_1 = require("../types/index.js");
/**
 * Validador de emails usando regex
 * Basado en RFC 5322 simplified
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class EmailValidator {
    /**
     * Valida formato de email
     * @param email Email a validar
     * @returns true si es válido
     * @throws ValidationError si es inválido
     */
    static validate(email) {
        if (!email || typeof email !== "string") {
            throw new index_js_1.ValidationError("Email es requerido y debe ser string", { email });
        }
        if (!EMAIL_REGEX.test(email)) {
            throw new index_js_1.ValidationError("Email inválido", { email });
        }
        if (email.length > 254) {
            throw new index_js_1.ValidationError("Email demasiado largo (máximo 254 caracteres)", { email });
        }
        return true;
    }
    /**
     * Extrae dominio del email
     */
    static getDomain(email) {
        return email.split("@")[1];
    }
    /**
     * Extrae usuario del email
     */
    static getUsername(email) {
        return email.split("@")[0];
    }
}
exports.EmailValidator = EmailValidator;
//# sourceMappingURL=email-validator.js.map