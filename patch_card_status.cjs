const fs = require('fs');
let code = fs.readFileSync('src/services/cardService.ts', 'utf8');

code = code.replace(
  /const currentUser = StorageService\.getCurrentUser\(\);/,
  `const currentUser = StorageService.getCurrentUser();
    
    // Security Upgrade: Only Super Admin can approve cards
    if (newStatus === 'active' && prevStatus === 'pending') {
      if (!currentUser || currentUser.role !== 'super_admin') {
        throw new Error('403 Forbidden: Only Super Admin can approve cards.');
      }
    }`
);

fs.writeFileSync('src/services/cardService.ts', code);
console.log('Patched cardService status change');
