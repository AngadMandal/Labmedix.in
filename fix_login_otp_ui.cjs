const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/LoginPage.tsx', 'utf8');

code = code.replace(
  /<div className="pt-2 p-3 rounded-xl bg-slate-950 border border-emerald-500\/40 flex items-center justify-between text-xs font-mono shadow-inner">[\s\S]*?<\/div>\n\s*<\/div>/,
  ''
);

fs.writeFileSync('src/pages/auth/LoginPage.tsx', code);
console.log('Fixed LoginPage OTP display');
