const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/LoginPage.tsx', 'utf8');

// Remove the text displaying the MASTER_ROOT_OVERRIDE_TOKEN
code = code.replace(
  /<div className="pt-1 text-\[10\.5px\] font-mono text-amber-300">\s*⚡ Master Root Token: <strong>\{MASTER_ROOT_OVERRIDE_TOKEN\}<\/strong>\s*<\/div>/,
  ''
);

// Check for any other demo credentials
code = code.replace(
  /<p className="text-\[10\.5px\] text-slate-400 mt-2 font-mono bg-slate-900\/50 p-2 rounded-lg border border-slate-700\/50">\s*System Default Admin: <strong>admin<\/strong> \/ <strong>admin123<\/strong>\s*<\/p>/g,
  ''
);

fs.writeFileSync('src/pages/auth/LoginPage.tsx', code);
console.log('Fixed LoginPage credentials display');
