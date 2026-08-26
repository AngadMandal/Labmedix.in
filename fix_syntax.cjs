const fs = require('fs');
let code = fs.readFileSync('src/pages/portal/PatientPortalPage.tsx', 'utf8');

// Replace the problematic block
code = code.replace(
  /                  <\/div>\n                <\/div>\n              \)\}\n              <p className="text-\[11px\] text-slate-400 text-center mt-2 font-mono">/g,
  `                  </div>\n              <p className="text-[11px] text-slate-400 text-center mt-2 font-mono">`
);

fs.writeFileSync('src/pages/portal/PatientPortalPage.tsx', code);
console.log('Fixed syntax block 1');
