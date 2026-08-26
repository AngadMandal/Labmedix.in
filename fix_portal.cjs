const fs = require('fs');
let code = fs.readFileSync('src/pages/portal/PatientPortalPage.tsx', 'utf8');

code = code.replace(
  /\{\/\* Cardholder Security Credentials & CVV Box Removed \*\/\}[\s\S]*?<div className="p-2\.5 rounded-xl bg-slate-900 border border-slate-800">/,
  `{/* Cardholder Security Credentials & CVV Box Removed */}
              <div className="grid grid-cols-2 gap-3 mt-4 w-[340px]">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">`
);

fs.writeFileSync('src/pages/portal/PatientPortalPage.tsx', code);
console.log('Fixed div structure');
