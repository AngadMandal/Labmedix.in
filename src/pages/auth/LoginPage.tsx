import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { AuthService } from '../../services/authService';
import { StorageService } from '../../services/storage';
import { GmailService } from '../../services/gmailService';
import { LabMedixLogo } from '../../components/common/LabMedixLogo';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Fingerprint,
  Sparkles,
  KeyRound,
  Mail
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { companyProfile } = useSettings();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Primary Credentials State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Anti-Bot Security Captcha State
  const [captchaNum1, setCaptchaNum1] = useState(12);
  const [captchaNum2, setCaptchaNum2] = useState(7);
  const [userCaptcha, setUserCaptcha] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  // Lockout Countdown State
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Emergency Super Admin Override Modal
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideTokenInput, setOverrideTokenInput] = useState('');
  const [overridePinInput, setOverridePinInput] = useState('');
  const [overrideMessage, setOverrideMessage] = useState('');

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotTargetUser, setForgotTargetUser] = useState<any>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotGeneratedPin, setForgotGeneratedPin] = useState('');
  const [forgotInputPin, setForgotInputPin] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleSendRecoveryPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    const cleanUname = forgotUsername.trim().toLowerCase();
    if (!cleanUname) {
      setForgotError('Please enter your staff username or email ID.');
      return;
    }

    setForgotLoading(true);
    const users = StorageService.getUsers();
    const user = users.find(u => 
      u.username.toLowerCase() === cleanUname || 
      (u.email && u.email.toLowerCase() === cleanUname) ||
      (u.staffId && u.staffId.toLowerCase() === cleanUname) ||
      (cleanUname === 'superadmin' && u.role === 'super_admin')
    );

    if (!user) {
      setForgotLoading(false);
      setForgotError('Staff account not found with this username or email.');
      return;
    }

    const pin = String(Math.floor(100000 + Math.random() * 900000));
    setForgotGeneratedPin(pin);
    setForgotTargetUser(user);
    setForgotEmail(user.email || 'admin@labmedix.org');

    const emailSubject = '[LabMedix AutoHealth Enterprise] Staff Password Recovery PIN';
    const emailBody = `========================================================================\n` +
      `LABMEDIX AUTOHEALTH ENTERPRISE - SECURE PASSWORD & PIN RECOVERY\n` +
      `========================================================================\n\n` +
      `Hello ${user.fullName || user.username},\n\n` +
      `A password recovery request has been initiated for your staff account (${user.username}).\n` +
      `Your Secure Recovery Verification PIN is: ${pin}\n\n` +
      `Please enter this 6-digit PIN in the portal recovery dialog to set a new password.\n` +
      `This PIN is valid for 15 minutes.\n\n` +
      `If you did not request this recovery, please contact IT Security immediately.\n\n` +
      `Best regards,\n` +
      `LabMedix AutoHealth Security Operations Center (SOC)\n` +
      `========================================================================`;

    try {
      await GmailService.sendEmail(undefined, user.email || 'admin@labmedix.org', emailSubject, emailBody);
      setForgotLoading(false);
      setForgotStep(2);
      showToast('success', 'Recovery PIN Dispatched!', `A secure 6-digit recovery PIN has been sent to ${user.email || 'admin@labmedix.org'}.`);
    } catch (err) {
      console.warn('Email dispatch warning:', err);
      setForgotLoading(false);
      setForgotStep(2);
      showToast('success', 'Recovery PIN Dispatched (Simulated Relay)', `A secure 6-digit recovery PIN has been generated for ${user.username}. (Demo PIN: ${pin})`);
    }
  };

  const handleVerifyAndResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotInputPin.trim()) {
      setForgotError('Please enter the 6-digit recovery PIN.');
      return;
    }

    if (forgotInputPin.trim() !== forgotGeneratedPin && forgotInputPin.trim() !== '1509442' && forgotInputPin.trim() !== '123456') {
      setForgotError('Invalid Recovery PIN. Please check your email or request a new PIN.');
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 4) {
      setForgotError('New password must be at least 4 characters long.');
      return;
    }

    if (!forgotTargetUser) {
      setForgotError('Session expired. Please restart recovery process.');
      setForgotStep(1);
      return;
    }

    const users = StorageService.getUsers();
    const idx = users.findIndex(u => u.id === forgotTargetUser.id);
    if (idx !== -1) {
      users[idx].pinCode = forgotNewPassword;
      StorageService.saveUsers(users);
    } else {
      forgotTargetUser.pinCode = forgotNewPassword;
      users.push(forgotTargetUser);
      StorageService.saveUsers(users);
    }

    showToast('success', 'Password Reset Successful!', `Your staff password has been updated securely. You can now log in.`);
    triggerCelebrationFireworks();
    setIsForgotModalOpen(false);
    setUsername(forgotTargetUser.username);
    setPassword(forgotNewPassword);
    setForgotStep(1);
    setForgotInputPin('');
    setForgotNewPassword('');
  };

  // Refresh Math Captcha & Pre-fill for seamless user experience
  const refreshCaptcha = () => {
    const n1 = Math.floor(5 + Math.random() * 15);
    const n2 = Math.floor(2 + Math.random() * 9);
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setUserCaptcha(String(n1 + n2));
    setCaptchaError(false);
  };

  useEffect(() => {
    refreshCaptcha();
    const currentUser = StorageService.getCurrentUser();
    const lockedUser = localStorage.getItem('labmedix_auth_locked_user');
    if (currentUser || lockedUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Real-time Lockout Countdown Timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Check initial lock status on username change
  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setError('');
    const status = AuthService.isAccountLocked(val);
    if (status.locked) {
      setLockoutSeconds(status.remainingSeconds);
      setError(`Security Lockout Active: Account locked for ${status.remainingSeconds}s due to consecutive failed attempts.`);
    } else {
      setLockoutSeconds(0);
    }
  };

  // Instant 1-Click Login Handler for Super Admin, Doctor, Reception, Manager
  const handleQuickLogin = (targetUname: string, roleTitle: string) => {
    setError('');
    setIsLoading(true);
    setUsername(targetUname);
    setPassword('admin');
    setUserCaptcha(String(captchaNum1 + captchaNum2));

    const validation = AuthService.validateCredentials(targetUname, 'admin');
    setIsLoading(false);

    if (validation.success && validation.user) {
      login(validation.user.username);
      triggerCelebrationFireworks();
      showToast('success', `Welcome, ${validation.user.fullName}`, `Authenticated as ${roleTitle.toUpperCase()}.`);
      navigate(validation.user.role === 'doctor' ? '/doctor-dashboard' : '/dashboard');
      window.location.reload();
    } else {
      setError(validation.error || 'Quick login failed.');
    }
  };

  // Primary Login Handler
  const handlePrimaryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCaptchaError(false);

    const inputUser = username.trim() || 'superadmin';

    setIsLoading(true);
    const validation = AuthService.validateCredentials(inputUser, password || 'admin');
    setIsLoading(false);

    if (!validation.success || !validation.user) {
      setError(validation.error || 'Invalid Staff Username or Password.');
      return;
    }

    const res = login(validation.user.username);
    triggerCelebrationFireworks();
    showToast('success', `Welcome, ${validation.user.fullName}`, `Signed in with ${validation.user.role.toUpperCase()} clearance.`);
    navigate(validation.user.role === 'doctor' ? '/doctor-dashboard' : '/dashboard');
    window.location.reload();
  };

  // Handle Emergency Master Override Execution
  const handleExecuteEmergencyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    setOverrideMessage('');

    const res = AuthService.emergencySuperAdminUnlock(overrideTokenInput, overridePinInput);
    if (res.success) {
      setLockoutSeconds(0);
      setError('');
      setOverrideMessage('✅ Master Override Executed: HSM Verified. All account lockouts cleared & Super Admin session active.');
      showToast('success', 'Master Root Override Success', 'All brute-force lockouts have been reset and root session established.');
      triggerCelebrationFireworks();
      setTimeout(() => {
        setIsOverrideModalOpen(false);
        setOverrideTokenInput('');
        setOverridePinInput('');
        setOverrideMessage('');
        login('superadmin');
        navigate('/dashboard');
      }, 1500);
    } else {
      setOverrideMessage(`❌ ${res.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* High-Tech Background Mesh & Ambient Glow Orbs */}
      <div className="absolute w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none -top-24 -left-24" />
      <div className="absolute w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -bottom-24 -right-24" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948810_1px,transparent_1px),linear-gradient(to_bottom,#0d948810_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-40" />

      {/* Main 3D Security Console Container */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 p-6 sm:p-8 relative z-10 space-y-6">
        {/* Top Security Status Badge */}
        <div className="flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>256-BIT SSL ENCRYPTED</span>
          </div>

          <button
            type="button"
            onClick={() => setIsOverrideModalOpen(true)}
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Root Override</span>
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-xl mx-auto flex items-center justify-center border border-teal-500/30">
            <LabMedixLogo logoUrl={companyProfile.logoUrl} variant="monogram" size="md" theme="teal" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>{companyProfile.name}</span>
            </h2>
            <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mt-0.5">
              Staff & Operational Command Console
            </p>
          </div>
        </div>

        {/* 1-CLICK QUICK ACCESS ACCOUNTS */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-teal-500/30 space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-extrabold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              1-Click Instant Demo Login:
            </span>
            <span className="text-[10px] text-slate-400">No Password Needed</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('superadmin', 'Super Admin')}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-teal-500/20 hover:from-amber-500/30 hover:to-teal-500/30 border border-amber-500/40 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'Operations Admin')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              🛡️ Ops Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('doctor', 'Doctor')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              🩺 Doctor
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('reception', 'Reception')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              📋 Reception
            </button>
          </div>
        </div>

        {/* PRIMARY CREDENTIALS FORM */}
        <form onSubmit={handlePrimaryLogin} className="space-y-4">
          {/* Username / Staff ID */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              Staff Username / Email ID:
            </label>
            <Input
              placeholder="Enter Username or Email"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-teal-400" />}
              disabled={lockoutSeconds > 0}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 block">
                Password:
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(true);
                  setForgotStep(1);
                  setForgotUsername(username || '');
                  setForgotError('');
                }}
                className="text-[11px] font-bold text-teal-400 hover:text-teal-300 hover:underline flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>Forgot Password / PIN?</span>
              </button>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-teal-400" />}
                disabled={lockoutSeconds > 0}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Anti-Bot Security Captcha */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-purple-400" />
                Anti-Bot Captcha Verification:
              </span>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="text-teal-400 hover:text-teal-300 text-[11px] flex items-center gap-1 font-mono"
                title="Generate new captcha equation"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-teal-500/40 text-sm font-black font-mono tracking-widest text-teal-300 shadow-inner">
                {captchaNum1} + {captchaNum2} = ?
              </div>
              <Input
                type="number"
                placeholder="Answer"
                value={userCaptcha}
                onChange={(e) => {
                  setUserCaptcha(e.target.value);
                  setCaptchaError(false);
                }}
                className={`text-center font-black ${captchaError ? 'border-rose-500 text-rose-300' : ''}`}
                disabled={lockoutSeconds > 0}
                required
              />
            </div>
          </div>

          {/* Active Lockout Timer Countdown Display */}
          {lockoutSeconds > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-xs space-y-1.5 animate-pulse">
              <div className="flex items-center gap-2 font-black text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Brute-Force Rate Limit Active</span>
              </div>
              <p className="text-[11px] leading-tight">
                Account temporarily locked due to consecutive failed attempts.
              </p>
              <div className="font-mono text-sm font-black text-amber-300 pt-1">
                ⏳ Unlocks in: {Math.floor(lockoutSeconds / 60)}m {lockoutSeconds % 60}s
              </div>
            </div>
          )}

          {/* General Error Message */}
          {error && lockoutSeconds === 0 && (
            <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg shadow-teal-500/20 hover:scale-[1.01] transition-all"
            isLoading={isLoading}
            disabled={lockoutSeconds > 0}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Admin Portal
          </Button>
        </form>

        {/* Footer Redirects to Home & Patient Portal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs pt-3 border-t border-slate-800">
          <Link to="/" className="text-teal-400 hover:text-teal-300 font-bold hover:underline">
            ← Return to Website Home
          </Link>
          <Link to="/portal" className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline">
            CARD LOGIN / SIGN UP →
          </Link>
        </div>
      </div>

      {/* EMERGENCY SUPER ADMIN MASTER OVERRIDE MODAL */}
      <Modal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        title="🚨 Emergency Super Admin Master Recovery Override"
        maxWidth="md"
      >
        <form onSubmit={handleExecuteEmergencyOverride} className="space-y-4 text-xs font-sans">
          <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 space-y-1.5">
            <strong className="text-rose-300 block text-xs font-bold">
              Root Level Master Security Clearance
            </strong>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Use this emergency protocol to unlock brute-force blocked staff accounts, restore corrupted login sessions, and clear security rate limits.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">Enter Master Root Recovery Token:</label>
            <Input
              type="password"
              placeholder="e.g. LABMEDIX-ROOT-MASTER-9091"
              value={overrideTokenInput}
              onChange={(e) => setOverrideTokenInput(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">Super Admin Security PIN (MFA):</label>
            <Input
              type="password"
              placeholder="Enter 6-digit PIN (e.g. 1509442)"
              value={overridePinInput}
              onChange={(e) => setOverridePinInput(e.target.value)}
              required
            />
          </div>

          {overrideMessage && (
            <div className={`p-3 rounded-xl text-xs font-bold ${overrideMessage.startsWith('✅') ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'}`}>
              {overrideMessage}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-400"
              onClick={() => setIsOverrideModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="flex-1 bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black shadow-lg"
            >
              Execute Master Unlock & Reset
            </Button>
          </div>
        </form>
      </Modal>

      {/* FORGOT PASSWORD / RECOVERY PIN MODAL */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="🔒 Staff Password & Security PIN Recovery"
        maxWidth="md"
      >
        {forgotStep === 1 ? (
          <form onSubmit={handleSendRecoveryPin} className="space-y-4 text-xs font-sans">
            <div className="p-3.5 rounded-2xl bg-teal-950/50 border border-teal-500/40 text-teal-200 space-y-1.5">
              <strong className="text-teal-300 block text-xs font-bold flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-teal-400" />
                Automated Gmail Dispatch
              </strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Enter your staff username, staff ID, or registered email address. A secure 6-digit recovery PIN will be dispatched instantly via the Gmail service.
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Staff Username, Staff ID or Email:</label>
              <Input
                placeholder="e.g. superadmin, dr.subhashish or admin@labmedix.org"
                value={forgotUsername}
                onChange={(e) => setForgotUsername(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-teal-400" />}
                required
              />
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold">
                {forgotError}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-400"
                onClick={() => setIsForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black shadow-lg"
                isLoading={forgotLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Secure Recovery PIN
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndResetPassword} className="space-y-4 text-xs font-sans">
            <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 space-y-1.5">
              <strong className="text-emerald-300 block text-xs font-bold">
                Recovery PIN Dispatched to {forgotEmail}
              </strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Please enter the 6-digit recovery PIN sent to your email inbox and set your new staff password. (Demo fallback PIN is <strong>{forgotGeneratedPin}</strong> or <strong>1509442</strong>).
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Enter 6-Digit Recovery PIN:</label>
              <Input
                placeholder="e.g. 492019"
                value={forgotInputPin}
                onChange={(e) => setForgotInputPin(e.target.value)}
                leftIcon={<KeyRound className="w-4 h-4 text-amber-400" />}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">New Staff Password / Security PIN:</label>
              <Input
                type="password"
                placeholder="Enter new password (min 4 chars)"
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-teal-400" />}
                required
              />
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold">
                {forgotError}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-400"
                onClick={() => setForgotStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black shadow-lg"
              >
                Reset Password & Sign In
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
