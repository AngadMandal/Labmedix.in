const fs = require('fs');
let code = fs.readFileSync('src/components/card/CR80CardBack.tsx', 'utf8');

if (!code.includes("AuthService.getCurrentUser")) {
  code = "import { AuthService } from '../../services/authService';\n" + code;
  code = code.replace(
    "maskCvv = false",
    "maskCvv: passedMaskCvv"
  );
  code = code.replace(
    "const preset = cfg.preset",
    "const currentUser = AuthService.getCurrentUser();\n  const maskCvv = passedMaskCvv !== undefined ? passedMaskCvv : (currentUser ? currentUser.role !== 'super_admin' : false);\n  const preset = cfg.preset"
  );
  fs.writeFileSync('src/components/card/CR80CardBack.tsx', code);
  console.log('Patched CR80CardBack');
}
