#!/bin/bash

# Script de deploy completo
# 1. Compila código TypeScript
# 2. Sube templates a S3
# 3. Deploy con Terraform

set -e

echo "Starting deploy"
echo "=================="
echo ""

# 1. Build
echo "Step 1: Compiling code..."
bash scripts/build.sh

if [ $? -ne 0 ]; then
    echo " Build failed"
    exit 1
fi

echo ""
echo "Step 2: Initializing Terraform..."

cd infrastructure/terraform

terraform init

if [ $? -ne 0 ]; then
    echo "Terraform init failed"
    exit 1
fi

echo ""
echo "Step 3: Plan de Terraform..."

terraform plan -out=tfplan

echo ""
echo "Step 4: Applying changes with Terraform..."
echo " This will deploy resources to AWS"
read -p "Do you want to continue? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Deploy canceled"
    exit 1
fi

terraform apply tfplan

if [ $? -ne 0 ]; then
    echo "Terraform apply failed"
    exit 1
fi

cd ../..

echo ""
echo "Step 5: Subiendo templates a S3..."
node scripts/upload-templates.js

if [ $? -ne 0 ]; then
    echo "Some templates were not uploaded, but the deploy continued"
fi

echo ""
echo "DEPLOY COMPLETED SUCCESSFULLY"
echo ""
echo "Next steps:"
echo "1. Verify resources in AWS Console"
echo "2. Configure environment variables in Lambda if necessary"
echo "3. Test by sending messages to the SQS queue"
echo ""
