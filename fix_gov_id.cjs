const fs = require('fs');
let code = fs.readFileSync('src/pages/patients/PatientCreatePage.tsx', 'utf8');

code = code.replace(/const \[governmentIdNumber,[\s\S]*?setGovernmentIdNumber\] = useState\(''\);/, "const [governmentIdNumber, setGovernmentIdNumber] = useState('');");

fs.writeFileSync('src/pages/patients/PatientCreatePage.tsx', code);
console.log('Fixed Gov ID line');
