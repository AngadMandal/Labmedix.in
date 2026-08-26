const fs = require('fs');
let code = fs.readFileSync('src/pages/portal/PatientPortalPage.tsx', 'utf8');

// Remove showCvvSecret state
code = code.replace(/const \[showCvvSecret, setShowCvvSecret\] = useState\(false\);\n/, '');

// Remove CVV Box from PatientPortalPage
code = code.replace(
  /\{\/\* Cardholder Security Credentials & CVV Box \*\/\}[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/,
  '{/* Cardholder Security Credentials & CVV Box Removed */}'
);

fs.writeFileSync('src/pages/portal/PatientPortalPage.tsx', code);
console.log('Patched PatientPortalPage CVV');
