import { Membership } from '../types';

export const DEFAULT_MEMBERSHIPS: Membership[] = [
  {
    id: 'mem_basic_01',
    name: 'Basic Care',
    slug: 'basic',
    tierRank: 1,
    description: 'Essential preventive healthcare and routine OPD coverage for individuals.',
    validityMonths: 12,
    registrationFee: 299,
    annualRenewalFee: 199,
    opdDiscount: 10,
    labDiscount: 15,
    pharmacyDiscount: 5,
    homeCollectionDiscount: 25,
    emergencyDiscount: 10,
    ipdDiscount: 5,
    teleconsultDiscount: 15,
    cashbackPercentage: 2,
    specialBenefits: [
      '10% Discount on Doctor Consultations',
      '15% Discount on Routine Diagnostic Blood Tests',
      '5% Discount on Prescribed Medicines',
      'Free Basic Digital Health Records'
    ],
    benefitPackages: [
      {
        id: 'bp_b1',
        title: 'Routine Health Inclusions',
        category: 'preventive',
        description: 'Baseline vital checks, BMI tracking, and digital immunization/record keeper.',
        quantityOrLimit: 'Unlimited',
        valueInInr: 350
      },
      {
        id: 'bp_b2',
        title: 'Tele-Triage Access',
        category: 'consultation',
        description: 'Standard access to general triage helpline.',
        quantityOrLimit: '2 Sessions / Year',
        valueInInr: 400
      }
    ],
    color: '#0B4F9C',
    badgeIcon: 'Shield',
    isFamilyPlan: false,
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'mem_silver_02',
    name: 'Silver Health',
    slug: 'silver',
    tierRank: 2,
    description: 'Comprehensive health shield with enhanced lab diagnostics and annual checkup vouchers.',
    validityMonths: 12,
    registrationFee: 599,
    annualRenewalFee: 399,
    opdDiscount: 20,
    labDiscount: 25,
    pharmacyDiscount: 10,
    homeCollectionDiscount: 50,
    emergencyDiscount: 15,
    ipdDiscount: 10,
    teleconsultDiscount: 25,
    cashbackPercentage: 3,
    specialBenefits: [
      '20% Discount on Specialist Consultations',
      '25% Discount on All Pathology & Radiology Tests',
      '10% Flat Pharmacy Discount',
      '50% Off Home Blood Sample Collection Charges',
      '1 Complimentary Annual Blood Sugar & Lipid Profile'
    ],
    benefitPackages: [
      {
        id: 'bp_s1',
        title: 'Annual Blood Sugar & Lipid Profile',
        category: 'diagnostics',
        description: 'Complimentary fasting glucose and complete lipid profile biomarker assessment.',
        quantityOrLimit: '1 Annual Voucher',
        valueInInr: 650
      },
      {
        id: 'bp_s2',
        title: 'Priority Telemedicine Consultations',
        category: 'consultation',
        description: 'Reduced wait time video consults with certified Medical Officers.',
        quantityOrLimit: '4 Consults / Year',
        valueInInr: 800
      },
      {
        id: 'bp_s3',
        title: 'Standard Home Blood Draw',
        category: 'concierge',
        description: 'Subsidized phlebotomist home sample collection with cold-chain transport.',
        quantityOrLimit: '50% Discount',
        valueInInr: 500
      }
    ],
    color: '#64748B',
    badgeIcon: 'Award',
    isFamilyPlan: false,
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'mem_gold_03',
    name: 'Gold Privilege',
    slug: 'gold',
    tierRank: 3,
    description: 'Executive tier offering 100% Free home sample draw, 35% lab discounts and master health checkups.',
    validityMonths: 12,
    registrationFee: 999,
    annualRenewalFee: 699,
    opdDiscount: 30,
    labDiscount: 35,
    pharmacyDiscount: 15,
    homeCollectionDiscount: 100,
    emergencyDiscount: 20,
    ipdDiscount: 15,
    teleconsultDiscount: 50,
    cashbackPercentage: 5,
    specialBenefits: [
      '30% Discount on All Outdoor Doctor Consultations',
      '35% Discount on Advanced Diagnostics & ECG/USG',
      '15% Discount on Pharmacy Orders',
      '100% Free Home Blood Sample Collection',
      'Priority Front-Desk Queue Status',
      '2 Free Master Health Checkups per Year'
    ],
    benefitPackages: [
      {
        id: 'bp_g1',
        title: 'Executive Master Health Checkup Bundle',
        category: 'preventive',
        description: 'Complete Hemogram (CBC), HbA1c, Liver Function (LFT), Kidney Function (KFT), and Resting ECG.',
        quantityOrLimit: '2 Full Checkups / Year',
        valueInInr: 2400
      },
      {
        id: 'bp_g2',
        title: 'Zero-Fee Phlebotomy Home Collection',
        category: 'concierge',
        description: '100% Cashless home doorstep blood collection with guaranteed STAT reporting.',
        quantityOrLimit: 'Unlimited Free Visits',
        valueInInr: 1500
      },
      {
        id: 'bp_g3',
        title: 'VIP Fast-Track Clinic Queue',
        category: 'hospital',
        description: 'Priority check-in queue pass at reception, doctor chambers, and diagnostic suites.',
        quantityOrLimit: 'All Clinic Visits',
        valueInInr: 1000
      }
    ],
    color: '#D97706',
    badgeIcon: 'Crown',
    isFamilyPlan: false,
    isRecommended: true,
    isPopular: true,
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'mem_platinum_04',
    name: 'Platinum Elite',
    slug: 'platinum',
    tierRank: 4,
    description: 'Ultra-premium 24-month sovereign healthcare membership with 50% lab discounts and dedicated Concierge.',
    validityMonths: 24,
    registrationFee: 1999,
    annualRenewalFee: 1299,
    opdDiscount: 40,
    labDiscount: 50,
    pharmacyDiscount: 20,
    homeCollectionDiscount: 100,
    emergencyDiscount: 30,
    ipdDiscount: 25,
    teleconsultDiscount: 100,
    cashbackPercentage: 8,
    specialBenefits: [
      '2-Year Extended Card Validity',
      '40% Discount on Consultations & VIP Lounge Access',
      '50% Discount on All Lab Investigations',
      '20% Pharmacy Discount + Free Medicine Delivery',
      'Unlimited Free Home Sample Collections',
      'Dedicated Healthcare Relationship Manager',
      'Quarterly Comprehensive Health Profiling'
    ],
    benefitPackages: [
      {
        id: 'bp_p1',
        title: 'Quarterly Advanced Biochemical Profiling',
        category: 'preventive',
        description: 'Thyroid Panel, Vitamin D3/B12, Cardiac Troponin risk scoring, and Lipid Electrophoresis.',
        quantityOrLimit: '4 Profiles (1 per quarter)',
        valueInInr: 5800
      },
      {
        id: 'bp_p2',
        title: 'Dedicated Healthcare Concierge & Physician',
        category: 'concierge',
        description: 'Personal medical officer liaison for reports interpretation, prescription audits, and hospital admissions.',
        quantityOrLimit: '24/7 Concierge Hotline',
        valueInInr: 3600
      },
      {
        id: 'bp_p3',
        title: 'VIP Lounge & Priority Hospital Admittance',
        category: 'hospital',
        description: 'Private executive lounge access with complimentary refreshments and express cashless IPD desk.',
        quantityOrLimit: 'Unlimited',
        valueInInr: 2500
      },
      {
        id: 'bp_p4',
        title: 'Complimentary Doorstep Medicine Delivery',
        category: 'pharmacy',
        description: 'Zero delivery fee on all verified prescription refills directly from the central pharmacy.',
        quantityOrLimit: 'Unlimited Deliveries',
        valueInInr: 1200
      }
    ],
    color: '#0F172A',
    badgeIcon: 'Gem',
    isFamilyPlan: false,
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'mem_family_05',
    name: 'Family Shield (4 Members)',
    slug: 'family',
    tierRank: 5,
    description: 'Unified family healthcare coverage covering up to 4 household members with shared wallet credit.',
    validityMonths: 12,
    registrationFee: 1499,
    annualRenewalFee: 999,
    opdDiscount: 25,
    labDiscount: 30,
    pharmacyDiscount: 12,
    homeCollectionDiscount: 100,
    emergencyDiscount: 20,
    ipdDiscount: 15,
    teleconsultDiscount: 50,
    cashbackPercentage: 5,
    specialBenefits: [
      'Covers up to 4 Family Members (Primary + Spouse + 2 Children/Parents)',
      'Individual CR80 Health Cards for each member',
      '25% Discount on Consultations for all family members',
      '30% Lab Discount & 12% Pharmacy Discount',
      'Free Home Blood Collection for Entire Household',
      'Shared Family Health Wallet & Unified Statement'
    ],
    benefitPackages: [
      {
        id: 'bp_f1',
        title: 'Household Health & Pediatric Screening Package',
        category: 'preventive',
        description: 'Pediatric growth metrics, seasonal viral antibody checks, and adult preventive metabolic panel.',
        quantityOrLimit: 'Covers all 4 enrolled members',
        valueInInr: 3200
      },
      {
        id: 'bp_f2',
        title: 'Individual CR80 Smart PVC Health Cards',
        category: 'concierge',
        description: 'Each family member receives a personalized CR80 NFC smart card linked to the primary account.',
        quantityOrLimit: '4 Physical Cards Included',
        valueInInr: 1200
      },
      {
        id: 'bp_f3',
        title: 'Shared Family Wallet Credit & Real-Time Sync',
        category: 'hospital',
        description: 'Unified prepaid wallet balance usable by any authorized member for instant cashless billing.',
        quantityOrLimit: 'Full Family Access',
        valueInInr: 1500
      }
    ],
    color: '#109B48',
    badgeIcon: 'Users',
    isFamilyPlan: true,
    maxFamilyMembers: 4,
    familyPolicy: {
      allowedRelationships: ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Father-in-Law', 'Mother-in-Law'],
      primaryAgeMinimum: 18,
      childAgeMaximum: 25,
      allowSharedWallet: true,
      allowDependentCards: true,
      additionalMemberFee: 299
    },
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'mem_family_plus_06',
    name: 'Family Shield Plus (6 Members)',
    slug: 'family_plus',
    tierRank: 6,
    description: 'Extended joint-family health protection plan covering up to 6 members with grandparents coverage.',
    validityMonths: 12,
    registrationFee: 2199,
    annualRenewalFee: 1499,
    opdDiscount: 30,
    labDiscount: 35,
    pharmacyDiscount: 15,
    homeCollectionDiscount: 100,
    emergencyDiscount: 25,
    ipdDiscount: 20,
    teleconsultDiscount: 75,
    cashbackPercentage: 6,
    specialBenefits: [
      'Covers up to 6 Family Members (Includes Parents & In-laws)',
      '6 Personalized CR80 PVC Cards with NFC/QR Chips',
      '30% OPD Doctor Discount for the Entire Family',
      '35% Lab & 15% Pharmacy Discounts',
      'Zero-Fee Home Sample Collection for All Members',
      'Priority Geriatric & Chronic Disease Care'
    ],
    benefitPackages: [
      {
        id: 'bp_fp1',
        title: 'Geriatric & Senior Wellness Checkups',
        category: 'preventive',
        description: 'Senior citizen joint pain/arthritis, bone density (DEXA), cardiac ECG, and diabetic screening.',
        quantityOrLimit: '2 Senior Checkups / Year',
        valueInInr: 4500
      },
      {
        id: 'bp_fp2',
        title: 'Home Phlebotomy & ECG at Doorstep',
        category: 'concierge',
        description: 'Certified technician visit for blood draws and portable ECG recording for elderly members.',
        quantityOrLimit: 'Unlimited Free Visits',
        valueInInr: 2500
      },
      {
        id: 'bp_fp3',
        title: 'Emergency Ambulance Assistance Subsidy',
        category: 'hospital',
        description: 'Priority hospital ambulance dispatch with 25% subsidy on distance fees.',
        quantityOrLimit: 'Emergency Coverage',
        valueInInr: 2000
      }
    ],
    color: '#059669',
    badgeIcon: 'Users2',
    isFamilyPlan: true,
    maxFamilyMembers: 6,
    familyPolicy: {
      allowedRelationships: ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Father-in-Law', 'Mother-in-Law', 'Grandparent'],
      primaryAgeMinimum: 18,
      childAgeMaximum: 28,
      allowSharedWallet: true,
      allowDependentCards: true,
      additionalMemberFee: 249
    },
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];