import { Role, Permission } from '../types';

export interface RoleConfig {
  role: Role;
  name: string;
  badgeColor: string;
  description: string;
  permissions: Permission[];
}

export const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  super_admin: {
    role: 'super_admin',
    name: 'Super Admin',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    description: 'Full system control, database operations, user management, and company configuration.',
    permissions: ['all']
  },
  admin: {
    role: 'admin',
    name: 'Administrator',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    description: 'Full operational control over patients, cards, memberships, wallets, reports, EMR scheduling, and staff users.',
    permissions: [
      'patient_create', 'patient_read', 'patient_delete',
      'card_create', 'card_read', 'card_print', 'card_export', 'card_status_change', 'card_renew', 'card_replace',
      'wallet_read', 'wallet_credit', 'wallet_debit', 'wallet_adjust',
      'membership_manage', 'family_manage', 'backup_manage', 'settings_manage', 'audit_view',
      'reports_view', 'catalog_manage', 'package_manage'
    ]
  },
  doctor: {
    role: 'doctor',
    name: 'Licensed Physician / Doctor',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
    description: 'Exclusive clinical authority to diagnose, prescribe medications, modify dosages, order investigations, and sign official medical prescriptions.',
    permissions: [
      'patient_read', 'card_read', 'wallet_read',
      'emr_read', 'emr_create', 'emr_edit', 'emr_prescribe'
    ]
  },
  manager: {
    role: 'manager',
    name: 'Branch Manager',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
    description: 'Oversees daily patient operations, branch revenue, approvals, and staff audit reports.',
    permissions: [
      'patient_create', 'patient_read', 'patient_update',
      'card_create', 'card_read', 'card_print', 'card_export', 'card_status_change', 'card_renew', 'card_replace',
      'wallet_read', 'wallet_credit', 'wallet_debit',
      'membership_manage', 'family_manage', 'audit_view', 'reports_view', 'catalog_manage', 'package_manage'
    ]
  },
  reception: {
    role: 'reception',
    name: 'Front Desk Reception',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    description: 'Fast-track walk-in registrations, quick searches, card requests, and wallet deposits.',
    permissions: [
      'patient_create', 'patient_read', 'patient_update',
      'card_create', 'card_read', 'card_print', 'card_export',
      'wallet_read', 'wallet_credit',
      'family_manage'
    ]
  },
  lab_staff: {
    role: 'lab_staff',
    name: 'Laboratory Technician',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
    description: 'Verifies patient card membership for laboratory diagnostic testing discounts.',
    permissions: [
      'patient_read', 'card_read', 'wallet_read', 'wallet_debit', 'catalog_manage'
    ]
  },
  marketing: {
    role: 'marketing',
    name: 'Marketing Executive',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    description: 'Promotes health packages, tracks campaign registrations, and views card metrics.',
    permissions: [
      'patient_read', 'card_read', 'reports_view'
    ]
  },
  card_operator: {
    role: 'card_operator',
    name: 'CR80 Card Operator',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800',
    description: 'Specialist in high-resolution PVC CR80 card generation, batch printing, and exports.',
    permissions: [
      'patient_read', 'card_create', 'card_read', 'card_print', 'card_export', 'card_renew', 'card_replace'
    ]
  },
  read_only: {
    role: 'read_only',
    name: 'Auditor (Read Only)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    description: 'View-only access for compliance, inspection, and verification without edit privileges.',
    permissions: [
      'patient_read', 'card_read', 'wallet_read', 'audit_view', 'reports_view'
    ]
  }
};

export const MODULE_KEYS = [
  'dashboard',
  'patients',
  'emr',
  'test_master',
  'cards',
  'card_studio',
  'print_sheet',
  'memberships',
  'families',
  'wallet',
  'reports',
  'users',
  'integrations',
  'activity',
  'backup',
  'settings',
  'website_cms',
  'doctor_master',
  'cash_desk_vouchers'
] as const;

export type SystemModuleKey = typeof MODULE_KEYS[number];

export interface SystemModuleInfo {
  key: SystemModuleKey;
  name: string;
  href: string;
  category: 'clinical' | 'cards' | 'finance' | 'admin' | 'system';
  description: string;
  associatedPermissions: Permission[];
}

export const SYSTEM_MODULES: SystemModuleInfo[] = [
  {
    key: 'dashboard',
    name: 'Dashboard Overview',
    href: '/dashboard',
    category: 'admin',
    description: 'System KPI metrics, quick actions & registration chart.',
    associatedPermissions: ['all', 'patient_read']
  },
  {
    key: 'patients',
    name: 'Patients Management',
    href: '/patients',
    category: 'clinical',
    description: 'Patient directory, registration, search & medical profiles.',
    associatedPermissions: ['patient_read', 'patient_create', 'patient_update', 'patient_delete']
  },
  {
    key: 'emr',
    name: 'Doctor EMR & Rx',
    href: '/emr',
    category: 'clinical',
    description: 'Physician prescription pad, SOAP notes, appointments & queue.',
    associatedPermissions: ['emr_read', 'emr_create', 'emr_edit', 'emr_prescribe']
  },
  {
    key: 'doctor_master',
    name: 'Doctor Master & Commission',
    href: '/doctor-master',
    category: 'clinical',
    description: 'Physician master directory, auto credentials generator, consultation fees matrix, and blood commission ledger.',
    associatedPermissions: ['all', 'users_manage', 'emr_read']
  },
  {
    key: 'test_master',
    name: 'Test Master & Packages',
    href: '/test-master',
    category: 'clinical',
    description: 'Master diagnostic tests directory, rates, bulk upload, and Auto Health Package bundling engine.',
    associatedPermissions: ['all', 'catalog_manage', 'package_manage', 'patient_read']
  },
  {
    key: 'cards',
    name: 'Health Cards',
    href: '/cards',
    category: 'cards',
    description: 'Smart digital health cards directory, renewal & status control.',
    associatedPermissions: ['card_read', 'card_create', 'card_update', 'card_status_change', 'card_renew', 'card_replace']
  },
  {
    key: 'card_studio',
    name: 'CR80 PVC Studio',
    href: '/card-studio',
    category: 'cards',
    description: 'Dual-side live visual card canvas editor, themes & PNG export.',
    associatedPermissions: ['card_print', 'card_export']
  },
  {
    key: 'print_sheet',
    name: 'A4 Multi-Card Print',
    href: '/cards/print-sheet',
    category: 'cards',
    description: 'Batch 8-card grid layout for A4 PVC lamination printing.',
    associatedPermissions: ['card_print']
  },
  {
    key: 'memberships',
    name: 'Membership Plans',
    href: '/memberships',
    category: 'clinical',
    description: 'Silver, Gold, Platinum, VIP tier benefits & discount matrix.',
    associatedPermissions: ['membership_manage']
  },
  {
    key: 'families',
    name: 'Family Shield Groups',
    href: '/families',
    category: 'clinical',
    description: 'Shared household health coverage & dependent linking.',
    associatedPermissions: ['family_manage']
  },
  {
    key: 'wallet',
    name: 'Health Wallet & Float',
    href: '/wallet',
    category: 'finance',
    description: 'Prepaid balance ledger, top-up receipts & cashless POS deductions.',
    associatedPermissions: ['wallet_read', 'wallet_credit', 'wallet_debit', 'wallet_adjust']
  },
  {
    key: 'reports',
    name: 'Reports & Analytics',
    href: '/reports',
    category: 'admin',
    description: 'Revenue breakdowns, card issuance analytics & PDF/Excel exports.',
    associatedPermissions: ['reports_view']
  },
  {
    key: 'users',
    name: 'Staff & User Management',
    href: '/users',
    category: 'system',
    description: 'Role-based access, granular user permissions & security PINs.',
    associatedPermissions: ['users_manage']
  },
  {
    key: 'integrations',
    name: 'Integrations Hub',
    href: '/integrations',
    category: 'system',
    description: '25+ official API gateways (Zoho, WhatsApp, ABDM, Firebase, LIS).',
    associatedPermissions: ['settings_manage']
  },
  {
    key: 'activity',
    name: 'Audit & Activity Logs',
    href: '/activity',
    category: 'system',
    description: 'Immutable chronological event ledger & compliance history.',
    associatedPermissions: ['audit_view']
  },
  {
    key: 'backup',
    name: 'Backup & Restore',
    href: '/backup',
    category: 'system',
    description: 'Encrypted JSON/SQL snapshots, Cloud backups & disaster recovery.',
    associatedPermissions: ['backup_manage']
  },
  {
    key: 'settings',
    name: 'Company Settings',
    href: '/settings',
    category: 'system',
    description: 'Hospital branding, logo, hotline numbers & card defaults.',
    associatedPermissions: ['settings_manage']
  },
  {
    key: 'website_cms',
    name: '3D Website & CMS Studio',
    href: '/website-cms',
    category: 'system',
    description: 'Super Admin Live 3D Website Customizer, Hero announcements, Card tiers pricing & Public CMS.',
    associatedPermissions: ['all', 'settings_manage']
  },
  {
    key: 'cash_desk_vouchers',
    name: 'Cash Desk Voucher Engine',
    href: '/cash-desk-vouchers',
    category: 'finance',
    description: 'Super Admin High-Security Cryptographic PIN Voucher Generator, Batch Issuer & Cash Desk POS Redemption.',
    associatedPermissions: ['all', 'voucher_manage']
  }
];

export const ROLE_DEFAULT_MODULES: Record<Role, SystemModuleKey[]> = {
  super_admin: [
    'dashboard', 'patients', 'doctor_master', 'test_master', 'cards', 'card_studio', 'print_sheet',
    'memberships', 'families', 'wallet', 'reports', 'users', 'website_cms', 'integrations',
    'activity', 'settings', 'cash_desk_vouchers'
  ],
  admin: [
    'dashboard', 'patients', 'doctor_master', 'test_master', 'cards', 'card_studio', 'print_sheet',
    'memberships', 'families', 'wallet', 'reports', 'integrations',
    'activity', 'backup', 'settings'
  ],
  doctor: ['emr', 'dashboard', 'patients', 'cards', 'wallet'],
  reception: ['dashboard', 'patients', 'cards', 'card_studio', 'print_sheet', 'wallet', 'families'],
  manager: ['dashboard', 'patients', 'cards', 'card_studio', 'print_sheet', 'memberships', 'families', 'wallet', 'reports', 'activity'],
  lab_staff: ['dashboard', 'patients', 'cards', 'wallet', 'test_master'],
  marketing: ['dashboard', 'patients', 'cards', 'reports'],
  card_operator: ['dashboard', 'patients', 'cards', 'card_studio', 'print_sheet'],
  read_only: ['dashboard', 'patients', 'cards', 'wallet', 'reports', 'activity']
};

export function hasPermission(userRole: Role, permission: Permission): boolean {
  if (userRole === 'super_admin') return true;
  const config = ROLE_CONFIGS[userRole];
  if (!config) return false;
  if (config.permissions.includes('all')) return true;
  return config.permissions.includes(permission);
}

export function checkUserPermission(user: { role: Role; customPermissions?: Permission[]; allowedModules?: string[] } | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (user.customPermissions && user.customPermissions.length > 0) {
    if (user.customPermissions.includes('all')) return true;
    return user.customPermissions.includes(permission);
  }
  return hasPermission(user.role, permission);
}

export function checkUserModuleAccess(user: { role: Role; allowedModules?: string[] } | null | undefined, moduleKey: SystemModuleKey): boolean {
  if (!user) return false;
  if (moduleKey === 'dashboard') return true; // Dashboard accessible to all authenticated staff
  // Doctor EMR is strictly reserved for doctors
  if (moduleKey === 'emr') {
    return user.role === 'doctor' || (user.allowedModules ? user.allowedModules.includes('emr') : false);
  }
  if (user.role === 'super_admin') return true;
  if (user.allowedModules && user.allowedModules.length > 0) {
    return user.allowedModules.includes(moduleKey);
  }
  const defaults = ROLE_DEFAULT_MODULES[user.role] || ['dashboard'];
  return defaults.includes(moduleKey);
}