import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Clock, RefreshCw, LogOut } from 'lucide-react';
import { Button } from './Button';

export const IdleSessionWarningModal: React.FC = () => {
  const { isIdleWarningOpen, idleSecondsRemaining, extendSession, logout, currentUser } = useAuth();

  if (!isIdleWarningOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-lg shadow-amber-500/10 animate-bounce">
            <Clock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            Security Inactivity Alert
          </div>

          <h3 className="text-xl font-black text-white tracking-tight font-display">
            Session Expiring Soon
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            You have been inactive for nearly 15 minutes. To protect sensitive clinical data and patient privacy, your session will automatically terminate in:
          </p>

          <div className="py-2">
            <div className="inline-flex items-baseline gap-1 text-4xl font-extrabold text-amber-400 font-mono tracking-tight bg-slate-950/80 px-6 py-3 rounded-2xl border border-amber-500/30 shadow-inner">
              <span>{idleSecondsRemaining}</span>
              <span className="text-sm font-sans font-semibold text-slate-400">sec</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={() => logout()}
            className="w-full border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold"
          >
            Log Out Now
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={extendSession}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 text-xs"
          >
            Stay Logged In
          </Button>
        </div>
      </div>
    </div>
  );
};
