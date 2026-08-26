const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('AuditService.log')) {
  // It's not imported in App.tsx or not used in guard.
  code = code.replace(
    /const SuperAdminGuard: React\.FC<\{ children: React\.ReactNode \}> = \(\{ children \}\) => \{/,
    `import { AuditService } from './services/auditService';\nconst SuperAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {`
  );
  
  code = code.replace(
    /return \(\n\s*<div className="min-h-screen bg-slate-950/,
    `React.useEffect(() => {
      AuditService.log('UNAUTHORIZED_ACCESS_ATTEMPT', 'auth', \`User \${currentUser.username} (\${currentUser.role}) attempted to access Super Admin Portal.\`);
    }, [currentUser]);
    
    return (
      <div className="min-h-screen bg-slate-950`
  );

  fs.writeFileSync('src/App.tsx', code);
  console.log('Added audit to SuperAdminGuard');
}
