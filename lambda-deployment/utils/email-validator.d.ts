export declare class EmailValidator {
    /**
     * Valida formato de email
     * @param email Email a validar
     * @returns true si es válido
     * @throws ValidationError si es inválido
     */
    static validate(email: string): boolean;
    /**
     * Extrae dominio del email
     */
    static getDomain(email: string): string;
    /**
     * Extrae usuario del email
     */
    static getUsername(email: string): string;
}
//# sourceMappingURL=email-validator.d.ts.map