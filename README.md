# PigBank Notification Service

Un microservicio sin servidores de notificaciones por correo electrónico para el sistema bancario distribuido **PigBank**, construido con **AWS Lambda**, **SQS**, **S3**, y **DynamoDB**.

## 📋 Descripción

Este servicio es responsable de procesar mensajes de notificación desde una cola SQS, obtener plantillas HTML de S3, reemplazar variables dinámicas y enviar correos electrónicos. Incluye manejo robusto de errores con Dead Letter Queue (DLQ) y registro de todas las operaciones en DynamoDB.

### Flujo de Procesamiento

```
User Service (SQS) 
    ↓
[SQS Queue] → [Lambda Handler] → [S3 Templates]
                     ↓                    ↓
              [Template Parser] ← [HTML Template]
                     ↓
              [Email Service]
                     ↓
              [SMTP Server / SES]
                     ↓
          [DynamoDB: Success/Error Logs]
                     ↓ (Si hay error)
              [DLQ / Error Handler]
```

## 🏗️ Estructura del Proyecto

```
pigbank-notification-service/
├── src/
│   ├── handlers/
│   │   ├── sendNotifications.ts       # Lambda handler principal
│   │   └── sendNotificationsError.ts  # Handler para DLQ
│   ├── services/
│   │   ├── emailService.ts            # Lógica de envío de emails
│   │   ├── templateService.ts         # Descarga templates de S3
│   │   └── notificationRepository.ts  # Almacenamiento en DynamoDB
│   ├── utils/
│   │   └── templateParser.ts          # Reemplazo de variables en templates
│   └── types/
│       └── notificationTypes.ts       # Tipos TypeScript compartidos
├── templates/
│   └── welcome.html                   # Plantilla de ejemplo (Welcome)
├── terraform/
│   ├── main.tf                        # Configuración principal
│   ├── lambda.tf                      # Funciones Lambda
│   ├── sqs.tf                         # Colas SQS
│   ├── dynamodb.tf                    # Tablas DynamoDB
│   ├── s3.tf                          # Bucket S3
│   └── modules/                       # Módulos Terraform reutilizables
│       ├── sqs/
│       ├── dynamodb/
│       ├── s3/
│       └── lambda/
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Características

### Core Functionality
- ✅ **Procesamiento de Batch SQS**: Maneja múltiples mensajes en un solo invocación
- ✅ **Templates Dinámicos**: Carga plantillas de S3 con formato HTML
- ✅ **Reemplazo de Variables**: Soporta placeholders como `{{name}}`, `{{lastName}}`
- ✅ **Envío de Emails**: Integración con SMTP/SES
- ✅ **Logging Distribuido**: Registro de éxitos y errores en DynamoDB
- ✅ **Dead Letter Queue**: Manejo automático de mensajes con fallos
- ✅ **Type-Safe**: Completamente tipado con TypeScript

### Notificaciones Soportadas
- 🎉 **WELCOME**: Email de bienvenida para nuevos usuarios

## 💻 Tecnologías

- **Runtime**: Node.js 18.x
- **Lenguaje**: TypeScript 5.x
- **AWS SDK**: v3
- **Email**: nodemailer 6.x
- **Utils**: uuid 9.x
- **IaC**: Terraform 1.x

## 📦 Dependencias

### Production
```json
{
  "@aws-sdk/client-dynamodb": "^3.500.0",
  "@aws-sdk/client-s3": "^3.500.0",
  "@aws-sdk/lib-dynamodb": "^3.500.0",
  "nodemailer": "^6.9.7",
  "uuid": "^9.0.1"
}
```

### Development
```json
{
  "@types/aws-lambda": "^8.10.130",
  "@types/node": "^20.10.5",
  "@types/nodemailer": "^6.4.14",
  "@types/uuid": "^9.0.7",
  "typescript": "^5.3.3"
}
```

## 🔧 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd pigbank-notification-service
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Compilar TypeScript

```bash
npm run build
```

### 4. Configurar Variables de Ambiente

Crear archivo `.env.local`:

```bash
# AWS Configuration
AWS_REGION=us-east-1
NOTIFICATION_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/pigbank-notification-email-sqs
TEMPLATES_BUCKET_NAME=pigbank-templates-email-notification-123456789
NOTIFICATION_TABLE_NAME=pigbank-notification-table
NOTIFICATION_ERROR_TABLE_NAME=pigbank-notification-error-table

# SMTP Configuration
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=noreply@pigbank.com
```

## 📨 Formato de Mensaje SQS

El servicio espera mensajes con la siguiente estructura:

```json
{
  "email": "jane@doe.com",
  "template": "WELCOME",
  "data": {
    "name": "Jane",
    "lastName": "Doe"
  }
}
```

### Campos Requeridos

- **email** (string): Dirección de correo válida
- **template** (string): Nombre del template (ej: "WELCOME")
- **data** (object): Variables dinámicas para reemplazar en el template

## 🌥️ Despliegue con Terraform

### 1. Compilar el Código

```bash
npm run build
```

### 2. Inicializar Terraform

```bash
cd terraform
terraform init
```

### 3. Planificar Despliegue

```bash
# Para desarrollo
terraform plan -var="environment=dev"

# Para producción
terraform plan -var="environment=prod"
```

### 4. Aplicar Configuración

```bash
terraform apply -var="environment=dev"
```

### 5. Verificar Despliegue

```bash
# Obtener outputs
terraform output

# Verificar funciones Lambda
aws lambda list-functions --region us-east-1

# Verificar colas SQS
aws sqs list-queues --region us-east-1

# Verificar tablas DynamoDB
aws dynamodb list-tables --region us-east-1
```

## 📤 Cargar Plantillas en S3

```bash
# Obtener nombre del bucket
BUCKET=$(terraform output -raw templates_bucket_name)

# Cargar template de bienvenida
aws s3 cp templates/welcome.html s3://$BUCKET/welcome.html
```

## 🧪 Testing

### Test Local del Parser

```bash
npm run build
node -e "
const { TemplateParser } = require('./dist/utils/templateParser');
const html = 'Hello {{name}} {{lastName}}';
const result = TemplateParser.parse(html, { name: 'John', lastName: 'Doe' });
console.log(result);
"
```

### Test de Variables

```bash
node -e "
const { TemplateParser } = require('./dist/utils/templateParser');
const html = 'Hello {{name}}, your email is {{email}}';
const missing = TemplateParser.validateVariables(html, { name: 'John' });
console.log('Missing variables:', missing); // ['email']
"
```

### Test de Email Service

```bash
npm run build
node -e "
const { EmailService } = require('./dist/services/emailService');
const service = new EmailService();
service.verifyConnection().then(ok => console.log('SMTP OK:', ok));
"
```

## 📊 Infraestructura AWS

### SQS Queues
- **notification-email-sqs**: Cola principal de notificaciones
  - Retención: 14 días
  - Visibility Timeout: 5 minutos
  - Max Receive Count: 3 (antes de DLQ)

- **notification-email-dlq**: Dead Letter Queue
  - Retención: 14 días

### DynamoDB Tables

**notification-table** (Éxitos)
- Partition Key: `notificationId` (UUID)
- Sort Key: `createdAt` (ISO timestamp)
- GSI: `email-createdAt-index` para búsquedas por email
- TTL: 30 días

**notification-error-table** (Errores)
- Misma estructura que notification-table
- Registra solo fallos con mensaje de error

### S3 Bucket
- **pigbank-templates-email-notification-{account-id}**
  - Versionado: Habilitado
  - Encriptación: AES256
  - Lifecycle: Elimina versiones antiguas después de 30 días
  - Public Access: Bloqueado

### Lambda Functions

**pigbank-notification-handler** (Principal)
- Runtime: Node.js 18.x
- Memory: 512 MB
- Timeout: 60 segundos
- Trigger: SQS (Batch size: 10)
- Max Concurrency: 10

**pigbank-notification-error-handler** (DLQ)
- Runtime: Node.js 18.x
- Memory: 256 MB
- Timeout: 60 segundos
- Trigger: SQS DLQ

## 🔒 Seguridad

### IAM Permissions
Las funciones Lambda tienen permisos mínimos necesarios para:
- Leer mensajes de SQS
- Descargar objetos de S3
- Escribir en DynamoDB
- Enviar logs a CloudWatch

### Encriptación
- S3: AES256
- DynamoDB: Encriptación por defecto
- SQS: Encriptación en tránsito

### Validaciones
- Emails validados con regex
- Templates validados antes de procesar
- Variables obligatorias verificadas

## 📝 Logging

Todos los logs se escriben en **CloudWatch** bajo `/aws/lambda/pigbank-notification-handler`

### Ejemplo de Logs

```json
{
  "timestamp": "2026-03-10T15:30:45.123Z",
  "level": "INFO",
  "message": "Procesando notificación WELCOME para jane@doe.com",
  "notificationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## 🐛 Troubleshooting

### El Lambda no procesa mensajes

1. Verificar que la cola SQS existe y tiene mensajes
2. Revisar los logs en CloudWatch
3. Verificar IAM permissions

```bash
aws lambda invoke --function-name pigbank-notification-handler \
  --payload '{"Records":[]}' \
  response.json
cat response.json
```

### Errores de Template no encontrado

```bash
# Verificar que el template existe en S3
aws s3 ls s3://pigbank-templates-email-notification-123456/

# Cargar template faltante
aws s3 cp templates/welcome.html s3://pigbank-templates-email-notification-123456/welcome.html
```

### Errores de conexión SMTP

1. Verificar variables de ambiente SMTP_*
2. Activar SES si se usa AWS SES
3. Verificar credenciales en Secrets Manager

```bash
aws secretsmanager get-secret-value --secret-id pigbank-smtp-credentials
```

## 🌐 Métricas y Monitoreo

### CloudWatch Metrics
- `Invocations`: Número de invocaciones Lambda
- `Duration`: Tiempo de ejecución promedio
- `Errors`: Número de intentos fallidos
- `Throttles`: Invocaciones canceladas por límite

### DynamoDB Metrics
- `ConsumedWriteCapacityUnits`: Capacidad de escritura utilizada
- `ConsumedReadCapacityUnits`: Capacidad de lectura utilizada
- `UserErrors`: Errores de validación

### SQS Metrics
- `ApproximateNumberOfMessagesVisible`: Mensajes pendientes
- `ApproximateAgeOfOldestMessage`: Edad del mensaje más antiguo

## 🔄 CI/CD Integration

### GitHub Actions (Ejemplo)

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: hashicorp/setup-terraform@v2
      - run: terraform init
      - run: terraform apply -auto-approve
```

## 📚 API Reference

### TemplateParser

```typescript
class TemplateParser {
  static parse(template: string, variables: TemplateVariables): string
  static validateVariables(template: string, variables: TemplateVariables): string[]
}
```

### EmailService

```typescript
class EmailService {
  sendEmail(to: string, subject: string, html: string, from?: string): Promise<void>
  verifyConnection(): Promise<boolean>
  static validateEmail(email: string): boolean
}
```

### TemplateService

```typescript
class TemplateService {
  getTemplate(templateName: string): Promise<string>
  clearCache(templateName?: string): void
  templateExists(templateName: string): Promise<boolean>
}
```

### NotificationRepository

```typescript
class NotificationRepository {
  saveSuccessLog(log: NotificationLog): Promise<void>
  saveErrorLog(log: NotificationLog): Promise<void>
}
```

## 🤝 Contribuir

1. Crear rama feature: `git checkout -b feature/AmazingFeature`
2. Commit cambios: `git commit -m 'Add AmazingFeature'`
3. Push a rama: `git push origin feature/AmazingFeature`
4. Abrir Pull Request

## 📄 Licencia

ISC

## 📞 Contacto

Para preguntas o problemas, contactar al equipo de backend en `backend@pigbank.com`

## 🎯 Roadmap

- [ ] Soporte para más tipos de notificaciones (PASSWORD_RESET, CONFIRMATION)
- [ ] Sistema de templates dinámicos con versionado
- [ ] Integración con SendGrid/Mailgun
- [ ] Rate limiting y throttling
- [ ] Batch send optimization
- [ ] Analytics y reporting dashboard
- [ ] Webhooks para notificaciones de estado
- [ ] A/B testing framework
