#!/usr/bin/env node

/**
 * Script para subir templates HTML a S3
 * Uso: node scripts/upload-templates.js
 */

const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "templates-email-notification";
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

const s3 = new S3Client({ region: AWS_REGION });

async function uploadTemplates() {
  console.log(`📤 Subiendo templates a S3 bucket: ${BUCKET_NAME}`);
  console.log(`📁 Directorio: ${TEMPLATES_DIR}\n`);

  try {
    const files = fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".html"));

    if (files.length === 0) {
      console.warn("⚠️  No se encontraron archivos .html en templates/");
      process.exit(1);
    }

    let uploadedCount = 0;

    for (const file of files) {
      const filePath = path.join(TEMPLATES_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file, // Clave = nombre del archivo
        Body: fileContent,
        ContentType: "text/html; charset=utf-8",
        Metadata: {
          "Upload-Date": new Date().toISOString(),
          "Upload-Script": "pigbank-notification-service",
        },
      });

      try {
        await s3.send(command);
        console.log(`✅ ${file}`);
        uploadedCount++;
      } catch (error) {
        console.error(`❌ Error subiendo ${file}:`, error.message);
      }
    }

    console.log(`\n🎉 ${uploadedCount}/${files.length} templates subidos correctamente\n`);

    if (uploadedCount === files.length) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error("Error fatal:", error.message);
    process.exit(1);
  }
}

uploadTemplates();
