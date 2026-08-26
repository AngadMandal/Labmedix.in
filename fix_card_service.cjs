const fs = require('fs');
let code = fs.readFileSync('src/services/cardService.ts', 'utf8');

code = code.replace(
  /const currentUser = StorageService\.getCurrentUser\(\);\n\s*\/\/ Security Upgrade: Only Super Admin can approve cards\n\s*if \(newStatus === 'active' && prevStatus === 'pending'\) \{\n\s*if \(\!currentUser \|\| currentUser\.role !== 'super_admin'\) \{\n\s*throw new Error\('403 Forbidden: Only Super Admin can approve cards\.'\);\n\s*\}\n\s*\}\n\s*const prevStatus = card\.status;/,
  `const prevStatus = card.status;
    const currentUser = StorageService.getCurrentUser();
    
    // Security Upgrade: Only Super Admin can approve cards
    if (newStatus === 'active' && prevStatus === 'pending') {
      if (!currentUser || currentUser.role !== 'super_admin') {
        throw new Error('403 Forbidden: Only Super Admin can approve cards.');
      }
    }`
);

fs.writeFileSync('src/services/cardService.ts', code);
console.log('Fixed cardService prevStatus');
