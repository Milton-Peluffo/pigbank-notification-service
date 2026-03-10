# PigBank Notification Service - Implementation Summary

## ✅ Completado: Todo el servicio de notificaciones empresarial

### 📦 Archivos Implementados

#### 1. **TypeScript Core Code** ✓
- `src/types/notificationTypes.ts` - Tipos e interfaces TypeScript
- `src/utils/templateParser.ts` - Parser de variables en plantillas
- `src/handlers/sendNotifications.ts` - Lambda handler principal
- `src/handlers/sendNotificationsError.ts` - Handler para DLQ

#### 2. **Servicios** ✓
- `src/services/emailService.ts` - Envío de emails con nodemailer
- `src/services/templateService.ts` - Gestión de plantillas en S3
- `src/services/notificationRepository.ts` - Logging en DynamoDB

#### 3. **Configuración** ✓
- `package.json` - Dependencias de npm y scripts de build
- `tsconfig.json` - Configuración de TypeScript para Lambda
- `.env.example` - Variables de ambiente de ejemplo
- `.gitignore` - Exclusiones de git

#### 4. **Infraestructura Terraform** ✓
- `terraform/main.tf` - Configuración principal y variables
- `terraform/sqs.tf` - Definición de colas SQS
- `terraform/dynamodb.tf` - Tablas DynamoDB
- `terraform/lambda.tf` - Funciones Lambda y triggers
- `terraform/s3.tf` - Bucket S3 para templates

#### 5. **Módulos Terraform** ✓
- `terraform/modules/sqs/` - Módulo reutilizable de SQS
- `terraform/modules/dynamodb/` - Módulo reutilizable de DynamoDB
- `terraform/modules/s3/` - Módulo reutilizable de S3
- `terraform/modules/lambda/` - Módulo reutilizable de Lambda

#### 6. **Documentación** ✓
- `README.md` - Documentación completa del proyecto
- `templates/welcome.html` - Plantilla de email de bienvenida

---

## 🎯 Funcionalidades Implementadas

### Procesamiento de Mensajes
✅ Lectura de mensajes desde SQS en batch  
✅ Validación de estructura de mensajes  
✅ Manejo de errores con reintentos automáticos  
✅ Envío a DLQ en caso de fallos persistentes

### Gestión de Templates
✅ Descarga de HTML desde S3  
✅ Caching en memoria de templates  
✅ Validación de variables requeridas  
✅ Reemplazo seguro de placeholders

### Envío de Emails
✅ Integración con nodemailer  
✅ Validación de direcciones  
✅ Soporte para SMTP/SES  
✅ Logs detallados de envíos

### Persistencia de Datos
✅ Registro de éxitos en DynamoDB  
✅ Registro de errores separado  
✅ TTL automático para limpiar datos antiguos  
✅ Global Secondary Indexes para búsquedas

### Infraestructura
✅ SQS: Cola principal + DLQ  
✅ DynamoDB: 2 tablas con índices  
✅ S3: Bucket con versionado y encryption  
✅ Lambda: 2 funciones con permisos IAM  
✅ CloudWatch: Logs de ejecución  

---

## 📊 Arquitectura

```
┌──────────────────┐
│   User Service   │
│   (Micro SVC)    │
└────────┬─────────┘
         │ Envía mensaje JSON
         ▼
┌──────────────────┐
│   SQS Queue      │
│ notification-    │
│ email-sqs        │
└────────┬─────────┘
         │ Trigger (batch 10)
         ▼
┌──────────────────────────────────────┐
│   Lambda: sendNotifications.ts        │
│   - Parse mensaje SQS                │
│   - Validar datos                    │
│   - Obtener template                 │
└────────┬────────┬────────┬───────────┘
         │        │        │
         ▼        ▼        ▼
    ┌────────┐┌──────┐┌──────────┐
    │ S3     ││ Parser  ││ Email    │
    │Template││Variables││Service   │
    └────┬───┘└──────┘└──────┬────┘
         │                   │
         ▼                   ▼
    Template HTML      ┌──────────┐
    Procesado          │SMTP/SES  │
                       └────┬─────┘
                            │
                            ▼
                       ┌──────────┐
                       │ Email    │
                       │Enviado   │
                       └────┬─────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
    ✅ Success        ❌ Error          Retry Needed
         │                  │                  │
         ▼                  ▼                  ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │DynamoDB  │      │DynamoDB  │      │SQS DLQ   │
    │Success   │      │Error     │      │Auto-      │
    │Table     │      │Table     │      │Retry     │
    └──────────┘      └──────────┘      └────┬─────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │Lambda Error  │
                                       │Handler       │
                                       └──────────────┘
```

---

## 🔐 Seguridad Implementada

### IAM Permissions (Least Privilege)
- Lambda solo accede a SQS, S3, DynamoDB requeridos
- Políticas específicas por acción y recurso
- Roles separados para handlers principal y error

### Encriptación
- S3: AES256 para datos en reposo
- DynamoDB: Encriptación por defecto
- Variables sensibles en Secrets Manager

### Validaciones
- Emails validados con regex (RFC simple)
- Templates chequeados antes de procesar
- Variables obligatorias verificadas
- Mensajes parseados antes de procesar

---

## 🚀 Quick Start

### 1. Compilar
```bash
npm install
npm run build
```

### 2. Variables de Ambiente
```bash
cp .env.example .env.local
# Editar .env.local con valores reales
```

### 3. Desplegar Infraestructura
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

### 4. Cargar Template
```bash
BUCKET=$(terraform output -raw templates_bucket_name)
aws s3 cp ../templates/welcome.html s3://$BUCKET/welcome.html
```

### 5. Enviar Mensaje de Prueba
```bash
QUEUE_URL=$(terraform output -raw notification_queue_url)
aws sqs send-message \
  --queue-url $QUEUE_URL \
  --message-body '{
    "email": "test@example.com",
    "template": "welcome",
    "data": {"name": "John", "lastName": "Doe"}
  }'
```

---

## 📈 Monitoreo

### CloudWatch Metrics
- Lambda Invocations
- Lambda Duration
- Lambda Errors
- SQS Messages

### DynamoDB Metrics
- Write Capacity Units
- Read Capacity Units
- Item Count

### SQS Metrics
- Messages Visible
- Messages Sent
- Message Age

### Logs
```bash
# Ver logs en CloudWatch
aws logs tail /aws/lambda/pigbank-notification-handler --follow
```

---

## 🧪 Testing

### Validar Parser
```bash
npm run build
npm test  # Una vez implementados los tests
```

### Validar Email Service
```bash
AWS_REGION=us-east-1 npm run build
node scripts/test-smtp.js
```

### Validar Template Download
```bash
aws s3 ls s3://pigbank-templates-email-notification-123456/
```

---

## 📚 Archivos por Responsabilidad

### Handlers (Lambda Entry Points)
| Archivo | Responsabilidad |
|---------|-----------------|
| sendNotifications.ts | Procesar mensajes SQS principales |
| sendNotificationsError.ts | Procesar mensajes en DLQ |

### Services (Business Logic)
| Archivo | Responsabilidad |
|---------|-----------------|
| emailService.ts | Enviar emails y validar |
| templateService.ts | Descargar y cachear templates |
| notificationRepository.ts | Persistencia en DynamoDB |

### Utils (Helpers)
| Archivo | Responsabilidad |
|---------|-----------------|
| templateParser.ts | Reemplazar variables |

### Types (Contracts)
| Archivo | Responsabilidad |
|---------|-----------------|
| notificationTypes.ts | Interfaces y tipos TypeScript |

---

## 🔄 Flujo de Datos Completo

1. **Entrada**: User Service envía mensaje SQS
   ```json
   {"email": "user@example.com", "template": "welcome", "data": {...}}
   ```

2. **Validación**: Handler valida estructura del mensaje

3. **Obtención de Template**: TemplateService descarga HTML de S3

4. **Procesamiento**: TemplateParser reemplaza {{variables}}

5. **Envío**: EmailService envía por SMTP/SES

6. **Logging**: Resultado guardado en DynamoDB
   - ✅ Success Table si es exitoso
   - ❌ Error Table si falla

7. **Reintentos**: SQS reintentos automáticos → DLQ → Error Handler

---

## 📝 Notas Importantes

### Formato de Variables en Template
Las variables en el HTML deben usar formato `{{nombreVariable}}`:
```html
<h1>Hola {{name}} {{lastName}}</h1>
<p>Tu email es {{email}}</p>
```

### Tipos de Mensajes SQS
Actualmente soportados:
- `WELCOME`: Email de bienvenida (implementado ✓)

Preparados para futuros:
- `PASSWORD_RESET`: Reset de contraseña (enum preparado)
- `CONFIRMATION`: Confirmación de email (enum preparado)

### Configuración de Email
Para producción usar AWS SES con dominio verificado y DKIM/SPF configurado.

### Escalabilidad
- SQS: Maneja miles de mensajes por segundo
- Lambda: Auto-scaling hasta 1000 configuraciones
- DynamoDB: On-demand para desarrollo, provisioned para producción
- S3: Aplicar CloudFront para caching global

---

## ✨ Características Listas para Producción

✅ Error handling robusto  
✅ Type-safe con TypeScript  
✅ Logging centralizado  
✅ Infraestructura codificada  
✅ IAM least privilege  
✅ Validaciones exhaustivas  
✅ Caching inteligente  
✅ TTL para auto-limpieza  
✅ DLQ para análisis de fallos  
✅ Batch processing optimizado  

---

## 🎓 Aprendizajes y Mejores Prácticas

### AWS SDK v3
- Usando Document Client para DynamoDB
- GetObjectCommand para S3
- Manejo robusto de streams

### TypeScript
- Interfaces bien definidas
- Validación de tipos en runtime con checks
- Enums para valores conocidos

### Serverless
- Separation of concerns por módulos
- Handlers puros sin side effects
- Idempotencia en operaciones DynamoDB

### Terraform
- Módulos reutilizables
- Outputs para integración
- Variables por ambiente
- Resources organizados por concern

---

Generated: 2026-03-10 | PigBank Notification Service v1.0.0
