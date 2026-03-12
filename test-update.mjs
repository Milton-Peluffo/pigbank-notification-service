import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const SQS_QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/335014104150/notification-email-sqs";
const AWS_REGION = "us-east-1";

const sqs = new SQSClient({ region: AWS_REGION });

const testUpdateNotification = async () => {
  const message = {
    email: "ghostt.maily@gmail.com",
    template: "USER.UPDATE",
    data: {
      name: "Ghosty",
      lastName: "Maily",
      date: new Date().toISOString(),
    }
  };

  const params = {
    QueueUrl: SQS_QUEUE_URL,
    MessageBody: JSON.stringify(message),
  };

  try {
    const result = await sqs.send(new SendMessageCommand(params));
    console.log("✅ UPDATE notification sent!");
    console.log("Message ID:", result.MessageId);
    console.log("📧 You should receive an update email");
  } catch (error) {
    console.error("❌ Error sending message:", error);
  }
};

testUpdateNotification();
