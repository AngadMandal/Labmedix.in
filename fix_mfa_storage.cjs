const fs = require('fs');
let code = fs.readFileSync('src/services/authService.ts', 'utf8');

const replacement = `
  private static mfaMemoryMap: Record<string, { code: string; expiresAt: number }> = {};

  public static generateMfaCode(username: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.mfaMemoryMap[username.toLowerCase()] = {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    };
    // In a real app, send via SMS/Email here
    return code;
  }

  public static verifyMfaCode(username: string, inputCode: string): { success: boolean; error?: string } {
    const key = username.toLowerCase();
    const challenge = this.mfaMemoryMap[key];

    if (!challenge) {
      return { success: false, error: 'No active MFA challenge found for this user.' };
    }

    if (Date.now() > challenge.expiresAt) {
      delete this.mfaMemoryMap[key];
      return { success: false, error: 'MFA session expired. Please request a new verification code.' };
    }

    if (challenge.code !== inputCode) {
      return { success: false, error: 'Invalid 6-digit MFA verification code. Please check and re-enter.' };
    }

    delete this.mfaMemoryMap[key];
    return { success: true };
  }
`;

code = code.replace(/private static MFA_STORAGE_KEY = 'LABMEDIX_ACTIVE_MFA_CODES';[\s\S]*?return \{ success: true \};\n\s*\}/, replacement);

fs.writeFileSync('src/services/authService.ts', code);
console.log('Fixed MFA storage');
