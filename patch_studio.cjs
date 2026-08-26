const fs = require('fs');
let code = fs.readFileSync('src/components/card/CardStudio.tsx', 'utf8');

if (!code.includes("AuthService.getCurrentUser()")) {
  code = "import { AuthService } from '../../services/authService';\n" + code;
  code = code.replace(
    /const handleSaveDesign = \(\) => \{/g,
    "const handleSaveDesign = () => {\n    const currentUser = AuthService.getCurrentUser();\n    if (currentUser?.role !== 'super_admin') {\n      alert('Only Super Admin can save card design edits.');\n      return;\n    }"
  );
  fs.writeFileSync('src/components/card/CardStudio.tsx', code);
  console.log('Patched CardStudio');
}
