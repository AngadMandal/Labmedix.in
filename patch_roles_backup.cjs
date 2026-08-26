const fs = require('fs');
let code = fs.readFileSync('src/constants/roles.ts', 'utf8');

// Remove backup from admin
code = code.replace(
  /'activity', 'backup', 'settings'/,
  "'activity', 'settings'"
);

// We should also patch App.tsx to ensure it's wrapped in SuperAdminGuard just in case
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  /<Route path="\/backup" element=\{<ModuleGuard moduleKey="backup"><BackupRestorePage \/><\/ModuleGuard>\} \/>/,
  '<Route path="/backup" element={<SuperAdminGuard><ModuleGuard moduleKey="backup"><BackupRestorePage /></ModuleGuard></SuperAdminGuard>} />'
);

fs.writeFileSync('src/constants/roles.ts', code);
fs.writeFileSync('src/App.tsx', appCode);

console.log('Restricted backup to super admin');
