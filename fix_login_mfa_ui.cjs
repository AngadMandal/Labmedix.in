const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/LoginPage.tsx', 'utf8');

code = code.replace(
  /<div className="pt-2 p-2\.5 rounded-xl bg-slate-950 border border-emerald-500\/30 flex items-center justify-between text-xs font-mono">\s*<span>⚡ Auto-Generated 2FA Code:<\/span>\s*<strong className="text-emerald-400 text-sm tracking-widest">\{activeMfaCode\}<\/strong>\s*<\/div>/,
  ''
);

fs.writeFileSync('src/pages/auth/LoginPage.tsx', code);
console.log('Fixed LoginPage MFA display');
