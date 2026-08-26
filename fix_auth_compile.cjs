const fs = require('fs');
let code = fs.readFileSync('src/services/authService.ts', 'utf8');

code = code.replace(/const isMatch = cleanPass === correctPin;/, "const isMatch = this.generateSimulatedHash(cleanPass) === correctPinHash;");

code = code.replace(
  /if \(masterToken\.trim\(\) !== MASTER_ROOT_OVERRIDE_TOKEN\) \{/,
  `if (this.generateSimulatedHash(masterToken.trim()) !== "-2051614742") {`
);

fs.writeFileSync('src/services/authService.ts', code);
console.log('Fixed auth compile errors');
