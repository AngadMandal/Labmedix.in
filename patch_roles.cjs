const fs = require('fs');
let code = fs.readFileSync('src/constants/roles.ts', 'utf8');

// Strip out card_update and card_status_change from all except super_admin
code = code.replace(/('card_update',\s*)/g, (match, p1) => {
  return '';
});

// We need to keep it for super_admin. Let's just do a manual replace.
