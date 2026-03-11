import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/335014104150/notification-email-sqs";
const AWS_REGION = "us-east-1";

const sqs = new SQSClient({ region: AWS_REGION });

async function testLoginNotification() {
  const message = {
    email: "ghostt.maily@gmail.com",
    template: "USER.LOGIN",
    data: {
      name: "Ghosty",
      lastName: "Maily",
      date: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })
    }
  };

  const params = {
    QueueUrl: SQS_QUEUE_URL,
    MessageBody: JSON.stringify(message),
    MessageAttributes: {
      'template': {
        DataType: 'String',
        StringValue: message.template
      }
    }
  };

  try {
    const command = new SendMessageCommand(params);
    const result = await sqs.send(command);
    
    console.log("✅ Mensaje de LOGIN enviado a SQS!");
    console.log("Message ID:", result.MessageId);
    console.log("📧 Deberías recibir un email de login");
  } catch (error) {
    console.error("❌ Error enviando mensaje:", error);
  }
}

testLoginNotification();
