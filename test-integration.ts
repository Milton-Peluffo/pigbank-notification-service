import { IncomingSQSPayload, NotificationTemplate } from '../src/types/events.js';

const testMessages: IncomingSQSPayload[] = [
  {
    email: "juan.perez@example.com",
    template: "WELCOME" as NotificationTemplate,
    data: {
      name: "Juan",
      lastName: "Pérez"
    }
  },
  {
    email: "maria.garcia@example.com", 
    template: "USER.LOGIN" as NotificationTemplate,
    data: {
      name: "María",
      date: "2025-08-27T17:27:00.000Z"
    }
  },
  {
    email: "carlos.lopez@example.com",
    template: "CARD.CREATE" as NotificationTemplate,
    data: {
      name: "Carlos",
      date: "2025-08-27T17:27:00.000Z",
      type: "CREDIT",
      amount: 1000
    }
  },
  {
    email: "ana.martinez@example.com",
    template: "TRANSACTION.PURCHASE" as NotificationTemplate,
    data: {
      name: "Ana",
      date: "2025-08-27T17:27:00.000Z",
      merchant: "Tienda patito feliz",
      cardId: "39fe6315-2dd5-4f2d-9160-22f1c96a05c8",
      amount: 500
    }
  }
];

console.log("🧪 Test de Integración - PigBank Notification Service");
console.log("=" .repeat(60));

testMessages.forEach((message, index) => {
  console.log(`\n📧 Test ${index + 1}: ${message.template}`);
  console.log(`📧 Para: ${message.email}`);
  console.log(`📋 Datos:`, JSON.stringify(message.data, null, 2));
  
  // Validar que las variables requeridas estén presentes
  const requiredVars = getRequiredVariables(message.template);
  const missingVars = requiredVars.filter(varName => !(varName in message.data));
  
  if (missingVars.length > 0) {
    console.log(`❌ Faltan variables: ${missingVars.join(', ')}`);
  } else {
    console.log(`✅ Todas las variables requeridas están presentes`);
  }
});

function getRequiredVariables(template: NotificationTemplate): string[] {
  const variableMap: Record<NotificationTemplate, string[]> = {
    "WELCOME": ["name", "lastName"],
    "USER.LOGIN": ["name", "date"],
    "USER.UPDATE": ["name", "date", "updateType"],
    "CARD.CREATE": ["name", "date", "type", "amount"],
    "CARD.ACTIVATE": ["name", "date", "type", "amount"],
    "TRANSACTION.PURCHASE": ["name", "date", "merchant", "cardId", "amount"],
    "TRANSACTION.SAVE": ["name", "date", "amount"],
    "TRANSACTION.PAID": ["name", "date", "merchant", "amount"],
    "REPORT.ACTIVITY": ["name", "date", "url"]
  };
  
  return variableMap[template] || [];
}

console.log("\n" + "=" .repeat(60));
console.log("✅ Test completado");
