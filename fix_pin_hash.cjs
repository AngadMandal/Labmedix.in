const fs = require('fs');

// Simple mocked hash function for simulation
const generateHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

const defaultPinHash = generateHash('1234'); // "1509442"

let authService = fs.readFileSync('src/services/authService.ts', 'utf8');

authService = authService.replace(/const correctPin = user\.pinCode \|\| '1234';/g, "const correctPinHash = user.pinCode || '" + defaultPinHash + "';");
authService = authService.replace(/if \(!u\.pinCode\) u\.pinCode = '1234';/g, "if (!u.pinCode) u.pinCode = '" + defaultPinHash + "';");
authService = authService.replace(/pinCode: '1234',/g, "pinCode: '" + defaultPinHash + "',");
authService = authService.replace(/return pin === correctPin \|\| pin === '1234';/g, "return this.generateSimulatedHash(pin) === correctPinHash;");
authService = authService.replace(/if \(cleanPass !== correctPin && cleanPass !== '1234'\) \{/g, "if (this.generateSimulatedHash(cleanPass) !== correctPinHash) {");

authService = authService.replace(
  /export class AuthService \{/,
  "export class AuthService {\n  private static generateSimulatedHash(str: string): string {\n    let hash = 0;\n    for (let i = 0; i < str.length; i++) {\n      const char = str.charCodeAt(i);\n      hash = ((hash << 5) - hash) + char;\n      hash = hash & hash;\n    }\n    return hash.toString();\n  }\n"
);

fs.writeFileSync('src/services/authService.ts', authService);
console.log('Fixed authService to use hashes');

let storageService = fs.readFileSync('src/services/storage.ts', 'utf8');
storageService = storageService.replace(/pinCode: '1234'/g, "pinCode: '" + defaultPinHash + "'");
fs.writeFileSync('src/services/storage.ts', storageService);
console.log('Fixed storage.ts default pins to use hashes');

