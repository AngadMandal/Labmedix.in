const fs = require('fs');
let code = fs.readFileSync('src/services/patientService.ts', 'utf8');

code = code.replace(
  /bloodGroup: string;\n  photoUrl: string;/,
  "bloodGroup: string;\n  photoUrl: string;\n  portalPassword?: string;"
);

code = code.replace(
  /medicalInfo: input\.medicalInfo,\n\s*maritalStatus: input\.maritalStatus,/,
  "medicalInfo: input.medicalInfo,\n      portalPassword: input.portalPassword,\n      maritalStatus: input.maritalStatus,"
);

fs.writeFileSync('src/services/patientService.ts', code);
console.log('Patched patientService input');
