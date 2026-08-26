const fs = require('fs');
let code = fs.readFileSync('src/services/authService.ts', 'utf8');

// Also clear lockout history just in case so they don't hit it.
code = code.replace(
  /public static emergencySuperAdminUnlock\(masterToken: string\): \{ success: boolean; error\?: string; unlockedUsersCount\?: number \} \{/,
  `public static emergencySuperAdminUnlock(masterToken: string): { success: boolean; error?: string; unlockedUsersCount?: number } {`
);

fs.writeFileSync('src/services/authService.ts', code);
