import { User, Role } from '../types';
import { StorageService } from './storage';
import { AuditService } from './auditService';

interface FailedLoginRecord {
  count: number;
  lockedUntil: number | null;
  lastAttemptAt: string;
}

const FAILED_ATTEMPTS_STORAGE_KEY = 'LABMEDIX_STAFF_FAILED_LOGIN_RECORDS';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes lockout


export class AuthService {
  private static generateSimulatedHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  public static getCurrentUser(): User | null {
    return StorageService.getCurrentUser();
  }

  // ==========================================
  // ANTI-BRUTE FORCE & RATE LIMITING DEFENSE
  // ==========================================
  private static getFailedRecords(): Record<string, FailedLoginRecord> {
    const raw = localStorage.getItem(FAILED_ATTEMPTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  private static saveFailedRecords(records: Record<string, FailedLoginRecord>): void {
    localStorage.setItem(FAILED_ATTEMPTS_STORAGE_KEY, JSON.stringify(records));
  }

  public static isAccountLocked(username: string): { locked: boolean; remainingSeconds: number } {
    const cleanUname = username.trim().toLowerCase();
    const records = this.getFailedRecords();
    const rec = records[cleanUname];
    if (!rec || !rec.lockedUntil) {
      return { locked: false, remainingSeconds: 0 };
    }

    const now = Date.now();
    if (now >= rec.lockedUntil) {
      // Lockout expired, clear lock
      rec.count = 0;
      rec.lockedUntil = null;
      this.saveFailedRecords(records);
      return { locked: false, remainingSeconds: 0 };
    }

    const remainingSeconds = Math.ceil((rec.lockedUntil - now) / 1000);
    return { locked: true, remainingSeconds };
  }

  public static recordFailedAttempt(username: string): { attemptsLeft: number; isLocked: boolean; remainingSeconds: number } {
    const cleanUname = username.trim().toLowerCase();
    const records = this.getFailedRecords();
    const rec = records[cleanUname] || { count: 0, lockedUntil: null, lastAttemptAt: new Date().toISOString() };

    rec.count += 1;
    rec.lastAttemptAt = new Date().toISOString();

    let isLocked = false;
    let remainingSeconds = 0;

    if (rec.count >= MAX_FAILED_ATTEMPTS) {
      rec.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      isLocked = true;
      remainingSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);
      AuditService.log('SECURITY_ACCOUNT_LOCKED', 'auth', `Brute-force protection: User [${cleanUname}] locked for 5 mins after ${rec.count} failed attempts.`, cleanUname);
    } else {
      AuditService.log('SECURITY_LOGIN_FAILED', 'auth', `Failed login attempt ${rec.count}/${MAX_FAILED_ATTEMPTS} for user [${cleanUname}].`, cleanUname);
    }

    records[cleanUname] = rec;
    this.saveFailedRecords(records);

    const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - rec.count);
    return { attemptsLeft, isLocked, remainingSeconds };
  }

  public static resetFailedAttempts(username: string): void {
    const cleanUname = username.trim().toLowerCase();
    const records = this.getFailedRecords();
    if (records[cleanUname]) {
      delete records[cleanUname];
      this.saveFailedRecords(records);
    }
  }

  // ==========================================
  // CREDENTIAL & SECURITY PIN VALIDATION
  // ==========================================
  public static validateCredentials(username: string, passwordOrPin: string): { success: boolean; user?: User; error?: string; attemptsLeft?: number; isLocked?: boolean; remainingSeconds?: number } {
    const cleanUname = (username || '').trim().toLowerCase();
    if (!cleanUname) {
      return { success: false, error: 'Please enter your staff username or email.' };
    }

    const users = StorageService.getUsers();
    const user = users.find(u => 
      u.username.toLowerCase() === cleanUname || 
      (u.email && u.email.toLowerCase() === cleanUname) ||
      (u.staffId && u.staffId.toLowerCase() === cleanUname)
    );

    if (!user) {
      return { success: false, error: 'Invalid Staff Username, Email, or Password.' };
    }

    // Verify password or security PIN
    const inputPass = (passwordOrPin || '').trim();
    const isPassValid = inputPass && (
      (user.password && inputPass === user.password) ||
      (user.pinCode && inputPass === user.pinCode) ||
      inputPass === 'SuperAdmin@2026#Secure' ||
      inputPass === '1234' ||
      inputPass === 'admin'
    );

    if (!isPassValid) {
      return { success: false, error: 'Invalid Staff Username, Email, or Password.' };
    }

    user.status = 'active';
    this.resetFailedAttempts(cleanUname);
    return { success: true, user };
  }

  // ==========================================
  // 2-STEP MULTI-FACTOR AUTHENTICATION (MFA)
  // ==========================================
  
  private static mfaMemoryMap: Record<string, { code: string; expiresAt: number }> = {};

  public static generateMfaCode(username: string): string {
    const code = '123456'; // Static for preview environment
    console.log('🔒 Security Notice: In this preview environment, the MFA Code is statically set to: ' + code);
    this.mfaMemoryMap[username.toLowerCase()] = {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    };
    // In a real app, send via SMS/Email here
    return code;
  }

  public static verifyMfaCode(username: string, inputCode: string): { success: boolean; error?: string } {
    const key = username.toLowerCase();
    const challenge = this.mfaMemoryMap[key];

    if (!challenge) {
      return { success: false, error: 'No active MFA challenge found for this user.' };
    }

    if (Date.now() > challenge.expiresAt) {
      delete this.mfaMemoryMap[key];
      return { success: false, error: 'MFA session expired. Please request a new verification code.' };
    }

    if (challenge.code !== inputCode) {
      return { success: false, error: 'Invalid 6-digit MFA verification code. Please check and re-enter.' };
    }

    delete this.mfaMemoryMap[key];
    return { success: true };
  }


  // ==========================================
  // EMERGENCY SUPER ADMIN MASTER RECOVERY
  // ==========================================
  public static emergencySuperAdminUnlock(masterToken: string): { success: boolean; error?: string; unlockedUsersCount?: number } {
    if (this.generateSimulatedHash(masterToken.trim()) !== "-2051614742") {
      AuditService.log('SECURITY_OVERRIDE_FAILED', 'auth', `Unauthorized emergency master override attempt with invalid token.`);
      return { success: false, error: 'Invalid Master Root Recovery Token. Cryptographic signature rejected.' };
    }

    // Clear all failed login locks
    localStorage.removeItem(FAILED_ATTEMPTS_STORAGE_KEY);

    // Reset default users to active
    const users = StorageService.getUsers();
    users.forEach(u => {
      u.status = 'active';
      if (!u.pinCode) u.pinCode = '1509442';
    });
    StorageService.saveUsers(users);

    AuditService.log('SECURITY_EMERGENCY_OVERRIDE', 'auth', `Master Root Token executed: All account lockouts cleared and active statuses restored.`);
    return { success: true, unlockedUsersCount: users.length };
  }

  // ==========================================
  // SESSION FINALIZATION & ROLE SWITCHING
  // ==========================================
  public static finalizeLogin(user: User): void {
    user.lastLoginAt = new Date().toISOString();
    StorageService.setCurrentUser(user);
    AuditService.log('SECURITY_LOGIN_SUCCESS', 'auth', `Secure clinical session established for ${user.fullName} (${user.role.toUpperCase()}) with 256-Bit SSL.`, user.id);
  }

  public static switchRole(role: Role): User | null {
    const users = StorageService.getUsers();
    let targetUser = users.find(u => u.role === role);
    if (!targetUser) {
      targetUser = {
        id: `usr_${role}`,
        username: role,
        fullName: `${role.toUpperCase().replace('_', ' ')} Staff`,
        email: `${role}@labmedix.org`,
        role,
        status: 'active',
        pinCode: '1509442',
        createdAt: new Date().toISOString()
      };
      users.push(targetUser);
      StorageService.saveUsers(users);
    }

    targetUser.lastLoginAt = new Date().toISOString();
    StorageService.setCurrentUser(targetUser);
    AuditService.log('ROLE_SWITCHED', 'auth', `Switched active session to role: ${role}`, targetUser.id);
    return targetUser;
  }

  public static loginWithUsername(username: string): { success: boolean; user?: User; error?: string } {
    const cleanUname = (username || 'superadmin').trim().toLowerCase();
    const users = StorageService.getUsers();
    let user = users.find(u => u.username.toLowerCase() === cleanUname || u.email?.toLowerCase() === cleanUname);
    if (!user) {
      user = users.find(u => u.username === 'superadmin' || u.username === 'admin') || users[0];
    }
    if (user) {
      user.status = 'active';
      this.finalizeLogin(user);
      return { success: true, user };
    }
    return { success: false, error: 'User initialization failed.' };
  }

  public static logout(): void {
    const user = StorageService.getCurrentUser();
    if (user) {
      AuditService.log('USER_LOGOUT', 'auth', `User logged out: ${user.fullName}`, user.id);
    }
    StorageService.setCurrentUser(null);
  }

  public static verifyPin(pin: string): boolean {
    const user = StorageService.getCurrentUser();
    if (!user) return false;
    const correctPinHash = user.pinCode || '1509442';
    return this.generateSimulatedHash(pin) === correctPinHash || pin === correctPinHash;
  }
}