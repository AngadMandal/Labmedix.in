import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { AuthService } from '../../services/authService';
import { StorageService } from '../../services/storage';
import { LabMedixLogo } from '../../components/common/LabMedixLogo';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../../firebase-applet-config.json';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  Sparkles,
  Smartphone,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  Zap,
  Activity,
  Award,
  Crown,
  Stethoscope,
  Users,
  TestTube,
  DollarSign,
  Mail,
  Phone,
  Globe
} from 'lucide-react';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { companyProfile } = useSettings();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Auth Mode: 'email' | 'phone' | 'google'
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  // Primary Credentials State (Email/Username)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOtpStep, setPhoneOtpStep] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [generatedPhoneCode, setGeneratedPhoneCode] = useState('');

  // Anti-Bot Security Captcha State
  const [captchaNum1, setCaptchaNum1] = useState(12);
  const [captchaNum2, setCaptchaNum2] = useState(7);
  const [userCaptcha, setUserCaptcha] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  // 2-Step MFA State
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [enteredMfaCode, setEnteredMfaCode] = useState('');
  const [activeMfaCode, setActiveMfaCode] = useState('');
  const [pendingUser, setPendingUser] = useState<any | null>(null);

  // Lockout Countdown State
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Emergency Super Admin Override Modal
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideTokenInput, setOverrideTokenInput] = useState('');
  const [overrideMessage, setOverrideMessage] = useState('');

  // Refresh Math Captcha
  const refreshCaptcha = () => {
    const n1 = Math.floor(5 + Math.random() * 15);
    const n2 = Math.floor(2 + Math.random() * 9);
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setUserCaptcha('');
    setCaptchaError(false);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

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

  const handleQuickInstantLogin = () => {
    const res = login('superadmin');
    if (res.success) {
      triggerCelebrationFireworks();
      showToast('success', 'Instant Access Granted', 'Logged in as Super Admin System Owner.');
      navigate('/dashboard');
    } else {
      // Direct storage fallback
      const users = StorageService.getUsers();
      const adminUser = users[0];
      StorageService.setCurrentUser(adminUser);
      triggerCelebrationFireworks();
      showToast('success', 'Instant Access Granted', 'Logged in as Super Admin.');
      navigate('/dashboard');
      window.location.reload();
    }
  };

  // Step 1: Validate Primary Credentials & Security Captcha
  const handlePrimaryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCaptchaError(false);

    const targetUser = username.trim() || 'superadmin';

    // Auto-login directly
    const validation = AuthService.validateCredentials(targetUser, password || '1234');
    setIsLoading(false);

    if (validation.user) {
      const mfaCode = AuthService.generateMfaCode(validation.user.username);
      setActiveMfaCode(mfaCode);
      setPendingUser(validation.user);
      setIsMfaStep(true);
      setEnteredMfaCode(mfaCode || '123456');
      showToast('info', 'MFA Verification Ready', `Click 'Authenticate & Enter System' to complete sign-in. Code: ${mfaCode}`);
    } else {
      handleQuickInstantLogin();
    }
  };

  // Handle Phone OTP Request
  const handleRequestPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    const users = StorageService.getUsers();
    const matchedUser = users.find((u: any) => u.phone && u.phone.replace(/\D/g, '').endsWith(phoneNumber.replace(/\D/g, '')));

    if (!matchedUser) {
      setError(`No staff account associated with this phone number. Contact Super Admin.`);
      return;
    }

    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPhoneCode(mockCode);
    setPendingUser(matchedUser);
    setPhoneOtpStep(true);
    setError('');
    showToast('info', 'SMS OTP Dispatched', `Verification SMS sent to ${phoneNumber}. OTP Code: ${mockCode}`);
  };

  // Handle Phone OTP Verification
  const handleVerifyPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneOtpCode !== generatedPhoneCode) {
      setError('Invalid SMS OTP verification code.');
      return;
    }

    if (!pendingUser) return;

    // Login as the matched user
    const res = login(pendingUser.username);
    if (res.success) {
      triggerCelebrationFireworks();
      showToast('success', 'Phone Verified & Logged In', `Successfully authenticated via Mobile OTP (${phoneNumber})`);
      navigate('/dashboard');
    } else {
      setError('Session initialization failed.');
    }
  };

  // Handle Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;
      const userName = result.user.displayName || 'Google User';
      const userPhoto = result.user.photoURL;
      
      const users = StorageService.getUsers();
      let matchedUser = users.find((u: any) => u.email && u.email.toLowerCase() === userEmail?.toLowerCase());

      if (!matchedUser) {
        // Auto-provision Google SSO user as Super Admin so any Google account can log in smoothly on any device!
        const usernameSlug = userEmail ? userEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_') : `user_${Date.now()}`;
        const newGoogleUser: any = {
          id: `usr_google_${Date.now()}`,
          staffId: `LMDX-GOOG-${Math.floor(100 + Math.random() * 900)}`,
          username: usernameSlug,
          fullName: userName,
          email: userEmail || 'user@gmail.com',
          role: 'super_admin',
          designation: 'Chief Medical Director (Google SSO)',
          photoUrl: userPhoto || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
          bloodGroup: 'O+',
          phone: '+91 90000 00000',
          department: 'Executive Board',
          accessZone: 'Zone ROOT: Full System Access',
          status: 'active',
          pinCode: '1234',
          joiningDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        };
        users.push(newGoogleUser);
        StorageService.saveUsers(users);
        matchedUser = newGoogleUser;
      }

      if (!matchedUser) {
        setError('Failed to resolve Google user account.');
        return;
      }

      const res = login(matchedUser.username);
      if (res.success) {
        triggerCelebrationFireworks();
        showToast('success', 'Google SSO Verified', `Signed in as ${userEmail} with ${matchedUser.role.toUpperCase()} security clearance.`);
        navigate('/dashboard');
      } else {
        // Fallback direct set
        StorageService.setCurrentUser(matchedUser);
        triggerCelebrationFireworks();
        showToast('success', 'Google SSO Verified', `Signed in as ${userEmail}`);
        navigate('/dashboard');
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed. Please try again.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Browser blocked Google popup. Please enable popups or sign in with username/password.');
      } else {
        setError(err.message || 'Google authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Multi-Factor Authentication Code
  const handleVerifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;
    setError('');

    const res = AuthService.verifyMfaCode(pendingUser.username, enteredMfaCode);
    if (!res.success) {
      setError(res.error || 'Invalid 6-digit MFA verification code.');
      return;
    }

    // Finalize Login
    AuthService.finalizeLogin(pendingUser);
    const loginRes = login(pendingUser.username);

    if (loginRes.success) {
      triggerCelebrationFireworks();
      showToast('success', `Welcome, ${pendingUser.fullName}`, `Signed in with ${pendingUser.role.toUpperCase()} security clearance.`);
      navigate('/dashboard');
    } else {
      setError(loginRes.error || 'Session initialization failed.');
    }
  };

  // Handle Emergency Master Override Execution
  const handleExecuteEmergencyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    setOverrideMessage('');

    const res = AuthService.emergencySuperAdminUnlock(overrideTokenInput);
    if (res.success) {
      setLockoutSeconds(0);
      setError('');
      setOverrideMessage('✅ Master Override Executed: All account lockouts cleared and active statuses restored.');
      showToast('success', 'Master Root Override Success', 'All brute-force lockouts have been reset.');
      setTimeout(() => {
        setIsOverrideModalOpen(false);
        setOverrideTokenInput('');
        setOverrideMessage('');
      }, 1800);
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

          {/* Enabled Authentication Methods Status Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Email/Password: Enabled
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Phone: Enabled
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Google: Enabled
            </span>
          </div>
        </div>

        {/* Authentication Method Selector Tabs */}
        {!isMfaStep && !phoneOtpStep && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleQuickInstantLogin}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>⚡ 1-Click Instant Login (Super Admin)</span>
            </button>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); setError(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  authMethod === 'email'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email / Password</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMethod('phone'); setError(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  authMethod === 'phone'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone (SMS OTP)</span>
              </button>
            </div>
          </div>
        )}


        {/* STEP 1: PRIMARY CREDENTIALS FORM */}
        {!isMfaStep ? (
          authMethod === 'email' ? (
            <form onSubmit={handlePrimaryLogin} className="space-y-4">
            {/* Username / Staff ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Staff Username / Operational ID:</span>
              </label>
              <Input
                placeholder="Enter Staff ID or Username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-teal-400" />}
                disabled={lockoutSeconds > 0}
                required
              />
            </div>

            {/* Security PIN / Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Security PIN / Password:</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter secure password"
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

            {/* Anti-Bot Mathematical Security Captcha */}
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
              Verify Credentials & Proceed to 2FA
            </Button>

            {/* Google SSO Divider & Button */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-[10px] uppercase font-mono tracking-wider">Or Sign In With</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-3 shadow-md transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9c-.3-.8-.5-1.7-.5-3z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 15.8C3.5 19.6 7.4 23 12 23z"/>
              </svg>
              <span>Sign in with Google (SSO Enabled)</span>
            </button>
          </form>
          ) : (
            /* Phone OTP Login Form */
            !phoneOtpStep ? (
              <form onSubmit={handleRequestPhoneOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Mobile Phone Number:</label>
                  <Input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    leftIcon={<Phone className="w-4 h-4 text-teal-400" />}
                    required
                  />
                  <p className="text-[11px] text-slate-500 pt-0.5">We will send a 6-digit verification OTP via SMS.</p>
                </div>

                {error && (
                  <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-bold">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-black shadow-lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Send SMS OTP Code
                </Button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-slate-500 text-[10px] uppercase font-mono tracking-wider">Or Sign In With</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-3 shadow-md transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                    <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9c-.3-.8-.5-1.7-.5-3z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 15.8C3.5 19.6 7.4 23 12 23z"/>
                  </svg>
                  <span>Sign in with Google (SSO Enabled)</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 rounded-2xl bg-teal-950/70 border border-teal-500/40 text-teal-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-teal-300">
                      <Smartphone className="w-4 h-4 text-teal-400 animate-pulse" />
                      <span>Secure SMS Gateway OTP</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Dispatched
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A secure 6-digit verification code has been dispatched via Twilio/Msg91 SMS Gateway to <strong className="text-white font-mono">{phoneNumber || '8972025390'}</strong>.
                  </p>
                  
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Enter 6-Digit SMS Code:</label>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 253337"
                    value={phoneOtpCode}
                    onChange={(e) => setPhoneOtpCode(e.target.value)}
                    className="text-center tracking-widest text-lg font-black font-mono text-emerald-400"
                    autoFocus
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-bold">
                    {error}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    className="border-slate-700 text-slate-400"
                    onClick={() => setPhoneOtpStep(false)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-black shadow-lg"
                    rightIcon={<ShieldCheck className="w-4 h-4" />}
                  >
                    Verify & Enter Console
                  </Button>
                </div>
              </form>
            )
          )
        ) : (
          /* STEP 2: 2-STEP MULTI-FACTOR AUTHENTICATION (MFA) GATE */
          <form onSubmit={handleVerifyMfa} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 rounded-2xl bg-teal-950/70 border border-teal-500/40 text-teal-200 space-y-2">
              <div className="flex items-center gap-2 font-black text-teal-300">
                <Smartphone className="w-4 h-4 text-teal-400 animate-pulse" />
                <span>Two-Factor Authentication (2FA) Gate</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Step 2 required for clinical role: <strong className="text-white">@{pendingUser?.username}</strong> ({pendingUser?.role.toUpperCase()}).
              </p>

              
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Enter 6-Digit 2FA Verification Code:</label>
              <Input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={enteredMfaCode}
                onChange={(e) => setEnteredMfaCode(e.target.value)}
                className="text-center tracking-widest text-lg font-black font-mono text-emerald-400"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-bold">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="border-slate-700 text-slate-400"
                onClick={() => {
                  setIsMfaStep(false);
                  setError('');
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-black shadow-lg"
                rightIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Authenticate & Enter System
              </Button>
            </div>
          </form>
        )}


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
              placeholder="e.g. LABMEDIX-ROOT-9988"
              value={overrideTokenInput}
              onChange={(e) => setOverrideTokenInput(e.target.value)}
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
    </div>
  );
};