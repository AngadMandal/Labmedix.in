const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<Route path="\/users" element=\{<ModuleGuard moduleKey="users"><UserListPage \/><\/ModuleGuard>\} \/>/,
  '<Route path="/users" element={<SuperAdminGuard><ModuleGuard moduleKey="users"><UserListPage /></ModuleGuard></SuperAdminGuard>} />'
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched /users route');
