import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Lock, Unlock, KeyRound, AlertCircle } from 'lucide-react';
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
    if (!pin) {
      setError('Please enter your 4-digit PIN');
      return;
    }
    const success = unlockScreen(pin);
    if (success) {
      setPin('');
      setError('');
    } else {
      setError('Incorrect Security PIN. (Default is 1234)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-extrabold text-white">Screen Locked</h3>
        <p className="text-xs text-slate-400 mt-1">
          {companyProfile.name} Healthcare Security Guard
        </p>

        <div className="my-6 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Session</span>
            <strong className="text-xs block text-white">{currentUser?.fullName || 'Staff User'}</strong>
          </div>
          <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
            {currentUser?.role}
          </span>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter Security PIN (e.g. 1234)"
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
            <p className="text-xs text-red-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" leftIcon={<Unlock className="w-4 h-4" />}>
            Unlock Screen
          </Button>

          <p className="text-[11px] text-slate-500">
            Default system pin: <strong className="text-slate-300">1234</strong>
          </p>
        </form>
      </div>
    </div>
  );
};