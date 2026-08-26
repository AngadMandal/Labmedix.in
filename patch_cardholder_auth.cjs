const fs = require('fs');
let code = fs.readFileSync('src/services/cardholderAuthService.ts', 'utf8');

code = code.replace(
  /public static authenticate\([\s\S]*?\)\: \{/,
  `public static authenticate(
    loginIdInput: string,
    passwordInput: string,
    userCaptcha: string,
    expectedCaptcha: string
  ): {`
);

code = code.replace(
  /const cleanCardNo = \(cardNumberInput \|\| ''\)\.trim\(\)\.toUpperCase\(\);[\s\S]*?const expectedCvv = matchedCard\.cvv \|\| \(matchedCard\.verificationCode \? matchedCard\.verificationCode\.slice\(-3\) : '821'\);/g,
  `const cleanLoginId = (loginIdInput || '').trim().toLowerCase();
    const cleanPassword = (passwordInput || '').trim();

    if (userCaptcha.trim() !== expectedCaptcha.trim()) {
      return { success: false, error: 'Incorrect Captcha Calculation. Are you human?' };
    }

    const state = this.getSecurityState();
    if (state.lockoutUntil && state.lockoutUntil > Date.now()) {
      const remainingSeconds = Math.ceil((state.lockoutUntil - Date.now()) / 1000);
      return {
        success: false,
        error: \`Account access suspended. Try again in \${remainingSeconds} seconds.\`,
        isLocked: true,
        remainingSeconds
      };
    }

    // Delay to simulate processing and mitigate timing attacks
    const start = performance.now();
    while (performance.now() - start < 600) { /* Busy wait */ }

    const patients = StorageService.getPatients();
    const patient = patients.find(p => 
      (p.id.toLowerCase() === cleanLoginId || p.email?.toLowerCase() === cleanLoginId || p.mobile === cleanLoginId)
    );

    if (!patient) {
      this.recordFailedAttempt();
      return { success: false, error: 'Invalid Login Credentials. Record not found.' };
    }

    if (!patient.portalPassword) {
      this.recordFailedAttempt();
      return { success: false, error: 'Portal access not configured. Please contact Super Admin.' };
    }

    if (patient.portalPassword !== cleanPassword) {
      this.recordFailedAttempt();
      return { success: false, error: 'Invalid Login Credentials. Incorrect password.' };
    }

    const cards = StorageService.getCards();
    const matchedCard = cards.find(c => c.patientId === patient.id && c.status === 'active');
    
    if (!matchedCard) {
      return { success: false, error: 'No active health card linked to this account.' };
    }

    const expectedCvv = 'HIDDEN';`
);

code = code.replace(
  /if \(cleanCvv !== expectedCvv\) \{[\s\S]*?this\.recordFailedAttempt\(\);[\s\S]*?return \{ success: false, error: 'Invalid CVV Security Code' \};[\s\S]*?\}/g,
  ``
);

code = code.replace(
  /Cardholder \$\{patient\.fullName\} \(\$\{patient\.id\}\) authenticated into Smart Portal using Card \$\{matchedCard\.cardNumber\} \& verified CVV\./g,
  'Cardholder ${patient.fullName} (${patient.id}) authenticated into Smart Portal.'
);

fs.writeFileSync('src/services/cardholderAuthService.ts', code);
console.log('Patched CardholderAuthService');
