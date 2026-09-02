import React, { useState, useEffect } from 'react';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DeviceRevokedModal: React.FC = () => {
  const [isRevoked, setIsRevoked] = useState(false);
  const [reason, setReason] = useState<string>('This device session has been revoked by an administrator.');
  const navigate = useNavigate();

  useEffect(() => {
    const handleRevoke = (e: any) => {
      if (e?.detail?.message) {
        setReason(e.detail.message);
      }
      setIsRevoked(true);
    };

    window.addEventListener('labmedix_device_revoked', handleRevoke);
    return () => {
      window.removeEventListener('labmedix_device_revoked', handleRevoke);
    };
  }, []);

  if (!isRevoked) return null;

  const handleAcknowledge = () => {
    setIsRevoked(false);
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-lg border border-rose-200 dark:border-rose-800">
          <ShieldAlert className="w-9 h-9 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Device Access Revoked
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {reason}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-300 text-left font-mono">
          Security policy enforced: Local authorization tokens cleared. Re-authentication on central Firestore required.
        </div>

        <button
          onClick={handleAcknowledge}
          className="w-full py-3 px-4 rounded-2xl bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          Return to Login
        </button>
      </div>
    </div>
  );
};
