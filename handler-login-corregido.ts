import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken"; 
import { Buffer } from 'node:buffer'; 
import { dynamoDB } from "../../shared/clients/dynamoClient.js";
import { ScanCommand } from "@aws-sdk/lib-dynamodb"; 
import { getSecret } from "../../shared/clients/secretsClient.js";
import { formatResponse } from "../../shared/utils/response.js";
import { sendSQSMessage } from "../../shared/clients/sqsClient.js";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email, password } = JSON.parse(event.body || "{}");

    // 0. Validación de entrada (Evita procesar si faltan datos)
    if (!email || !password) {
      return formatResponse(400, { message: "Email y contraseña son requeridos" });
    }

    // 1. Buscar el usuario en DynamoDB por email
    const result = await dynamoDB.send(new ScanCommand({
      // Usamos la variable de entorno TABLE_NAME definida en Terraform
      TableName: process.env.TABLE_NAME || "pig-bank-user-table",
      FilterExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email }
    }));

    const user = result.Items?.[0];

    if (!user) {
      return formatResponse(401, { message: "Credenciales inválidas" });
    }

    // 2. Comparar contraseñas (Aquí ayuda mucho el aumento de memoria a 256MB)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return formatResponse(401, { message: "Credenciales inválidas" });
    }

    // 3. Obtener el secreto de JWT (Usando la variable de entorno del lambdas.tf)
    const secretName = process.env.JWT_SECRET_NAME
    const jwtSecret = await getSecret(secretName || "pig-bank-jwt-secret");

    // 4. Generar el Token
    const token = jwt.sign(
      { uuid: user.uuid, email: user.email },
      jwtSecret || "default_fallback_secret", 
      { expiresIn: "1h" }
    );

    await sendSQSMessage(process.env.NOTIFICATION_QUEUE_URL!, {
      email: user.email,
      template: "USER.LOGIN",
      data: { 
        name: user.name,
        lastName: user.lastName,
        date: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }), // ✅ CORREGIDO: "date" en lugar de "loginDate"
        device: event.headers['User-Agent'] || "Dispositivo desconocido" 
      }
    });

    return formatResponse(200, {
      message: "Login exitoso",
      token
    });

  } catch (error) {
    console.error("Error en Login:", error);
    return formatResponse(500, { message: "Error interno en el proceso de login" });
  }
};
