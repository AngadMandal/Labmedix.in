const fs = require('fs');
let code = fs.readFileSync('src/services/cardholderAuthService.ts', 'utf8');

const replacement = `
  public static authenticate(
    loginIdInput: string,
    passwordInput: string,
    userCaptcha: string,
    expectedCaptcha: string
  ): {
    success: boolean;
    error?: string;
    patient?: Patient;
    card?: HealthCard;
    membership?: Membership;
    isLocked?: boolean;
    remainingSeconds?: number;
  } {
    const cleanLoginId = (loginIdInput || '').trim().toLowerCase();
    const cleanPassword = (passwordInput || '').trim();

    if (userCaptcha.trim() !== expectedCaptcha.trim()) {
      return { success: false, error: 'Incorrect Captcha Calculation. Are you human?' };
    }

    const state = this.isCardLocked(cleanLoginId);
    if (state.locked && state.remainingSeconds > 0) {
      return {
        success: false,
        error: \`Account access suspended. Try again in \${state.remainingSeconds} seconds.\`,
        isLocked: true,
        remainingSeconds: state.remainingSeconds
      };
    }

    const start = performance.now();
    while (performance.now() - start < 600) { /* Busy wait */ }

    const patients = StorageService.getPatients();
    const patient = patients.find(p => 
      (p.id.toLowerCase() === cleanLoginId || p.email?.toLowerCase() === cleanLoginId || p.mobile === cleanLoginId)
    );

    if (!patient) {
      this.recordFailedAttempt(cleanLoginId);
      return { success: false, error: 'Invalid Login Credentials. Record not found.' };
    }

    if (!patient.portalPassword) {
      this.recordFailedAttempt(cleanLoginId);
      return { success: false, error: 'Portal access not configured. Please contact Super Admin.' };
    }

    if (patient.portalPassword !== cleanPassword) {
      const lockRes = this.recordFailedAttempt(cleanLoginId);
      return { 
        success: false, 
        isLocked: lockRes.locked,
        remainingSeconds: lockRes.remainingSeconds,
        error: 'Invalid Login Credentials. Incorrect password.' 
      };
    }

    const cards = StorageService.getCards();
    const matchedCard = cards.find(c => c.patientId === patient.id && c.status === 'active');
    
    if (!matchedCard) {
      return { success: false, error: 'No active health card linked to this account.' };
    }

    this.clearFailedAttempts(cleanLoginId);

    const memberships = StorageService.getMemberships();
    const membership = memberships.find(m => m.id === matchedCard.membershipId);

    if (matchedCard.expiryDate && new Date(matchedCard.expiryDate) < new Date()) {
      return { success: false, error: 'Your health card has expired. Please renew.' };
    }

    localStorage.setItem(CARDHOLDER_SESSION_KEY, patient.id);
    localStorage.setItem(CARDHOLDER_TOKEN_KEY, \`mock_token_\${Date.now()}\`);
    sessionStorage.setItem('labmedix_portal_auth_timestamp', Date.now().toString());

    AuditService.log(
      'CARDHOLDER_AUTH_SUCCESS',
      'patient',
      \`Cardholder \${patient.fullName} (\${patient.id}) authenticated into Smart Portal.\`,
      patient.id
    );

    return {
      success: true,
      patient,
      card: matchedCard,
      membership
    };
  }
`;

code = code.replace(/public static authenticate\([\s\S]*?return \{\n\s*success: true,\n\s*patient,\n\s*card: matchedCard,\n\s*membership\n\s*\};\n\s*\}/, replacement);

fs.writeFileSync('src/services/cardholderAuthService.ts', code);
console.log('Fixed cardholder auth');
