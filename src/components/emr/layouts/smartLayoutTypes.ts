import { ClinicalEncounter, Patient, HealthCard, Membership, CompanyProfile, PrescribedMedication, OrderedLabTest } from '../../../types';

export type SmartPrescriptionLayoutMode =
  | 'detailed_a4'
  | 'thermal_slip'
  | 'compact_a5'
  | 'clinical_summary';

export type PrescriptionTemplateTheme =
  | 'apollo_modern'
  | 'executive_slate'
  | 'academic_crest'
  | 'cyber_health'
  | 'swiss_minimal'
  | 'velvet_orchid';

export interface SmartLayoutOptions {
  showVitals: boolean;
  showSalts: boolean;
  showAdvice: boolean;
  showQrCode: boolean;
  thermalWidth: '80mm' | '58mm';
  fontSizeScale: 'compact' | 'normal' | 'large';
  includeDiagnosisICD: boolean;
  includeFollowupSlot: boolean;
}

export interface PrescriptionLayoutProps {
  encounter: ClinicalEncounter;
  patient?: Patient;
  activeCard?: HealthCard | null;
  activeMembership?: Membership | null;
  company: CompanyProfile;
  securityHash: string;
  qrCodeUrl?: string;
  theme: PrescriptionTemplateTheme;
  options: SmartLayoutOptions;
  appointmentSlotLabel: string;
  preferredTimeLabel: string;
  helplineNumber: string;
  hospitalName: string;
  hospitalTagline: string;
  hospitalAddress: string;
}
