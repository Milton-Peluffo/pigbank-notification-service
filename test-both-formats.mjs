import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/335014104150/notification-email-sqs";
const AWS_REGION = "us-east-1";

const sqs = new SQSClient({ region: AWS_REGION });

async function testLoginWithDate() {
  const message = {
    email: "ghostt.maily@gmail.com",
    template: "USER.LOGIN",
    data: {
      name: "Ghosty",
      lastName: "Maily",
      date: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }), // ✅ Con "date"
      device: "Test Device"
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
    
    console.log("✅ LOGIN notification sent with 'date'!");
    console.log("Message ID:", result.MessageId);
    console.log("📧 Should work with helper");
  } catch (error) {
    console.error("❌ Error sending message:", error);
  }
}

async function testLoginWithLoginDate() {
  const message = {
    email: "ghostt.maily@gmail.com",
    template: "USER.LOGIN",
    data: {
      name: "Ghosty",
      lastName: "Maily",
      loginDate: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }), // ✅ Con "loginDate"
      device: "Test Device"
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
    
    console.log("✅ LOGIN notification sent with 'loginDate'!");
    console.log("Message ID:", result.MessageId);
    console.log("📧 Should ALSO work with helper");
  } catch (error) {
    console.error("❌ Error sending message:", error);
  }
}

async function runTests() {
  console.log("🧪 Testing with 'date'...");
  await testLoginWithDate();
  
  setTimeout(async () => {
    console.log("\n🧪 Testing with 'loginDate'...");
    await testLoginWithLoginDate();
  }, 2000);
}

runTests();
