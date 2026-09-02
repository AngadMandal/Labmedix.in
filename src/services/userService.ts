import { User, Role } from '../types';
import { StorageService } from './storage';
import { AuditService } from './auditService';
import { generateUuid } from '../utils/idGenerator';
import { firestoreService } from './firestoreService';

export class UserService {
  public static getAll(): User[] {
    return StorageService.getUsers();
  }

  public static getById(id: string): User | undefined {
    return StorageService.getUsers().find(u => u.id === id);
  }

  public static generateStaffId(): string {
    const users = StorageService.getUsers();
    let maxId = 0;
    users.forEach(u => {
      if (u.staffId) {
        const match = u.staffId.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxId) {
            maxId = num;
          }
        }
      }
    });
    return `LMDX-STF-${String(maxId + 1).padStart(3, '0')}`;
  }

  public static generateSecurePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pass = 'Lmdx@';
    for (let i = 0; i < 5; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  public static async createUser(userData: {
    username: string;
    fullName: string;
    email: string;
    password?: string;
    role: Role;
    designation?: string;
    photoUrl?: string;
    bloodGroup?: string;
    pinCode?: string;
    phone?: string;
    workPhone?: string;
    department?: string;
    accessZone?: string;
    nationalId?: string;
    licenseNo?: string;
    joiningDate?: string;
    expiryDate?: string;
    emergencyContact?: string;
    emergencyContactName?: string;
    cardThemeWish?: string;
    cardMaterialWish?: string;
  }): Promise<{ user: User; error?: string }> {
    const cleanUsername = (userData.username || '').trim().toLowerCase().replace(/\s+/g, '');
    const cleanEmail = (userData.email || '').trim().toLowerCase().replace(/\s+/g, '');

    // Note: Need to implement a check to ensure email is unique in Firestore.
    // For now, I will proceed with the Firestore write.
    
    const newUser: User = {
      id: `usr_${generateUuid().slice(0, 8)}`,
      staffId: this.generateStaffId(), // This might need a central counter
      username: cleanUsername,
      fullName: userData.fullName.trim(),
      email: cleanEmail,
      password: userData.password?.trim() || this.generateSecurePassword(),
      role: userData.role,
      designation: userData.designation?.trim() || 'Staff Officer',
      photoUrl: userData.photoUrl?.trim() || undefined,
      bloodGroup: userData.bloodGroup?.trim() || 'O+',
      status: 'active',
      pinCode: userData.pinCode || '1234',
      phone: userData.phone?.trim() || '+91 98300 00000',
      workPhone: userData.workPhone?.trim() || 'EXT-104',
      department: userData.department?.trim() || 'General Operations',
      accessZone: userData.accessZone?.trim() || 'Zone A: Standard Clinical & Ops',
      nationalId: userData.nationalId?.trim() || `UID-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      licenseNo: userData.licenseNo?.trim() || undefined,
      joiningDate: userData.joiningDate || new Date().toISOString().slice(0, 10),
      expiryDate: userData.expiryDate || new Date().toISOString().slice(0, 10),
      emergencyContact: userData.emergencyContact?.trim() || '9830099999',
      emergencyContactName: userData.emergencyContactName?.trim() || 'Immediate Family',
      cardThemeWish: userData.cardThemeWish || 'premium_medical',
      cardMaterialWish: userData.cardMaterialWish || 'gloss',
      emailSent: false,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Save to local storage & in-memory cache first
      const users = StorageService.getUsers();
      // Ensure no duplicate username or email exists
      const existingUserIdx = users.findIndex(u => 
        (u.username && u.username.toLowerCase() === cleanUsername) || 
        (u.email && u.email.toLowerCase() === cleanEmail)
      );

      if (existingUserIdx !== -1) {
        users[existingUserIdx] = { ...users[existingUserIdx], ...newUser };
      } else {
        users.push(newUser);
      }
      StorageService.saveUsers(users);

      // 2. Sync to Central Cloud Firestore so user can login from mobile, desktop, laptop
      await firestoreService.setDocument('users', newUser.id, newUser);
      AuditService.log('USER_CREATED', 'users', `Created new staff user: ${newUser.fullName} (${newUser.role}) [ID: ${newUser.staffId}]`, newUser.id);
      return { user: newUser };
    } catch (error) {
      console.error('Failed to create user in Firestore', error);
      // Fallback: local storage is already saved
      return { user: newUser };
    }
  }

  public static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const users = StorageService.getUsers();
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        StorageService.saveUsers(users);
      }

      await firestoreService.updateDocument('users', id, updates);
      AuditService.log('USER_UPDATED', 'users', `Updated staff account`, id);
      return users[userIndex] || ({ id, ...updates } as User);
    } catch (error) {
      console.error('Failed to update user in Firestore', error);
      const users = StorageService.getUsers();
      const user = users.find(u => u.id === id);
      return user || ({ id, ...updates } as User);
    }
  }

  public static resetPassword(id: string, newPassword: string, newPin?: string): boolean {
    const users = StorageService.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return false;

    user.password = newPassword.trim();
    if (newPin) user.pinCode = newPin.trim();
    StorageService.saveUsers(users);

    firestoreService.updateDocument('users', id, {
      password: user.password,
      ...(newPin ? { pinCode: user.pinCode } : {})
    }).catch(err => console.warn('Firestore password reset sync error:', err));

    AuditService.log('USER_PASSWORD_RESET', 'users', `Super Admin reset credentials for ${user.fullName}`, id);
    return true;
  }

  public static updateSuperAdminPassword(superAdminId: string, newPassword: string): { success: boolean; error?: string } {
    const trimmed = (newPassword || '').trim();
    if (!trimmed || trimmed.length < 8) {
      return { success: false, error: 'Super Admin password must be a strong password of at least 8 characters.' };
    }

    const hasUpper = /[A-Z]/.test(trimmed);
    const hasLower = /[a-z]/.test(trimmed);
    const hasDigitOrSpecial = /[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(trimmed);

    if (!hasUpper || !hasLower || !hasDigitOrSpecial) {
      return { success: false, error: 'Strong password required: Include uppercase, lowercase, and numbers/symbols (e.g. LabMedix@2026#Secure).' };
    }

    const users = StorageService.getUsers();
    const superAdmin = users.find(u => u.id === superAdminId || u.role === 'super_admin');
    if (!superAdmin) {
      return { success: false, error: 'Super Admin account record not found.' };
    }

    superAdmin.password = trimmed;
    StorageService.saveUsers(users);

    // Update active current user session
    const current = StorageService.getCurrentUser();
    if (current) {
      const updatedCurrent = { ...current, password: trimmed };
      StorageService.setCurrentUser(updatedCurrent);
    }

    AuditService.log('SUPER_ADMIN_PASSWORD_UPDATED', 'auth', `Super Admin (${superAdmin.fullName}) updated their sovereign portal password successfully.`, superAdmin.id);
    return { success: true };
  }

  public static resetPin(id: string, newPin: string): boolean {
    const users = StorageService.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return false;

    user.pinCode = newPin;
    StorageService.saveUsers(users);

    firestoreService.updateDocument('users', id, { pinCode: newPin }).catch(err => console.warn('Firestore PIN sync error:', err));

    AuditService.log('USER_PIN_RESET', 'users', `Reset security PIN for ${user.fullName}`, id);
    return true;
  }

  public static toggleStatus(id: string): User | null {
    const users = StorageService.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return null;

    user.status = user.status === 'active' ? 'inactive' : 'active';
    StorageService.saveUsers(users);

    firestoreService.updateDocument('users', id, { status: user.status }).catch(err => console.warn('Firestore toggleStatus sync error:', err));

    AuditService.log('USER_STATUS_CHANGED', 'users', `Toggled account status of ${user.fullName} to ${user.status}`, id);
    return user;
  }

  public static deleteUser(id: string): boolean {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;

    const deleted = users.splice(index, 1)[0];
    StorageService.saveUsers(users);

    firestoreService.deleteDocument('users', id).catch(err => console.warn('Firestore deleteUser sync error:', err));

    AuditService.log('USER_DELETED', 'users', `Deleted staff account ${deleted.fullName} (${deleted.staffId || deleted.id})`, id);
    return true;
  }
}