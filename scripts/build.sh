#!/bin/bash

# Script de build y compilación TypeScript
# Genera archivos .js en ./dist

set -e  # Exit on error

echo "🔨 Iniciando build..."
echo ""

# 1. Compilar TypeScript
echo "📦 Compilando TypeScript..."
npx tsc

if [ $? -eq 0 ]; then
    echo "✅ Compilación exitosa"
else
    echo "❌ Error en compilación"
    exit 1
fi

echo ""
echo "✅ Build completado"
echo ""
echo "📁 Archivos compilados en ./dist"
echo ""

# 2. Crear estructura para Lambdas en ./dist
# Cada handler necesita sus propios archivos
echo "🔧 Creando estructura para Lambdas..."

# Crear carpetas para cada handler
mkdir -p dist/send-notifications
mkdir -p dist/send-notifications-error

# Copiar handler compilado y todas las dependencias
cp dist/handlers/send-notifications.handler.js dist/send-notifications/
cp dist/handlers/send-notifications-error.handler.js dist/send-notifications-error/

# Copiar node_modules (necesario para Lambda)
cp -r node_modules dist/send-notifications/ 2>/dev/null || true
cp -r node_modules dist/send-notifications-error/ 2>/dev/null || true

# Copiar package.json (referencia)
cp package.json dist/send-notifications/
cp package.json dist/send-notifications-error/

echo "✅ Estructura de Lambdas creada"
echo ""

# 3. Crear carpeta para zips si no existe
mkdir -p zips

echo "✅ Todo listo para deploy"
