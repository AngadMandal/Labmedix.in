const fs = require('fs');
let code = fs.readFileSync('src/services/authService.ts', 'utf8');

// Fix the login matcher to support legacy unhashed PINs from local storage
code = code.replace(
  /const isMatch = this\.generateSimulatedHash\(cleanPass\) === correctPinHash;/,
  "const isMatch = this.generateSimulatedHash(cleanPass) === correctPinHash || cleanPass === correctPinHash;"
);

// We should also fix verifySuperAdminPin
code = code.replace(
  /return this\.generateSimulatedHash\(pin\) === correctPinHash;/,
  "return this.generateSimulatedHash(pin) === correctPinHash || pin === correctPinHash;"
);

fs.writeFileSync('src/services/authService.ts', code);
console.log('Fixed backwards compatibility for unhashed PINs');
