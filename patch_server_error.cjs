const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /lastError = error\.message \|\| 'Unknown backup error';/,
  `lastError = error.message || 'Unknown backup error';
    if (lastError.includes('Service Accounts do not have storage quota')) {
      lastError = 'Your Google Workspace prevents Service Accounts from storing files. Please use a Shared Drive, or use a personal Gmail account for the Service Account project.';
    }`
);

fs.writeFileSync('server.ts', code);
