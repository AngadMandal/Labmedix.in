import { StorageService } from './storage';
import { ApiSyncService } from './apiSyncService';

export interface WebsiteCardTierConfig {
  id: string;
  name: string;
  tier: 'Silver' | 'Gold' | 'Platinum' | 'VIP';
  annualFee: number;
  discountPercentage: number;
  cashbackPercentage: number;
  familyMembersCovered: number;
  colorTheme: string;
  popular?: boolean;
  perks: string[];
}

export interface WebsiteDoctorSpecialty {
  id: string;
  name: string;
  department: string;
  iconName: string;
  description: string;
  consultationFee: number;
  availableDoctorsCount: number;
}

export interface WebsiteTestimonial {
  id: string;
  name: string;
  location: string;
  cardTier: string;
  comment: string;
  rating: number;
  date: string;
  avatarUrl?: string;
}

export interface WebsiteCMSConfig {
  announcementTicker: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaPrimaryText: string;
  heroCtaSecondaryText: string;
  emergencyHotline: string;
  ambulanceHelpline: string;
  supportEmail: string;
  stats: {
    happyCardholders: string;
    labTestsProcessed: string;
    doctorConsultations: string;
    partnerHospitals: string;
    diagnosticAccuracy: string;
  };
  cardTiers: WebsiteCardTierConfig[];
  specialties: WebsiteDoctorSpecialty[];
  testimonials: WebsiteTestimonial[];
  faqs: Array<{ question: string; answer: string }>;
  footerAboutText: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

const WEBSITE_CMS_STORAGE_KEY = 'LABMEDIX_WEBSITE_CMS_CONFIG';

export const DEFAULT_WEBSITE_CMS_CONFIG: WebsiteCMSConfig = {
  announcementTicker: '🎉 LABMEDIX.IN ANNUAL MEGA HEALTH FESTIVAL 2026 • OFFICIAL REPO: AngadMandal/Labmedix.in • UP TO 60% DISCOUNT ON ALL HEALTH PACKAGES & DUAL-CHIP CR80 HEALTH CARDS • 24/7 FREE HOME SAMPLE COLLECTION AVAILABLE!',
  heroBadge: 'ISO 9001:2015 ACCREDITED • AngadMandal/Labmedix.in DIAGNOSTIC NETWORK',
  heroTitle: 'Universal Digital Health Card & Smart Diagnostic Ecosystem',
  heroSubtitle: 'Empowering 500,000+ families with Cashless Automated Health Cards, Instant Doctor Consultations, 350+ Lab Tests, and 30-Minute Emergency Ambulance Dispatch.',
  heroCtaPrimaryText: 'Apply for Health Card',
  heroCtaSecondaryText: 'Explore Diagnostic Packages',
  emergencyHotline: '+91 98765 43210',
  ambulanceHelpline: '1800 123 4567',
  supportEmail: 'care@labmedix.in',
  stats: {
    happyCardholders: '520,000+',
    labTestsProcessed: '3,450,000+',
    doctorConsultations: '185,000+',
    partnerHospitals: '450+',
    diagnosticAccuracy: '99.98%'
  },
  cardTiers: [
    {
      id: 'tier_silver',
      name: 'Silver Health Shield',
      tier: 'Silver',
      annualFee: 499,
      discountPercentage: 15,
      cashbackPercentage: 2,
      familyMembersCovered: 2,
      colorTheme: 'from-slate-700 via-slate-800 to-slate-900',
      perks: [
        '15% Flat Discount on all 350+ Lab Tests',
        '2 Family Members Included under Single Card',
        'Digital QR Code & Physical CR80 Smart Card',
        'Annual Routine Blood Sugar & CBC Free',
        '24/7 Digital Health Records in Portal'
      ]
    },
    {
      id: 'tier_gold',
      name: 'Gold Executive Shield',
      tier: 'Gold',
      annualFee: 999,
      discountPercentage: 25,
      cashbackPercentage: 5,
      familyMembersCovered: 4,
      colorTheme: 'from-amber-600 via-yellow-700 to-amber-950',
      popular: false,
      perks: [
        '25% Flat Discount on Pathology & Radiology',
        '4 Family Members Covered with Family Wallet',
        'Free Home Sample Collection within 30 Mins',
        '2 Free Doctor Telemedicine Consultations',
        'Dual-Chip Gold Hologram CR80 PVC Card',
        'Emergency 24/7 Ambulance Priority Dispatch'
      ]
    },
    {
      id: 'tier_platinum',
      name: 'Platinum Family Shield',
      tier: 'Platinum',
      annualFee: 1999,
      discountPercentage: 35,
      cashbackPercentage: 8,
      familyMembersCovered: 6,
      colorTheme: 'from-teal-600 via-cyan-800 to-slate-950',
      perks: [
        '35% Flat Discount on Diagnostic Services',
        '6 Family Members Covered under Master Shield',
        'Executive Full Body Checkup (68 Parameters) Free',
        'Unlimited Doctor Video Consultations',
        'Priority Report Delivery with AI Clinical Notes',
        '10% Discount on In-House Pharmacy Orders'
      ]
    },
    {
      id: 'tier_vip',
      name: 'VIP Royal Diamond Life Shield',
      tier: 'VIP',
      annualFee: 4999,
      discountPercentage: 50,
      cashbackPercentage: 12,
      familyMembersCovered: 10,
      colorTheme: 'from-purple-700 via-indigo-900 to-slate-950',
      perks: [
        '50% Massive Discount on All Hospital & Lab Services',
        'Whole Family Lifetime Coverage (Up to 10 Members)',
        'Dedicated Personal Family Doctor & Concierge Desk',
        'Zero-Wait VIP Phlebotomy Lounge Access',
        'Metal-Finish Dual-Chip NFC CR80 Smart Card',
        'Free Emergency ICU Ambulance Transfer Assistance'
      ]
    }
  ],
  specialties: [
    { id: 'spec_cardio', name: 'Cardiology & Heart Care', department: 'Cardiology', iconName: 'HeartPulse', description: 'ECG, 2D Echo, Lipid profiling, Troponin STAT risk analysis, and heart failure management.', consultationFee: 800, availableDoctorsCount: 14 },
    { id: 'spec_diab', name: 'Diabetology & Endocrinology', department: 'Endocrinology', iconName: 'Activity', description: 'HbA1c monitoring, continuous glucose tracking, thyroid disorders, and metabolic therapy.', consultationFee: 700, availableDoctorsCount: 18 },
    { id: 'spec_med', name: 'Internal Medicine & Critical Care', department: 'General Medicine', iconName: 'Stethoscope', description: 'Acute fever workup, viral infections, hypertension, and systemic health management.', consultationFee: 600, availableDoctorsCount: 26 },
    { id: 'spec_nephro', name: 'Nephrology & Renal Health', department: 'Nephrology', iconName: 'Layers', description: 'eGFR tracking, chronic kidney disease staging, dialysis support, and kidney stones.', consultationFee: 900, availableDoctorsCount: 11 },
    { id: 'spec_gyn', name: 'Gynecology & Obstetric Care', department: 'Gynecology', iconName: 'Heart', description: 'Antenatal care, PCOS hormonal panels, fertility screening, and high-risk pregnancy.', consultationFee: 750, availableDoctorsCount: 16 },
    { id: 'spec_ortho', name: 'Orthopedics & Joint Health', department: 'Orthopedics', iconName: 'Shield', description: 'Arthritis management, Bone Mineral Density (BMD), calcium/Vit-D3, and joint pain.', consultationFee: 700, availableDoctorsCount: 12 }
  ],
  testimonials: [
    {
      id: 'test_1',
      name: 'Engr. Mahfuzur Rahman',
      location: 'Gulshan-2, Dhaka',
      cardTier: 'Gold Executive Shield',
      comment: 'LabMedix Health Card saved our family over ₹45,000 during my father’s cardiac checkup and follow-up tests. The home collection team was at our door in 25 minutes!',
      rating: 5,
      date: '15 Aug 2026'
    },
    {
      id: 'test_2',
      name: 'Dr. Nusrat Jahan',
      location: 'Dhanmondi, Dhaka',
      cardTier: 'Platinum Family Shield',
      comment: 'The diagnostic accuracy and turnaround time are on par with international standards. The AI clinical symptom mapping and WhatsApp PDF reports make healthcare seamless.',
      rating: 5,
      date: '08 Aug 2026'
    },
    {
      id: 'test_3',
      name: 'Al-Haj Kabir Ahmed',
      location: 'Uttara Sector-7, Dhaka',
      cardTier: 'VIP Royal Diamond',
      comment: 'With the VIP card, my entire family of 7 gets 50% discount on tests. The dedicated doctor helpline and digital patient portal are truly world-class.',
      rating: 5,
      date: '28 Jul 2026'
    }
  ],
  faqs: [
    {
      question: 'How do I activate and use my LabMedix Health Card?',
      answer: 'After applying online or at any branch, you receive an instant Digital QR Card on your phone and an embossed Dual-Chip CR80 Card by courier. Simply present your card or QR code at any partner hospital, diagnostic lab, or pharmacy for instant cashless discounts.'
    },
    {
      question: 'Can my family members use my Health Card discounts?',
      answer: 'Yes! Depending on your chosen tier (Silver covers 2, Gold covers 4, Platinum covers 6, VIP covers 10), all linked family members enjoy equal flat discounts and wallet benefits under your master health shield.'
    },
    {
      question: 'How does the 30-Minute Home Sample Collection work?',
      answer: 'Simply request sample collection via the Patient Portal or 24/7 helpline. Our certified phlebotomist arrives with sterile vacuum tubes and barcode printers, collects samples comfortably at home, and digital reports are available in your portal within 4 to 6 hours.'
    },
    {
      question: 'How do I recharge my Health Card Wallet?',
      answer: 'You can top up your wallet anytime via bKash, Nagad, Rocket, Credit/Debit Card, or cash deposit at our center. Wallet balance can be used for tests, doctor fees, medicine purchases, and family care.'
    }
  ],
  footerAboutText: 'LabMedix Auto Health Card System is an ultra-modern automated healthcare diagnostic platform connecting accredited pathology laboratories, certified medical specialists, and cashless smart health cards for accessible, affordable, and accurate care.'
};

export class WebsiteService {
  /**
   * Retrieve active Website CMS Configuration (Dynamically synced with active Membership Tiers)
   */
  public static getWebsiteConfig(): WebsiteCMSConfig {
    const raw = StorageService.getItem<WebsiteCMSConfig>(WEBSITE_CMS_STORAGE_KEY, DEFAULT_WEBSITE_CMS_CONFIG) || DEFAULT_WEBSITE_CMS_CONFIG;
    
    const safeConfig: WebsiteCMSConfig = {
      ...DEFAULT_WEBSITE_CMS_CONFIG,
      ...raw,
      cardTiers: Array.isArray(raw.cardTiers) && raw.cardTiers.length > 0 ? raw.cardTiers : DEFAULT_WEBSITE_CMS_CONFIG.cardTiers,
      specialties: Array.isArray(raw.specialties) && raw.specialties.length > 0 ? raw.specialties : DEFAULT_WEBSITE_CMS_CONFIG.specialties,
      testimonials: Array.isArray(raw.testimonials) && raw.testimonials.length > 0 ? raw.testimonials : DEFAULT_WEBSITE_CMS_CONFIG.testimonials,
      faqs: Array.isArray(raw.faqs) && raw.faqs.length > 0 ? raw.faqs : DEFAULT_WEBSITE_CMS_CONFIG.faqs,
      stats: {
        ...DEFAULT_WEBSITE_CMS_CONFIG.stats,
        ...(raw.stats || {})
      }
    };

    // Single Source of Truth: Map ACTIVE membership tiers from Central Store
    const memberships = StorageService.getMemberships();
    const activeMemberships = Array.isArray(memberships) ? memberships.filter(m => m.status === 'active') : [];
    
    if (activeMemberships && activeMemberships.length > 0) {
      const syncedCardTiers: WebsiteCardTierConfig[] = activeMemberships.map((mem) => {
        const custom = (safeConfig.cardTiers || []).find(ct => ct.id === mem.id || ct.name?.toLowerCase() === mem.name?.toLowerCase());
        const tierLabel = mem.name.includes('Silver') ? 'Silver' : mem.name.includes('Gold') ? 'Gold' : mem.name.includes('Platinum') ? 'Platinum' : 'VIP';
        
        return {
          id: mem.id,
          name: mem.name,
          tier: tierLabel as any,
          annualFee: mem.annualRenewalFee || mem.registrationFee || 999,
          discountPercentage: mem.labDiscount || mem.opdDiscount || 25,
          cashbackPercentage: Math.round((mem.labDiscount || 25) / 3),
          familyMembersCovered: mem.isFamilyPlan ? 6 : 4,
          colorTheme: custom?.colorTheme || 'from-amber-600 via-yellow-700 to-amber-950',
          popular: custom?.popular === true,
          perks: mem.specialBenefits && mem.specialBenefits.length > 0 ? mem.specialBenefits : [
            `${mem.labDiscount}% Flat Discount on pathology & radiology`,
            `${mem.opdDiscount}% OPD Doctor Consultation Discount`,
            `${mem.pharmacyDiscount}% Pharmacy Medicine Discount`,
            `Free Home Sample Collection (${mem.homeCollectionDiscount}% Off)`,
            `Validity: ${mem.validityMonths} Months`
          ]
        };
      });
      return {
        ...safeConfig,
        cardTiers: syncedCardTiers
      };
    }
    return safeConfig;
  }

  /**
   * Update Website CMS Configuration (Strictly restricted to Super Admin)
   */
  public static updateWebsiteConfig(newConfig: WebsiteCMSConfig, userRole?: string): { success: boolean; message: string } {
    if (userRole !== 'super_admin') {
      return {
        success: false,
        message: 'Security Violation: Website configuration can ONLY be modified by the Super Administrator.'
      };
    }

    try {
      const updatedConfig: WebsiteCMSConfig = {
        ...newConfig,
        lastUpdatedBy: 'Super Administrator',
        lastUpdatedAt: new Date().toISOString()
      };
      StorageService.setItem(WEBSITE_CMS_STORAGE_KEY, updatedConfig);
      ApiSyncService.syncKeyToFirestore(WEBSITE_CMS_STORAGE_KEY, updatedConfig).catch(() => {});
      return {
        success: true,
        message: 'Website configuration updated and published live successfully.'
      };
    } catch (e) {
      return {
        success: false,
        message: 'Failed to save website configuration to local storage.'
      };
    }
  }

  /**
   * Reset Website CMS to Factory Defaults (Super Admin Only)
   */
  public static resetToDefaults(userRole?: string): { success: boolean; message: string } {
    if (userRole !== 'super_admin') {
      return {
        success: false,
        message: 'Super Administrator authority required to reset website configuration.'
      };
    }

    try {
      StorageService.setItem(WEBSITE_CMS_STORAGE_KEY, DEFAULT_WEBSITE_CMS_CONFIG);
      ApiSyncService.syncKeyToFirestore(WEBSITE_CMS_STORAGE_KEY, DEFAULT_WEBSITE_CMS_CONFIG).catch(() => {});
      return {
        success: true,
        message: 'Website CMS reset to default factory graphics and content.'
      };
    } catch (e) {
      return {
        success: false,
        message: 'Reset operation failed.'
      };
    }
  }

  public static saveWebsiteConfig(newConfig: WebsiteCMSConfig, userRole: string = 'super_admin'): { success: boolean; message: string } {
    return this.updateWebsiteConfig(newConfig, userRole);
  }

  public static resetWebsiteConfig(userRole: string = 'super_admin'): WebsiteCMSConfig {
    this.resetToDefaults(userRole);
    return DEFAULT_WEBSITE_CMS_CONFIG;
  }
}
