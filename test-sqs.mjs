#!/usr/bin/env node

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/335014104150/pig-bank-notification-email-sqs";
const AWS_REGION = "us-east-1";

const sqs = new SQSClient({ region: AWS_REGION });

async function testNotification() {
  const message = {
    email: "ghostt.maily@gmail.com",
    template: "WELCOME",
    data: {
      name: "Juan",
      lastName: "Pérez"
    }
  };

  const command = new SendMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    MessageBody: JSON.stringify(message),
    MessageAttributes: {
      "template": {
        DataType: "String",
        StringValue: "WELCOME"
      }
    }
  });

  try {
    const result = await sqs.send(command);
    console.log("✅ Mensaje enviado a SQS!");
    console.log("Message ID:", result.MessageId);
    console.log("📧 Deberías recibir un email en:", message.email);
  } catch (error) {
    console.error("❌ Error enviando mensaje:", error.message);
  }
}

testNotification();
