"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailValidator = void 0;
const index_js_1 = require("../types/index.js");
/**
 * Email validator using regex
 * Based on RFC 5322 simplified
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class EmailValidator {
    /**
     * Validates email format
     * @param email Email to validate
     * @returns true if valid
     * @throws ValidationError if invalid
     */
    static validate(email) {
        if (!email || typeof email !== "string") {
            throw new index_js_1.ValidationError("Email is required and must be string", { email });
        }
        if (!EMAIL_REGEX.test(email)) {
            throw new index_js_1.ValidationError("Invalid email", { email });
        }
        if (email.length > 254) {
            throw new index_js_1.ValidationError("Email too long (maximum 254 characters)", { email });
        }
        return true;
    }
    /**
     * Extracts domain from email
     */
    static getDomain(email) {
        return email.split("@")[1];
    }
    /**
     * Extracts username from email
     */
    static getUsername(email) {
        return email.split("@")[0];
    }
}
exports.EmailValidator = EmailValidator;
//# sourceMappingURL=email-validator.js.map