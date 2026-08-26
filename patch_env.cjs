const fs = require('fs');
let code = fs.readFileSync('.env.example', 'utf8');

code += `
# SERVER-SIDE GOOGLE DRIVE AUTOMATIC LIVE BACKUP
# (Set these to a Service Account JSON string and a Folder ID for production)
GOOGLE_DRIVE_BACKUP_SERVICE_ACCOUNT_JSON=
GOOGLE_DRIVE_BACKUP_FOLDER_ID=
`;

fs.writeFileSync('.env.example', code);
console.log('Updated .env.example');
