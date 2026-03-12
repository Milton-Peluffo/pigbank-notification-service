export declare class EmailValidator {
    /**
     * Validates email format
     * @param email Email to validate
     * @returns true if valid
     * @throws ValidationError if invalid
     */
    static validate(email: string): boolean;
    /**
     * Extracts domain from email
     */
    static getDomain(email: string): string;
    /**
     * Extracts username from email
     */
    static getUsername(email: string): string;
}
//# sourceMappingURL=email-validator.d.ts.map