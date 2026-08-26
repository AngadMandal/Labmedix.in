import { User, Role } from '../types';
import { StorageService } from './storage';
import { AuditService } from './auditService';
import { generateUuid } from '../utils/idGenerator';

export class UserService {
  public static getAll(): User[] {
    return StorageService.getUsers();
  }

  public static getById(id: string): User | undefined {
    return StorageService.getUsers().find(u => u.id === id);
  }

  public static generateStaffId(): string {
    const users = StorageService.getUsers();
    const count = users.length + 1;
    return `LMDX-STF-${String(count).padStart(3, '0')}`;
  }

  public static createUser(userData: {
    username: string;
    fullName: string;
    email: string;
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
  }): { user: User; error?: string } {
    const users = StorageService.getUsers();
    const existing = users.find(u => u.username.toLowerCase() === userData.username.trim().toLowerCase());
    if (existing) {
      return { user: null as any, error: `Username "${userData.username}" already exists.` };
    }

    const company = StorageService.getCompanyProfile();
    const now = new Date();
    const validityMonths = company.cardValidityMonths || 36;
    const expDate = new Date(now);
    expDate.setMonth(expDate.getMonth() + validityMonths);

    const newUser: User = {
      id: `usr_${generateUuid().slice(0, 8)}`,
      staffId: this.generateStaffId(),
      username: userData.username.trim().toLowerCase(),
      fullName: userData.fullName.trim(),
      email: userData.email.trim(),
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
      joiningDate: userData.joiningDate || now.toISOString().slice(0, 10),
      expiryDate: userData.expiryDate || expDate.toISOString().slice(0, 10),
      emergencyContact: userData.emergencyContact?.trim() || '9830099999',
      emergencyContactName: userData.emergencyContactName?.trim() || 'Immediate Family',
      cardThemeWish: userData.cardThemeWish || 'premium_medical',
      cardMaterialWish: userData.cardMaterialWish || 'gloss',
      createdAt: now.toISOString()
    };

    users.push(newUser);
    StorageService.saveUsers(users);

    AuditService.log('USER_CREATED', 'users', `Created new staff user: ${newUser.fullName} (${newUser.role}) [ID: ${newUser.staffId}]`, newUser.id);
    return { user: newUser };
  }

  public static updateUser(id: string, updates: Partial<User>): User | null {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates
    };
    StorageService.saveUsers(users);

    AuditService.log('USER_UPDATED', 'users', `Updated staff account for ${users[index].fullName}`, id);
    return users[index];
  }

  public static resetPin(id: string, newPin: string): boolean {
    const users = StorageService.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return false;

    user.pinCode = newPin;
    StorageService.saveUsers(users);

    AuditService.log('USER_PIN_RESET', 'users', `Reset security PIN for ${user.fullName}`, id);
    return true;
  }

  public static toggleStatus(id: string): User | null {
    const users = StorageService.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return null;

    user.status = user.status === 'active' ? 'inactive' : 'active';
    StorageService.saveUsers(users);

    AuditService.log('USER_STATUS_CHANGED', 'users', `Toggled account status of ${user.fullName} to ${user.status}`, id);
    return user;
  }

  public static deleteUser(id: string): boolean {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;

    const deleted = users.splice(index, 1)[0];
    StorageService.saveUsers(users);

    AuditService.log('USER_DELETED', 'users', `Deleted staff account ${deleted.fullName} (${deleted.staffId || deleted.id})`, id);
    return true;
  }
}