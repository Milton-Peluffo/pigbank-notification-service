import nodemailer from "nodemailer";

/**
 * Servicio de envío de correos electrónicos
 * Utiliza nodemailer para enviar emails a través de SMTP
 */
export class EmailService {
  private transporter: nodemailer.Transporter | null;

  constructor() {
    // Inicializa el transportador de nodemailer con configuración del ambiente
    // En desarrollo, puede usar ethereal.email para testing sin SMTP real
    this.transporter = this.initializeTransporter();
  }

  /**
   * Inicializa el transportador SMTP
   * Busca configuración en variables de ambiente
   */
  private initializeTransporter(): nodemailer.Transporter | null {
    try {
      // En producción, usar variables de ambiente para credenciales SMTP
      const smtpConfig = {
        host: process.env.SMTP_HOST || "localhost",
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true", // true para 465, false para otros
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            }
          : undefined,
      };

      return nodemailer.createTransport(smtpConfig);
    } catch (error) {
      console.error("Error inicializando transportador SMTP:", error);
      return null;
    }
  }

  /**
   * Envía un correo electrónico
   *
   * @param to - Correo destinatario
   * @param subject - Asunto del email
   * @param html - Contenido HTML del email
   * @param from - Remitente (opcional, usa valor por defecto)
   * @returns Promise<void>
   */
  async sendEmail(to: string, subject: string, html: string, from?: string): Promise<void> {
    if (!this.transporter) {
      throw new Error("Email transporter no está inicializado");
    }

    const mailOptions = {
      from: from || process.env.SMTP_FROM_EMAIL || "noreply@pigbank.com",
      to,
      subject,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email enviado exitosamente. Message ID: ${info.messageId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido al enviar email";
      throw new Error(`Fallo al enviar email a ${to}: ${errorMessage}`);
    }
  }

  /**
   * Valida que una dirección de correo sea válida
   *
   * @param email - Dirección de correo a validar
   * @returns boolean - true si es válida
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Verifica la conexión al servidor SMTP
   * Útil para health checks
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log("Conexión SMTP verificada exitosamente");
      return true;
    } catch (error) {
      console.error(
        "Error verificando conexión SMTP:",
        error instanceof Error ? error.message : "Unknown error"
      );
      return false;
    }
  }
}
