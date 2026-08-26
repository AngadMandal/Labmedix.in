const fs = require('fs');
let code = fs.readFileSync('src/pages/portal/PatientPortalPage.tsx', 'utf8');

code = code.replace(/setCardNumber/g, 'setLoginId');
code = code.replace(/setCardCvv/g, 'setPortalPassword');

fs.writeFileSync('src/pages/portal/PatientPortalPage.tsx', code);
console.log('Fixed PatientPortalPage vars');
