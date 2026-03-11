import { ValidationError } from "../types/index.js";

/**
 * Validador de emails usando regex
 * Basado en RFC 5322 simplified
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailValidator {
  /**
   * Valida formato de email
   * @param email Email a validar
   * @returns true si es válido
   * @throws ValidationError si es inválido
   */
  static validate(email: string): boolean {
    if (!email || typeof email !== "string") {
      throw new ValidationError("Email es requerido y debe ser string", { email });
    }

    if (!EMAIL_REGEX.test(email)) {
      throw new ValidationError("Email inválido", { email });
    }

    if (email.length > 254) {
      throw new ValidationError("Email demasiado largo (máximo 254 caracteres)", { email });
    }

    return true;
  }

  /**
   * Extrae dominio del email
   */
  static getDomain(email: string): string {
    return email.split("@")[1];
  }

  /**
   * Extrae usuario del email
   */
  static getUsername(email: string): string {
    return email.split("@")[0];
  }
}
