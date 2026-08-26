const fs = require('fs');

let login = fs.readFileSync('src/pages/auth/LoginPage.tsx', 'utf8');
login = login.replace(/u => u\.phone/g, "(u: any) => u.phone");
login = login.replace(/u => u\.email/g, "(u: any) => u.email");
fs.writeFileSync('src/pages/auth/LoginPage.tsx', login);

console.log('Fixed implicit any');
