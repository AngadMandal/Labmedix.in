const fs = require('fs');
let code = fs.readFileSync('src/pages/patients/PatientCreatePage.tsx', 'utf8');

// Add state for portalPassword
code = code.replace(
  /const \[chronicConditions, setChronicConditions\] = useState\(''\);/,
  `const [chronicConditions, setChronicConditions] = useState('');\n  const [portalPassword, setPortalPassword] = useState('');`
);

// Add to patient payload
code = code.replace(
  /governmentIdNumber,\n\s*bloodGroup\n\s*\}\)/,
  `governmentIdNumber,\n      bloodGroup,\n      portalPassword\n    })`
);
// Wait, patientService.createPatient needs to be updated too. Let's just pass it in the input.
code = code.replace(
  /governmentIdNumber,\n\s*bloodGroup\n\s*\}\)/,
  `governmentIdNumber,\n      bloodGroup,\n      portalPassword\n    })`
);

// In patient preview
code = code.replace(
  /walletId: 'wal_preview',/,
  `portalPassword,\n      walletId: 'wal_preview',`
);

// Add UI for portalPassword
const passwordUI = `
            {/* PORTAL ACCESS (SUPER ADMIN ONLY) */}
            {isSuperAdmin && (
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-teal-500/30 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <h3 className="text-sm font-bold text-teal-300 uppercase tracking-wider">Portal Access Credentials</h3>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Staff Portal Password</label>
                  <Input
                    type="text"
                    value={portalPassword}
                    onChange={(e) => setPortalPassword(e.target.value)}
                    placeholder="Set temporary password (e.g. LabMedix@2026)"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Only Super Admin can set this. User will use Email/Mobile/ID + this password to log in.</p>
                </div>
              </div>
            )}
`;

code = code.replace(/\{renderCardGenerationSection\(\)\}/, passwordUI + "\n            {renderCardGenerationSection()}");

fs.writeFileSync('src/pages/patients/PatientCreatePage.tsx', code);
console.log('Patched PatientCreatePage');
