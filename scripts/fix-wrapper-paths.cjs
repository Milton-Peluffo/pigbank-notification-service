const fs = require('fs');
const path = require('path');

// Corregir las rutas en los archivos wrapper
const fixWrapperPaths = () => {
  const deploymentDir = path.join(__dirname, '..', 'lambda-deployment');
  
  // Corregir send-notifications.js
  const sendNotificationsPath = path.join(deploymentDir, 'send-notifications.js');
  if (fs.existsSync(sendNotificationsPath)) {
    let content = fs.readFileSync(sendNotificationsPath, 'utf8');
    content = content.replace(
      "require('./send-notifications.handler.js')",
      "require('./handlers/send-notifications.handler.js')"
    );
    fs.writeFileSync(sendNotificationsPath, content);
    console.log('SUCCESS send-notifications.js corrected');
  }

  // Corregir send-notifications-error.js
  const sendNotificationsErrorPath = path.join(deploymentDir, 'send-notifications-error.js');
  if (fs.existsSync(sendNotificationsErrorPath)) {
    let content = fs.readFileSync(sendNotificationsErrorPath, 'utf8');
    content = content.replace(
      "require('./send-notifications-error.handler.js')",
      "require('./handlers/send-notifications-error.handler.js')"
    );
    fs.writeFileSync(sendNotificationsErrorPath, content);
    console.log('SUCCESS send-notifications-error.js corrected');
  }

  console.log('SUCCESS All wrappers corrected');
};

fixWrapperPaths();
