const fs = require('fs');
let code = fs.readFileSync('src/constants/roles.ts', 'utf8');

// Remove users from admin
code = code.replace(
  /'memberships', 'families', 'wallet', 'reports', 'users', 'integrations',/,
  "'memberships', 'families', 'wallet', 'reports', 'integrations',"
);
code = code.replace(
  /'family_manage', 'backup_manage', 'settings_manage', 'audit_view',/,
  "'family_manage', 'backup_manage', 'settings_manage', 'audit_view',"
);
code = code.replace(
  /'users_manage', 'reports_view', 'catalog_manage', 'package_manage'/,
  "'reports_view', 'catalog_manage', 'package_manage'"
);

fs.writeFileSync('src/constants/roles.ts', code);
console.log('Restricted users module to super_admin');
