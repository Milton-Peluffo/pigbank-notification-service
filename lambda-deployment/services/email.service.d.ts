/**
 * Servicio para enviar emails via AWS SES
 */
export declare class EmailService {
    private ses;
    constructor();
    /**
     * Envía un email via SES
     * @param recipient Email del destinatario
     * @param subject Asunto del email
     * @param htmlContent Contenido HTML del email
     * @param textContent Contenido texto (opcional)
     * @returns Message ID de SES
     */
    sendEmail(recipient: string, subject: string, htmlContent: string, textContent?: string): Promise<string>;
    /**
     * Maneja errores específicos de SES
     */
    private handleSESError;
    /**
     * Envuelve una promesa con timeout
     */
    private withTimeout;
}
export declare const emailService: EmailService;
//# sourceMappingURL=email.service.d.ts.map