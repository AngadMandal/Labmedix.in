import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Role, Permission } from '../types';
import { AuthService } from '../services/authService';
import { StorageService } from '../services/storage';
import { AuditService } from '../services/auditService';
import { checkUserPermission, checkUserModuleAccess, SystemModuleKey } from '../constants/roles';

// 15 Minutes Inactivity Limit (in milliseconds)
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
// Warning Threshold (1 minute before timeout)
const IDLE_WARNING_MS = 14 * 60 * 1000;
const LAST_ACTIVITY_KEY = 'labmedix_last_active_ts';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLocked: boolean;
  isIdleWarningOpen: boolean;
  idleSecondsRemaining: number;
  /** Legacy local username login */
  login: (username: string) => { success: boolean; error?: string };
  logout: () => Promise<void>;
  extendSession: () => void;
  lockScreen: () => void;
  unlockScreen: (pin: string) => boolean;
  can: (permission: Permission) => boolean;
  hasModuleAccess: (moduleKey: SystemModuleKey) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [isLocked, setIsLocked] = useState<boolean>(() => StorageService.isScreenLocked());
  const [isIdleWarningOpen, setIsIdleWarningOpen] = useState<boolean>(false);
  const [idleSecondsRemaining, setIdleSecondsRemaining] = useState<number>(60);

  const lastActivityRef = useRef<number>(Date.now());
  const idleCheckIntervalRef = useRef<any>(null);

  // Initialize and register activity
  const recordActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    } catch {}
    if (isIdleWarningOpen) {
      setIsIdleWarningOpen(false);
    }
  }, [isIdleWarningOpen]);

  useEffect(() => {
    StorageService.initializeDatabase();
    let user = StorageService.getCurrentUser();
    if (!user) {
      try {
        const storedLocked = localStorage.getItem('labmedix_auth_locked_user');
        if (storedLocked) {
          user = JSON.parse(storedLocked);
          if (user) StorageService.setCurrentUser(user);
        }
      } catch {}
    }
    if (user) {
      setCurrentUser(user);
      recordActivity();
    }
    // 🔒 SECURE STORAGE: Force-sync all data to IndexedDB backup on startup
    StorageService.forceSyncToIndexedDB().catch(() => {});
    // 🔄 AUTO-SYNC every 5 minutes (protects mobile users from browser eviction)
    const syncInterval = setInterval(() => {
      StorageService.forceSyncToIndexedDB().catch(() => {});
    }, 5 * 60 * 1000);
    return () => clearInterval(syncInterval);
  }, [recordActivity]);

  // ─────────────────────────────────────────────────────────────
  // 15-MINUTE SECURE IDLE TIMER ENGINE
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) {
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
      }
      setIsIdleWarningOpen(false);
      return;
    }

    // Activity event listeners with throttle
    let lastThrottledTime = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottledTime > 2000) {
        // throttle every 2 seconds
        lastThrottledTime = now;
        recordActivity();
      }
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click', 'wheel'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Check inactivity every 2 seconds
    idleCheckIntervalRef.current = setInterval(() => {
      const now = Date.now();
      let storedLast = now;
      try {
        const storedStr = localStorage.getItem(LAST_ACTIVITY_KEY);
        if (storedStr) {
          storedLast = parseInt(storedStr, 10) || now;
        }
      } catch {}

      const effectiveLastActivity = Math.max(lastActivityRef.current, storedLast);
      const elapsed = now - effectiveLastActivity;

      if (elapsed >= IDLE_TIMEOUT_MS) {
        // Inactivity limit reached: Lock screen to preserve permanent login session while protecting data
        clearInterval(idleCheckIntervalRef.current);
        AuditService.log(
          'SECURE_SESSION_LOCKED_IDLE',
          'security',
          `Automated Screen Lock activated: User ${currentUser.username} (${currentUser.fullName}) was inactive for 15 minutes. Session protected behind Screen Lock.`,
          currentUser.id
        );
        setIsLocked(true);
        StorageService.setScreenLocked(true);
        setIsIdleWarningOpen(false);
      } else if (elapsed >= IDLE_WARNING_MS) {
        // 60-second warning state
        const remainingSeconds = Math.max(0, Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000));
        setIdleSecondsRemaining(remainingSeconds);
        setIsIdleWarningOpen(true);
      } else {
        if (isIdleWarningOpen) {
          setIsIdleWarningOpen(false);
        }
      }
    }, 2000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
      }
    };
  }, [currentUser, recordActivity, isIdleWarningOpen]);

  const extendSession = () => {
    recordActivity();
    setIsIdleWarningOpen(false);
    AuditService.log(
      'SESSION_EXTENDED',
      'security',
      `Session extended by ${currentUser?.fullName || 'User'}`,
      currentUser?.id
    );
  };

  // ─────────────────────────────────────────────────────────────
  // LOCAL username login
  // ─────────────────────────────────────────────────────────────
  const login = (username: string) => {
    const res = AuthService.loginWithUsername(username);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsLocked(false);
      StorageService.setScreenLocked(false);
      recordActivity();
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // ─────────────────────────────────────────────────────────────
  // LOGOUT — local session clear
  // ─────────────────────────────────────────────────────────────
  const logout = async () => {
    AuthService.logout(); // clears localStorage session + audit log
    try {
      localStorage.removeItem('labmedix_auth_locked_user');
      localStorage.removeItem('labmedix_google_auth_locked');
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    } catch {}
    setCurrentUser(null);
    setIsIdleWarningOpen(false);
  };

  // ─────────────────────────────────────────────────────────────
  // Screen Lock (local only)
  // ─────────────────────────────────────────────────────────────
  const lockScreen = () => {
    setIsLocked(true);
    StorageService.setScreenLocked(true);
  };

  const unlockScreen = (pin: string) => {
    const valid = AuthService.verifyPin(pin);
    if (valid) {
      setIsLocked(false);
      StorageService.setScreenLocked(false);
      recordActivity();
      return true;
    }
    return false;
  };

  const can = (permission: Permission): boolean => {
    return checkUserPermission(currentUser, permission);
  };

  const hasModuleAccess = (moduleKey: SystemModuleKey): boolean => {
    return checkUserModuleAccess(currentUser, moduleKey);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLocked,
        isIdleWarningOpen,
        idleSecondsRemaining,
        login,
        logout,
        extendSession,
        lockScreen,
        unlockScreen,
        can,
        hasModuleAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};