export type Role =
  | 'super_admin'
  | 'admin'
  | 'doctor'
  | 'manager'
  | 'reception'
  | 'lab_staff'
  | 'marketing'
  | 'card_operator'
  | 'read_only';

export type Permission =
  | 'all'
  | 'patient_create'
  | 'patient_read'
  | 'patient_update'
  | 'patient_delete'
  | 'card_create'
  | 'card_read'
  | 'card_update'
  | 'card_print'
  | 'card_export'
  | 'card_status_change'
  | 'card_renew'
  | 'card_replace'
  | 'wallet_read'
  | 'wallet_credit'
  | 'wallet_debit'
  | 'wallet_adjust'
  | 'membership_manage'
  | 'family_manage'
  | 'backup_manage'
  | 'settings_manage'
  | 'audit_view'
  | 'users_manage'
  | 'reports_view'
  | 'emr_read'
  | 'emr_create'
  | 'emr_edit'
  | 'emr_prescribe'
  | 'catalog_manage'
  | 'package_manage'
  | 'voucher_manage'
  | 'voucher_redeem';

export interface User {
  id: string;
  staffId?: string;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  designation?: string;
  avatar?: string;
  photoUrl?: string;
  bloodGroup?: string;
  status: 'active' | 'inactive';
  pinCode?: string;
  createdAt: string;
  lastLoginAt?: string;
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
  customPermissions?: Permission[];
  allowedModules?: string[];
}

export interface Address {
  villageArea: string;
  postOffice: string;
  policeStation: string;
  district: string;
  state: string;
  pinCode: string;
  fullAddress: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  mobile: string;
}

export interface MedicalInfo {
  allergies?: string;
  importantNotes?: string;
  chronicConditions?: string;
  emergencyNotes?: string;
  bloodGroup: string;
}

export interface Patient {
  id: string; // e.g. LMDX-2026-000001
  fullName: string;
  dob: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  mobile: string;
  whatsapp?: string;
  email?: string;
  bloodGroup: string;
  photoUrl: string;
  address: Address;
  emergencyContact: EmergencyContact;
  medicalInfo: MedicalInfo;
  portalPassword?: string;
  maritalStatus?: string;
  occupation?: string;
  governmentIdType?: string;
  governmentIdNumber?: string;
  referral?: {
    source: string;
    name?: string;
    details?: string;
    contact?: string;
    cardNo?: string;
    doctorId?: string;
    notes?: string;
  };
  vitalsAtReg?: {
    bp?: string;
    pulse?: number;
    rbs?: string;
    spo2?: number;
    weight?: number;
    height?: number;
    bmi?: number;
  };
  familyId?: string;
  isFamilyHead?: boolean;
  healthCardId?: string;
  walletId: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type CardStatus =
  | 'active'
  | 'pending'
  | 'expired'
  | 'suspended'
  | 'lost'
  | 'replaced'
  | 'cancelled'
  | 'deleted';

export type CardMaterial = 'gloss' | 'matte' | 'metallic' | 'hologram';

export type CardThemePreset =
  | 'executive_navy'
  | 'emerald_health'
  | 'royal_gold'
  | 'platinum_elite'
  | 'clean_minimal'
  | 'crimson_care';

export interface CardDesignConfig {
  preset: CardThemePreset;
  material: CardMaterial;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  showChip: boolean;
  showContactless: boolean;
  showEmergencyBadge: boolean;
  showBarcode: boolean;
  showSignatureStrip: boolean;
  showFamilyBadge?: boolean;
  customTagline?: string;
}

export interface CardStatusHistory {
  id: string;
  cardId: string;
  date: string;
  previousStatus: CardStatus;
  newStatus: CardStatus;
  changedBy: string;
  reason: string;
}

export interface HealthCard {
  id: string;
  cardNumber: string; // e.g. LHC-2026-000001
  patientId: string;
  membershipId: string;
  issueDate: string;
  expiryDate: string;
  status: CardStatus;
  cvv: string; // 3-digit security code on card back
  verificationCode: string; // e.g. VER-8942-1049
  nfcUid?: string; // 7-byte contactless chip hex UID e.g. 04:E2:89:1A:B5:4C:80
  nfcStandard?: 'ISO/IEC 14443 Type A' | 'MIFARE Classic 1K/4K' | 'NTAG213/215/216' | 'FeliCa';
  nfcPayload?: string; // Contactless tap URL or encoded payload
  designConfig: CardDesignConfig;
  statusHistory: CardStatusHistory[];
  replacedByCardId?: string;
  replacesCardId?: string;
  replacementReason?: string;
  renewedCount: number;
  lastRenewedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deleteReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  name: string;
  slug: string;
  validityMonths: number;
  registrationFee: number;
  annualRenewalFee: number;
  opdDiscount: number;
  labDiscount: number;
  pharmacyDiscount: number;
  homeCollectionDiscount: number;
  specialBenefits: string[];
  color: string;
  badgeIcon: string;
  isFamilyPlan: boolean;
  maxFamilyMembers?: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface FamilyMemberLink {
  patientId: string;
  relationship: string;
  isPrimary: boolean;
}

export interface FamilyGroup {
  id: string;
  familyName: string;
  primaryPatientId: string;
  members: FamilyMemberLink[];
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'credit' | 'debit' | 'refund' | 'adjustment';

export interface WalletTransaction {
  id: string;
  walletId: string;
  patientId: string;
  type: TransactionType;
  amount: number;
  openingBalance: number;
  closingBalance: number;
  referenceNo: string;
  notes: string;
  date: string;
  createdBy: string;
  grossAmount?: number;
  discountAmount?: number;
  discountPercentage?: number;
  paidAmount?: number;
  dueAmount?: number;
  paymentStatus?: 'paid' | 'partial_due' | 'unpaid_due';
  verificationStatus?: 'verified' | 'pending_verification' | 'failed';
  utrNumber?: string;
  gatewaySignature?: string;
  paymentChannel?: string;
  verifiedAt?: string;
}

export interface Wallet {
  id: string;
  patientId: string;
  balance: number;
  totalCredits: number;
  totalDebits: number;
  totalDue?: number;
  status: 'active' | 'frozen';
  createdAt: string;
  updatedAt: string;
}

export type AuditModule =
  | 'auth'
  | 'patient'
  | 'card'
  | 'membership'
  | 'wallet'
  | 'family'
  | 'backup'
  | 'settings'
  | 'security'
  | 'users'
  | 'clinical'
  | 'portal';

export type AuditSeverity = 'info' | 'financial' | 'security' | 'warning' | 'critical';

export interface AuditLog {
  id: string;
  index?: number;
  action: string;
  module: AuditModule;
  severity?: AuditSeverity;
  userId: string;
  userName: string;
  userRole?: string;
  timestamp: string;
  referenceId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  prevHash?: string;
  hash?: string;
  metadata?: Record<string, any>;
}

export interface ZohoPaymentConfig {
  enabled: boolean;
  environment: 'production' | 'sandbox';
  isConnected?: boolean;
  authStatus?: 'authenticated' | 'disconnected' | 'pending';
  connectedEmail?: string;
  merchantAccountId: string;
  accountHolderName: string;
  apiKey: string;
  signingKey: string;
  webhookUrl: string;
  autoCapture: boolean;
  enableUpi: boolean;
  enableCards: boolean;
  enableNetBanking: boolean;
  enableInternational: boolean;
  settlementSchedule: 'instant' | 't1' | 't2';
  settlementBank?: string;
  lastPingStatus?: 'online' | 'error' | 'untested';
  lastPingLatencyMs?: number;
  lastPingTimestamp?: string;
}

export interface CompanyProfile {
  name: string;
  tagline: string;
  estdYear: string;
  logoUrl: string;
  subtitle: string;
  address: string;
  postOffice: string;
  policeStation: string;
  district: string;
  state: string;
  pinCode: string;
  phone: string;
  helpline: string;
  ambulanceHelpline?: string;
  bloodBankHelpline?: string;
  whatsapp: string;
  email: string;
  website: string;
  registrationNo: string;
  isoCertification?: string;
  clinicalLicenseNo?: string;
  gstin?: string;
  cardValidityMonths?: number;
  cardFooterNotice?: string;
  cardSecurityWatermark?: string;
  currencySymbol?: string;
  services: {
    id: string;
    title: string;
    icon: string;
    description: string;
  }[];
  termsAndConditions: string[];
  zohoPayments?: ZohoPaymentConfig;
  nfcSettings?: NFCSettings;
  upiSettings?: UpiMerchantSettings;
}

export interface UpiMerchantSettings {
  enabled: boolean;
  merchantVpa: string;
  merchantName: string;
  merchantMcc?: string;
  googlePayMerchantId?: string;
  googlePayBusinessName?: string;
  enableDeepLinks?: boolean;
  autoVerifySimulation?: boolean;
}

export interface NFCSettings {
  enabled: boolean;
  defaultStandard: 'ISO/IEC 14443 Type A' | 'MIFARE Classic 1K/4K' | 'NTAG213/215/216' | 'FeliCa';
  frequency: string; // '13.56 MHz'
  payloadType: 'verification_url' | 'deep_link' | 'ndef_json' | 'vcard';
  autoWriteOnIssue: boolean;
  securityKey: string;
  enableWebNfcApi: boolean;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
}

export interface BackupData {
  version: string;
  backupVersion: string;
  createdDate: string;
  checksum?: string;
  sizeBytes?: number;
  recordCounts: {
    patients: number;
    healthCards: number;
    memberships: number;
    families: number;
    wallets: number;
    walletTransactions: number;
    auditLogs: number;
    users: number;
  };
  data: {
    patients: Patient[];
    healthCards: HealthCard[];
    memberships: Membership[];
    families: FamilyGroup[];
    wallets: Wallet[];
    walletTransactions: WalletTransaction[];
    auditLogs: AuditLog[];
    companyProfile: CompanyProfile;
    users: User[];
  };
}

export interface SnapshotRecord {
  id: string;
  timestamp: string;
  title: string;
  tag?: 'manual' | 'pre-restore' | 'eod' | 'system' | 'cloud_sync';
  sizeBytes?: number;
  recordCounts: Record<string, number>;
  data: BackupData;
  isCloudSynced?: boolean;
  cloudSyncTimestamp?: string;
  checksum?: string;
}

export interface VerificationResult {
  verified: boolean;
  type?: 'health_card' | 'staff_pass';
  cardStatus: CardStatus | 'not_found';
  message: string;
  verificationCode: string;
  card?: HealthCard;
  patient?: {
    fullName: string;
    maskedPatientId: string;
    maskedCardNumber: string;
    bloodGroup: string;
    gender: string;
    age: number;
    photoUrl?: string;
  };
  staff?: {
    id: string;
    staffId: string;
    fullName: string;
    username: string;
    role: Role;
    designation: string;
    department: string;
    accessZone?: string;
    nationalId?: string;
    licenseNo?: string;
    bloodGroup?: string;
    photoUrl?: string;
    status: 'active' | 'inactive';
    email: string;
    phone?: string;
    workPhone?: string;
    emergencyContact?: string;
    emergencyContactName?: string;
    joiningDate?: string;
    cardThemeWish?: string;
    cardMaterialWish?: string;
  };
  membership?: {
    name: string;
    color: string;
    opdDiscount: number;
    labDiscount: number;
    pharmacyDiscount: number;
    homeCollectionDiscount: number;
    specialBenefits: string[];
  };
  issueDate?: string;
  expiryDate?: string;
  company: CompanyProfile;
}

export interface PrescribedMedication {
  id: string;
  name: string;
  composition?: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration: string;
  instructions?: string;
}

export interface OrderedLabTest {
  id: string;
  testName: string;
  category: string;
  urgency: 'routine' | 'urgent';
  estimatedCost: number;
}

export interface ClinicalVitals {
  bpSystolic?: number;
  bpDiastolic?: number;
  pulseRate?: number;
  temperature?: number;
  spo2?: number;
  respiratoryRate?: number;
  bloodSugar?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: string;
}

export interface ClinicalEncounter {
  id: string;
  encounterNo: string;
  patientId: string;
  patientName: string;
  cardNo?: string;
  cardId?: string;
  securitySeal?: string;
  isLiveVerified?: boolean;
  doctorId: string;
  doctorName: string;
  doctorSpeciality: string;
  doctorRegNo: string;
  department: string;
  date: string;
  chiefComplaints: string[];
  historyOfPresentIllness: string;
  allergies?: string[];
  chronicConditions?: string[];
  vitals: ClinicalVitals;
  examinationNotes: string;
  diagnoses: string[];
  medications: PrescribedMedication[];
  labOrders: OrderedLabTest[];
  dietAndAdvice: string[];
  followUpDays?: number;
  followUpDate?: string;
  appointmentSlot?: string;
  patientPreferredTime?: string;
  appointmentType?: 'routine_followup' | 'investigation_review' | 'emergency' | 'patient_wish';
  correctionNotes?: string;
  lastCorrectedAt?: string;
  status: 'completed' | 'draft' | 'referred' | 'corrected';
  createdAt: string;
  updatedAt: string;
}

export interface PatientAppointment {
  id: string;
  appointmentNo: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  cardNo?: string;
  cardId?: string;
  securitySeal?: string;
  isLiveVerified?: boolean;
  cardTier: string;
  cardTierColor: string;
  doctorId: string;
  doctorName: string;
  doctorSpeciality: string;
  department: string;
  consultationMode: 'physical_opd' | 'telemedicine_video';
  patientWishDate: string;
  patientWishSlot: string;
  patientWishTime: string;
  doctorConfirmedDate?: string;
  doctorConfirmedSlot?: string;
  doctorConfirmedTime?: string;
  doctorNotes?: string;
  chiefComplaint: string;
  status: 'pending_doctor_approval' | 'doctor_confirmed' | 'in_consultation' | 'completed' | 'rescheduled' | 'cancelled';
  telemedicineRoomUrl?: string;
  consultationFee: number;
  walletDebitStatus?: 'paid' | 'pending' | 'free_card_benefit';
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationFamilyMember {
  id: string;
  fullName: string;
  relationship: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  dob?: string;
  bloodGroup: string;
  mobile?: string;
  photoUrl?: string;
  medicalNotes?: string;
  issueCard?: boolean; // Whether an individual CR80 Health Card is requested for this member
}

export interface CardApplicationRequest {
  id: string; // app_xxxx
  applicationNo: string; // APP-2026-XXXXX
  fullName: string;
  dob: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  mobile: string;
  whatsapp?: string;
  email?: string;
  bloodGroup: string;
  photoUrl?: string;
  address: Address;
  emergencyContact: EmergencyContact;
  medicalInfo: MedicalInfo;
  portalPassword?: string;
  clinicalVitals?: ClinicalVitals;
  referralSource?: string;
  referralDetails?: Record<string, any>;
  cardThemeConfig?: Record<string, any>;
  familyMembers?: ApplicationFamilyMember[];
  membershipId: string;
  membershipName: string;
  membershipPrice: number;
  initialDeposit?: number;
  totalPaidAmount: number;
  paymentMethod: string;
  paymentReference: string;
  paymentStatus: 'paid' | 'pending' | 'pending_verification';
  status: 'pending_approval' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedPatientId?: string;
  approvedCardNumber?: string;
  approvedBy?: string;
  approvedAt?: string;
  smsNotificationSent?: boolean;
  emailNotificationSent?: boolean;
  smsContent?: string;
  emailContent?: string;
  createdAt: string;
  updatedAt: string;
}

export type VoucherCategory =
  | 'opd_consultation'
  | 'diagnostic_lab'
  | 'pharmacy_meds'
  | 'emergency_float'
  | 'health_card_topup'
  | 'all_purpose_cash';

export type VoucherStatus = 'pending' | 'active' | 'redeemed' | 'expired' | 'locked' | 'voided';

export interface CashDeskVoucher {
  id: string; // vch_xxxx
  voucherCode: string; // e.g. LMDX-CSH-2026-XXXXX
  pin: string; // 6 to 8 digit cryptographic numeric PIN
  securityHash: string; // High-entropy verification hash
  authSealCode: string; // e.g. AUTH-SEAL-8924-K9X
  entropyScore?: number; // Entropy bits e.g. 256
  amount: number;
  category: VoucherCategory;
  categoryName: string;
  status: VoucherStatus;
  patientId?: string; // Optional: linked to specific patient
  patientName?: string;
  patientPhone?: string;
  bearerType: 'specific_patient' | 'cash_desk_bearer';
  departmentRestriction?: string;
  doctorRestrictionId?: string;
  doctorRestrictionName?: string;
  validFrom: string;
  validUntil: string;
  issuedBy: string; // Super Admin name
  issuedByUserId: string;
  issueNotes?: string;
  batchId?: string;
  failedPinAttempts: number;
  maxPinAttempts: number;
  isLocked: boolean;
  redeemedAt?: string;
  redeemedBy?: string;
  redeemedPatientId?: string;
  redeemedPatientName?: string;
  redemptionTransactionRef?: string;
  redemptionNotes?: string;
  redemptionChannel?: 'cash_desk_pos' | 'wallet_credit' | 'opd_bill' | 'lab_bill' | 'pharmacy_bill';
  voidedAt?: string;
  voidedBy?: string;
  voidReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherBatchCreatePayload {
  count: number;
  amount: number;
  category: VoucherCategory;
  validityDays: number;
  bearerType: 'specific_patient' | 'cash_desk_bearer';
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  departmentRestriction?: string;
  doctorRestrictionName?: string;
  notes?: string;
  pinLength?: 6 | 8;
}