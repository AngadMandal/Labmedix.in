const fs = require('fs');
let code = fs.readFileSync('src/components/portal/CardholderAuthModal.tsx', 'utf8');

code = code.replace(/const \[cardNumber, setCardNumber\] = useState\(''\);/, 'const [loginId, setLoginId] = useState(\'\');');
code = code.replace(/const \[cardCvv, setCardCvv\] = useState\(''\);/, 'const [portalPassword, setPortalPassword] = useState(\'\');');

code = code.replace(
  /CardholderAuthService\.authenticate\([\s\S]*?cardNumber,[\s\S]*?cardCvv,[\s\S]*?userCaptcha,[\s\S]*?String\(expected\)[\s\S]*?\)/,
  'CardholderAuthService.authenticate(loginId, portalPassword, userCaptcha, String(expected))'
);

code = code.replace(
  /Enter your <strong>Health Card Number<\/strong> and the <strong>3-Digit CVV Security Code<\/strong> printed on the back magnetic strip of your physical\/digital card\./,
  'Enter your <strong>Email / Mobile / Staff ID</strong> and your <strong>Portal Password</strong> provided by Super Admin.'
);

code = code.replace(/1\. Official Health Card Number:/g, '1. Email / Mobile / Staff ID:');
code = code.replace(/e\.g\. LHC-2026-000001/g, 'e.g. staff@labmedix.com');
code = code.replace(/value=\{cardNumber\}/g, 'value={loginId}');
code = code.replace(/setCardNumber/g, 'setLoginId');

code = code.replace(/2\. 3-Digit Card CVV Security Code:/g, '2. Portal Password:');
code = code.replace(/Found on back strip/g, 'Provided by Super Admin');
code = code.replace(/maxLength=\{4\}/g, '');
code = code.replace(/e\.g\. 821 \(3-digit CVV\)/g, 'Enter password');
code = code.replace(/value=\{cardCvv\}/g, 'value={portalPassword}');
code = code.replace(/setCardCvv/g, 'setPortalPassword');

code = code.replace(/Card Number and CVV/g, 'Credentials');
code = code.replace(/verified CVV/g, 'verified password');
code = code.replace(/Card No \+ CVV/g, 'Credentials');

fs.writeFileSync('src/components/portal/CardholderAuthModal.tsx', code);
console.log('Patched CardholderAuthModal');
