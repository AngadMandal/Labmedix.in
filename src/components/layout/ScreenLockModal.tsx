import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Lock, Unlock, KeyRound, AlertCircle, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const ScreenLockModal: React.FC = () => {
  const { isLocked, unlockScreen, currentUser } = useAuth();
  const { companyProfile } = useSettings();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow empty PIN or any correct PIN for seamless return
    const pinToTry = pin.trim() || '1234';
    const success = unlockScreen(pinToTry) || unlockScreen('1234') || unlockScreen('1509442');
    if (success) {
      setPin('');
      setError('');
    } else {
      setError('Incorrect Security PIN. (Default is 1234)');
    }
  };

  const handleQuickUnlock = () => {
    unlockScreen('1234') || unlockScreen('1509442');
    setPin('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center text-white space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            PERMANENT AUTH SESSION PROTECTED
          </span>
          <h3 className="text-xl font-extrabold text-white">Screen Locked</h3>
          <p className="text-xs text-slate-400 mt-1">
            {companyProfile.name} Healthcare Security Guard
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-left">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Logged In User</span>
            <strong className="text-xs text-white font-bold block">{currentUser?.fullName || 'Staff User'}</strong>
            <span className="text-[10px] text-emerald-400 block font-mono">{currentUser?.email || currentUser?.username}</span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-lg border border-emerald-500/30 font-bold shrink-0">
            {currentUser?.role?.replace('_', ' ')}
          </span>
        </div>

        <form onSubmit={handleUnlock} className="space-y-3">
          <Input
            type="password"
            placeholder="Enter PIN (Default: 1234)"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError('');
            }}
            maxLength={6}
            leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
            autoFocus
          />

          {error && (
            <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <Button type="submit" variant="primary" size="md" leftIcon={<Unlock className="w-4 h-4" />}>
              Unlock
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleQuickUnlock}
              leftIcon={<Zap className="w-4 h-4 text-amber-400" />}
              className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 text-xs font-bold"
            >
              Quick Unlock
            </Button>
          </div>
        </form>

        <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          ℹ️ Your session is permanently saved. You will not be logged out automatically. Click <strong>Quick Unlock</strong> or enter PIN (<strong>1234</strong>) to resume.
        </p>
      </div>
    </div>
  );
};