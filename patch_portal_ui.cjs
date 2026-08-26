const fs = require('fs');
let code = fs.readFileSync('src/pages/portal/PatientPortalPage.tsx', 'utf8');

code = code.replace(/const \[cardNumber, setCardNumber\] = useState\(''\);/, 'const [loginId, setLoginId] = useState(\'\');');
code = code.replace(/const \[cardCvv, setCardCvv\] = useState\(''\);/, 'const [portalPassword, setPortalPassword] = useState(\'\');');

code = code.replace(
  /CardholderAuthService\.authenticate\([\s\S]*?cardNumber,[\s\S]*?cardCvv,[\s\S]*?userCaptcha,[\s\S]*?String\(expected\)[\s\S]*?\)/,
  'CardholderAuthService.authenticate(loginId, portalPassword, userCaptcha, String(expected))'
);

code = code.replace(
  /Official Cardholder Access: Enter your <strong style=\{\{color:'#fff'\}\}>Health Card Number<\/strong> and the <strong style=\{\{color:'#fff'\}\}>3-Digit CVV Security Code<\/strong> printed on the back magnetic signature strip\./,
  'Official Access: Enter your <strong style={{color:"#fff"}}>Email / Mobile / Staff ID</strong> and your <strong style={{color:"#fff"}}>Portal Password</strong> provided by Super Admin.'
);

code = code.replace(/1\. Official Health Card Number:/g, '1. Email / Mobile / Staff ID:');
code = code.replace(/e\.g\. LHC-2026-000001/g, 'e.g. staff@labmedix.com');
code = code.replace(/value=\{cardNumber\}/g, 'value={loginId}');
code = code.replace(/handleCardNumberChange\(e\.target\.value\)/g, 'setLoginId(e.target.value)');

code = code.replace(/2\. 3-Digit Card CVV Security Code:/g, '2. Portal Password:');
code = code.replace(/Found on back strip/g, 'Provided by Super Admin');
code = code.replace(/maxLength=\{4\}/g, '');
code = code.replace(/e\.g\. 821 \(3-digit CVV\)/g, 'Enter password');
code = code.replace(/value=\{cardCvv\}/g, 'value={portalPassword}');
code = code.replace(/setCardCvv\(e\.target\.value\)/g, 'setPortalPassword(e.target.value)');

fs.writeFileSync('src/pages/portal/PatientPortalPage.tsx', code);
console.log('Patched PatientPortalPage UI');
