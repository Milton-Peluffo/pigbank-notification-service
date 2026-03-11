import { ValidationError } from "../types/index.js";

/**
 * Email validator using regex
 * Based on RFC 5322 simplified
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailValidator {
  /**
   * Validates email format
   * @param email Email to validate
   * @returns true if valid
   * @throws ValidationError if invalid
   */
  static validate(email: string): boolean {
    if (!email || typeof email !== "string") {
      throw new ValidationError("Email is required and must be string", { email });
    }

    if (!EMAIL_REGEX.test(email)) {
      throw new ValidationError("Invalid email", { email });
    }

    if (email.length > 254) {
      throw new ValidationError("Email too long (maximum 254 characters)", { email });
    }

    return true;
  }

  /**
   * Extracts domain from email
   */
  static getDomain(email: string): string {
    return email.split("@")[1];
  }

  /**
   * Extracts username from email
   */
  static getUsername(email: string): string {
    return email.split("@")[0];
  }
}
