# PigBank Notification Service

Microservicio de notificaciones por correo electrónico para PigBank. Escucha cola SQS del microservicio de usuarios, genera notificaciones y envía emails via AWS SES.

## 🏗️ Arquitectura

```
Microservicio Usuarios (Compañero A)
            ↓
        SQS Queue
            ↓
Notification Handler (Lambda)
            ├→ S3 (Templates)
            ├→ SES (Envía emails)
            └→ DynamoDB (Registra resultados)
            ↓
        DLQ (Errores)
            ↓
Error Handler (Lambda)
            ↓
        DynamoDB (Error table)
```

## 📋 Requisitos

- Node.js 20.x
- AWS CLI configurado
- Terraform >= 1.0
- Acceso a AWS (cuenta con permisos para Lambda, SQS, DynamoDB, S3, SES, IAM)

## 🚀 Quick Start

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus valores
```

### 3. Compilar código TypeScript

```bash
npm run build
```

### 4. Deploy de infraestructura

```bash
npm run deploy
# O manualmente:
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

### 5. Subir templates a S3

```bash
npm run upload-templates
```

## 📁 Estructura de Carpetas

```
pigbank-notification-service/
├── src/                           # Código fuente TypeScript
│   ├── handlers/                  # Entry points de Lambdas
│   │   ├── send-notifications.handler.ts
│   │   └── send-notifications-error.handler.ts
│   ├── services/                  # Lógica de negocio
│   │   ├── email.service.ts       # SES client
│   │   ├── template.service.ts    # S3 + caché
│   │   ├── notification.service.ts # DynamoDB
│   │   └── sqs.service.ts         # SQS parsing
│   ├── utils/                     # Utilidades
│   │   ├── logger.ts
│   │   ├── email-validator.ts
│   │   ├── template-renderer.ts
│   │   └── error-handler.ts
│   ├── types/                     # Interfaces TypeScript
│   │   ├── events.ts
│   │   ├── templates.ts
│   │   ├── errors.ts
│   │   └── notifications.ts
│   └── config/                    # Configuración
│       ├── templates.config.ts    # Mapeo de templates
│       └── environment.ts         # Validación de env vars
│
├── templates/                     # Templates HTML para emails
│   ├── welcome.html
│   ├── user-login.html
│   ├── card-create.html
│   ├── card-activate.html
│   ├── transaction-purchase.html
│   ├── transaction-save.html
│   ├── transaction-paid.html
│   └── report-activity.html
│
├── infrastructure/
│   └── terraform/                 # Infraestructura como código
│       ├── main.tf                # Provider y setup
│       ├── variables.tf           # Variables
│       ├── data.tf                # Data sources
│       ├── sqs.tf                 # SQS queues
│       ├── lambda.tf              # Funciones Lambda
│       ├── dynamodb.tf            # DynamoDB tables
│       ├── s3.tf                  # S3 bucket
│       ├── iam.tf                 # Roles y policies
│       └── outputs.tf             # Outputs
│
├── scripts/                       # Scripts de utilidad
│   ├── build.sh                   # Compilar y empaquetar
│   ├── deploy.sh                  # Deploy completo
│   ├── upload-templates.js        # Subir templates a S3
│   └── clean.sh                   # Limpiar outputs
│
├── dist/                          # Código compilado (gitignored)
├── zips/                          # Packages Lambda (gitignored)
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## 🔧 Configuración

### Variables de Entorno

```bash
AWS_REGION=us-east-1
TABLE_NAME=pig-bank-notification-table
ERROR_TABLE_NAME=pig-bank-notification-error-table
S3_BUCKET_NAME=templates-email-notification
SES_FROM_EMAIL=noreply@pigbank.com
NODE_ENV=production
LOG_LEVEL=info
```

### Terraform Variables

Crear `infrastructure/terraform/terraform.tfvars`:

```hcl
aws_region                = "us-east-1"
project_name              = "pig-bank"
environment               = "dev"
ses_from_email            = "noreply@pigbank.com"
lambda_timeout            = 30
lambda_memory             = 512
sqs_batch_size            = 10
log_retention_days        = 14
```

## 📨 Contratos

### Evento de entrada (desde SQS)

**Formato compatible con compañero A:**
```json
{
  "email": "usuario@example.com",
  "template": "WELCOME",
  "data": { 
    "name": "Juan",
    "lastName": "Pérez" 
  }
}
```

**Contrato según enunciado (adaptado):**
```json
{
  "type": "WELCOME",
  "data": {
    "name": "Juan",
    "lastName": "Pérez"
  }
}
```

### Templates soportados

| Template | Variables | Propósito |
|----------|-----------|-----------|
| WELCOME | name, lastName | Bienvenida al registrarse |
| USER.LOGIN | name, date | Notificación de login |
| USER.UPDATE | name, date, updateType | Cambios en perfil |
| CARD.CREATE | name, date, type, amount | Nueva tarjeta creada |
| CARD.ACTIVATE | name, date, type, amount | Tarjeta activada |
| TRANSACTION.PURCHASE | name, date, merchant, cardId, amount | Compra realizada |
| TRANSACTION.SAVE | name, date, amount | Dinero depositado |
| TRANSACTION.PAID | name, date, merchant, amount | Pago de tarjeta |
| REPORT.ACTIVITY | name, date, url | Reporte mensual |

## 🔄 Flujo de Procesamiento

1. **Ingesta**: Evento llega a `notification-email-sqs`
2. **Lambda Principal**:
   - Parsea payload SQS
   - Valida email y template
   - Genera UUID e ISO timestamp internamente
   - Obtiene config del template
   - Obtiene HTML de S3 (con caché)
   - Renderiza con Handlebars
   - Envía con SES
   - Guarda en `notification-table`
   - Retorna batchItemFailures para reintentos
3. **Reintentos**: SQS reintentar automáticamente (máx 3)
4. **DLQ**: Si falla 3 veces, envía a `notification-email-error-sqs`
5. **Lambda de Error**:
   - Procesa mensaje de DLQ
   - Guarda en `notification-error-table`
   - Loguea para alertas

## 📊 CloudWatch Logs

Los logs se almacenan en:
- `/aws/lambda/pig-bank-send-notifications` (Lambda principal)
- `/aws/lambda/pig-bank-send-notifications-error` (Lambda DLQ)

Nivel de logs configurable:
- `debug`: Muy verboso
- `info`: Operaciones normales
- `warn`: Advertencias (errores recuperables)
- `error`: Errores críticos

## 🛠️ Desarrollo Local

### Compilar sin deploy

```bash
npm run build
```

### Ejecutar linter

```bash
npm run lint
```

### Ejecutar tests (cuando estén implementados)

```bash
npm run test
```

### Limpiar outputs

```bash
bash scripts/clean.sh
```

## 🚨 Troubleshooting

### Lambda no recibe mensajes de SQS

1. Verificar que `NOTIFICATION_QUEUE_URL` sea correcto
2. Verificar que la Lambda tenga permisos SQS (`sqs:ReceiveMessage`, etc.)
3. Verificar evento source mapping en Lambda:
   ```bash
   aws lambda list-event-source-mappings --function-name pig-bank-send-notifications
   ```

### Templates no se encuentran en S3

1. Ejecutar: `npm run upload-templates`
2. Verificar bucket existe:
   ```bash
   aws s3 ls s3://pig-bank-templates-email-notification-ACCOUNT_ID
   ```

### Errores de SES (Sandbox)

Por defecto, AWS SES está en modo Sandbox. Para producción:
1. Solicitar salida del Sandbox en AWS Console
2. Verificar dominio (DKIM/SPF)

### DynamoDB throttling

Si usas `PAY_PER_REQUEST` (como en Terraform), no debería haber throttling. Si lo hay:
1. Revisar CloudWatch metrics
2. Aumentar capacidad si es modo provisioned

## 🔐 Seguridad

- ✅ Credenciales en variables de entorno (no hardcodeadas)
- ✅ Validación de emails
- ✅ Timeout en llamadas externas (SES, S3, DynamoDB)
- ✅ Errores loguados pero no expuestos en respuesta
- ✅ Caché de templates para evitar escaneo S3 (DDoS)
- ✅ TTL en DynamoDB para auto-expiración (90 días notificaciones, 30 días errores)

## 📈 Monitoreo

### Métricas clave

- **Lambda Duration**: Tiempo de procesamiento
- **Lambda Errors**: Errores en ejecución
- **Lambda Throttles**: Limites concurrentes
- **SQS ApproximateNumberOfMessagesVisible**: Mensajes pendientes
- **DynamoDB ConsumedWriteCapacityUnits**: Escrituras en DB

### Alarmas recomendadas

```hcl
# En production, agregar alarmas en CloudWatch
# - Lambda error rate > 5%
# - SQS DLQ depth > 10
# - DynamoDB throttles > 0
```

## 🤝 Integración con otros microservicios

### Desde microservicio de usuarios

Tu compañero A debe enviar a la cola `NOTIFICATION_QUEUE_URL`:

```typescript
await sendSQSMessage(process.env.NOTIFICATION_QUEUE_URL!, {
  email: newUser.email,
  template: "WELCOME",
  data: { 
    name: newUser.name,
    lastName: newUser.lastName 
  }
});
```

**Nota**: El nuevo evento debe incluir solo esos campos. El microservicio de notificaciones genera internamente `id`, `createdAt` y `subject`.

## 📚 Links útiles

- [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [AWS SQS](https://docs.aws.amazon.com/sqs/)
- [AWS SES](https://docs.aws.amazon.com/ses/)
- [AWS DynamoDB](https://docs.aws.amazon.com/dynamodb/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [Handlebars.js](https://handlebarsjs.com/)

## 📝 License

ISC

## 👤 Autor

Milton - Sistemas Distribuidos

---

**Última actualización**: 11 de Marzo de 2026
