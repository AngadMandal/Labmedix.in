const fs = require('fs');
let code = fs.readFileSync('src/services/authService.ts', 'utf8');

code = code.replace(
  /const code = Math\.floor\(100000 \+ Math\.random\(\) \* 900000\)\.toString\(\);/,
  "const code = '123456'; // Static for preview environment\n    console.log('🔒 Security Notice: In this preview environment, the MFA Code is statically set to: ' + code);"
);

fs.writeFileSync('src/services/authService.ts', code);
console.log('Fixed MFA code for preview');
