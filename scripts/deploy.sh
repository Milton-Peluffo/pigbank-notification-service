#!/bin/bash

# Script de deploy completo
# 1. Compila código TypeScript
# 2. Sube templates a S3
# 3. Deploy con Terraform

set -e

echo "🚀 INICIO DE DEPLOY"
echo "=================="
echo ""

# 1. Build
echo "Step 1: Compilando código..."
bash scripts/build.sh

if [ $? -ne 0 ]; then
    echo "❌ Build falló"
    exit 1
fi

echo ""
echo "Step 2: Inicializando Terraform..."

cd infrastructure/terraform

terraform init

if [ $? -ne 0 ]; then
    echo "❌ Terraform init falló"
    exit 1
fi

echo ""
echo "Step 3: Plan de Terraform..."

terraform plan -out=tfplan

echo ""
echo "Step 4: Aplicando cambios con Terraform..."
echo "⚠️  Esto desplegará los recursos en AWS"
read -p "¿Deseas continuar? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Deploy cancelado"
    exit 1
fi

terraform apply tfplan

if [ $? -ne 0 ]; then
    echo "❌ Terraform apply falló"
    exit 1
fi

cd ../..

echo ""
echo "Step 5: Subiendo templates a S3..."
node scripts/upload-templates.js

if [ $? -ne 0 ]; then
    echo "⚠️  Algunas templates no se subieron, pero el deploy continuó"
fi

echo ""
echo "✅ DEPLOY COMPLETADO EXITOSAMENTE"
echo ""
echo "📊 Próximos pasos:"
echo "1. Verifica los recursos en AWS Console"
echo "2. Configura variables de entorno en Lambda si es necesario"
echo "3. Prueba enviando mensajes a la cola SQS"
echo ""
