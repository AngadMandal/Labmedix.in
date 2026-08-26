const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const guard = `
const SuperAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = StorageService.getCurrentUser();
  if (!currentUser) return <Navigate to="/login" replace />;
  
  if (currentUser.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6 text-center">
        <div className="p-4 rounded-full bg-rose-500/20 text-rose-500 mb-6">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">403 Forbidden</h1>
        <p className="text-slate-400 max-w-md">
          ACCESS DENIED. You do not have the required Super Admin clearance to access this highly classified security sector.
        </p>
      </div>
    );
  }
  return <>{children}</>;
};
`;

if (!code.includes('const SuperAdminGuard')) {
  code = code.replace(/const DoctorRouteGuard/, guard + '\n\nconst DoctorRouteGuard');
  fs.writeFileSync('src/App.tsx', code);
  console.log('Fixed App.tsx');
}
