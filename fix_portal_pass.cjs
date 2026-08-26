const fs = require('fs');
let code = fs.readFileSync('src/pages/patients/PatientCreatePage.tsx', 'utf8');

if (!code.includes('const [portalPassword, setPortalPassword]')) {
  code = code.replace(
    /const \[chronicConditions, setChronicConditions\] = useState\('None'\);/,
    "const [chronicConditions, setChronicConditions] = useState('None');\n  const [portalPassword, setPortalPassword] = useState('');"
  );
  fs.writeFileSync('src/pages/patients/PatientCreatePage.tsx', code);
  console.log('Added portalPassword state');
}
