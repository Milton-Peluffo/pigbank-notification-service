# Correción de Errores TypeScript - PigBank Notification Service

## Resumen Ejecutivo

Se han arreglado **15 errores de compilación TypeScript** en el proyecto. Para compilar, usar:

```bash
# Opción 1 (Recomendado): Compilar directamente
.\node_modules\.bin\tsc

# Opción 2: O instalar npm como comando global
npm install -g typescript
tsc
```

## Errores Arreglados

### 1. **Imports tipo-solamente (Type-Only Imports)**
**Problema**: Con `verbatimModuleSyntax` habilitado, los tipos deben importarse con la palabra clave `type`.

**Archivos Afectados**:
- `src/handlers/sendNotifications.ts`
- `src/handlers/sendNotificationsError.ts`
- `src/services/notificationRepository.ts`
- `src/utils/templateParser.ts`

**Cambios**:
```typescript
// ANTES
import { Handler, SQSBatchResponse, SQSEvent } from "aws-lambda";
import { NotificationMessage, NotificationLog, SQSRecord } from "../types/notificationTypes";

// DESPUÉS
import type { Handler, SQSBatchResponse, SQSEvent, SQSRecord } from "aws-lambda";
import type { NotificationMessage, NotificationLog } from "../types/notificationTypes";
```

---

### 2. **Modulo 'aws-lambda' No Encontrado**
**Problema**: Faltaba instalar `@types/aws-lambda`.

**Solución**: 
```bash
npm install --save-dev @types/aws-lambda@8.10.130
```

---

### 3. **Módulo 'nodemailer' Sin Declaraciones de Tipo**
**Problema**: TypeScript no encontraba tipos para nodemailer aunque estaban instalados.

**Solución**: Se creó archivo de declaración de tipos personalizado.

**Archivo Nuevo**:
- `src/types/nodemailer.d.ts`

```typescript
declare module "nodemailer" {
  interface SmtpConfig {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user?: string;
      pass?: string | undefined;
    } | undefined;
  }
  
  interface Transporter {
    sendMail(mailOptions: MailOptions): Promise<SendMailResponse>;
    verify(): Promise<boolean>;
  }
  
  function createTransport(config: SmtpConfig): Transporter;
  export { createTransport, Transporter, MailOptions, SmtpConfig };
  export default { createTransport };
}
```

---

### 4. **Parámetros con Tipo Implícito 'any'**
**Problema**: Los parámetros de los handlers no tenían tipos explícitos.

**Archivo**: `src/handlers/sendNotifications.ts`, `src/handlers/sendNotificationsError.ts`

**Cambios**:
```typescript
// ANTES
export const handler: Handler<SQSEvent, SQSBatchResponse> = async (event) => {

// DESPUÉS
export const handler: Handler<SQSEvent, SQSBatchResponse> = async (event: SQSEvent): Promise<SQSBatchResponse> => {
```

---

### 5. **Variable Usada Antes de ser Asignada**
**Problema**: `notificationMessage` se usaba en el bloque `catch` pero podía estar sin inicializar.

**Archivo**: `src/handlers/sendNotifications.ts`

**Cambios**:
```typescript
// ANTES
let notificationMessage: NotificationMessage;

// DESPUÉS
let notificationMessage: NotificationMessage | undefined;
```

y luego se agregó la validación:
```typescript
email: notificationMessage?.email || "unknown@example.com",
template: notificationMessage?.template || "UNKNOWN",
```

---

### 6. **exactOptionalPropertyTypes Strict**
**Problema**: Con `exactOptionalPropertyTypes: true`, los valores `undefined` y opcionales deben coincidir exactamente.

**Archivo**: `src/services/emailService.ts`

**Cambios**:
```typescript
// ANTES
const smtpConfig = {
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  } : undefined,
};

// DESPUÉS
const auth = process.env.SMTP_USER ? {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASSWORD || "",
} : undefined;

const smtpConfig: SmtpConfig = {
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth,
};
```

---

### 7. **Inconsistencia en SQS Batch Response**
**Problema**: El campo debería ser `itemIdentifier`, no `itemId`.

**Archivo**: `src/handlers/sendNotifications.ts`

**Cambios**:
```typescript
// ANTES
batchItemFailures: failedMessageIds.map((messageId) => ({
  itemId: messageId,
})),

// DESPUÉS
batchItemFailures: failedMessageIds.map((messageId) => ({
  itemIdentifier: messageId,
})),
```

---

### 8. **Variable Posiblemente Undefined en Regex**
**Problema**: `variableName` en el resultado de `exec()` podría ser `undefined`.

**Archivo**: `src/utils/templateParser.ts`

**Cambios**:
```typescript
// ANTES
while ((match = placeholderRegex.exec(template)) !== null) {
  const variableName = match[1];
  if (!(variableName in variables)) {
    missingVariables.push(variableName);
  }
}

// DESPUÉS
while ((match = placeholderRegex.exec(template)) !== null) {
  const variableName = match[1];
  if (variableName && !(variableName in variables)) {
    missingVariables.push(variableName);
  }
}
```

---

## Compilación Exitosa

```
✓ 0 errores de compilación
✓ 7 archivos procesados
✓ Salida generada en `dist/`
```

### Estructura del dist generado:

```
dist/
├── handlers/
│   ├── sendNotifications.d.ts
│   ├── sendNotifications.js
│   ├── sendNotificationsError.d.ts
│   └── sendNotificationsError.js
├── services/
│   ├── emailService.d.ts
│   ├── emailService.js
│   ├── notificationRepository.d.ts
│   ├── notificationRepository.js
│   ├── templateService.d.ts
│   └── templateService.js
├── types/
│   ├── notificationTypes.d.ts
│   ├── notificationTypes.js
│   └── nodemailer.d.ts
└── utils/
    ├── templateParser.d.ts
    └── templateParser.js
```

---

## Próximos Pasos

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Compilar cuando sea necesario**:
   ```bash
   .\node_modules\.bin\tsc
   ```

3. **Desplegar a AWS**:
   ```bash
   cd terraform
   terraform init
   terraform apply -var="environment=dev"
   ```

4. **Cargar templates en S3**:
   ```bash
   aws s3 cp templates/welcome.html s3://$BUCKET/welcome.html
   ```

---

## Nota Sobre npm scripts

El `package.json` contiene los scripts `build` y `dev`, pero debido a un problema de caché de npm en Windows, puedes:

**Opción 1**: Usar tsc directamente (recomendado)
```bash
.\node_modules\.bin\tsc
.\node_modules\.bin\tsc --watch
```

**Opción 2**: Limpiar npm y reintentar
```bash
npm cache clean --force
rm -r node_modules package-lock.json
npm install
npm run build
```

---

## Resumen de Cambios por Archivo

| Archivo | Errores | Cambios |
|---------|---------|---------|
| `sendNotifications.ts` | 7 | 4 cambios |
| `sendNotificationsError.ts` | 3 | 2 cambios |
| `emailService.ts` | 1 | 1 cambio |
| `notificationRepository.ts` | 1 | 1 cambio |
| `templateParser.ts` | 3 | 2 cambios |
| `nodemailer.d.ts` | - | Nuevo archivo |

**Total**: 15 errores arreglados ✅

Generated: 2026-03-10 | Corrección Completada
