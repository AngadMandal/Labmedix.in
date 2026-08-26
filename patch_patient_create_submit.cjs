const fs = require('fs');
let code = fs.readFileSync('src/pages/patients/PatientCreatePage.tsx', 'utf8');

code = code.replace(
  /governmentIdNumber,/,
  "governmentIdNumber,\n        portalPassword,"
);

fs.writeFileSync('src/pages/patients/PatientCreatePage.tsx', code);
console.log('Patched PatientCreatePage.tsx');
