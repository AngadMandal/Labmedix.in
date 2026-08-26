import { Membership } from '../types';

export const DEFAULT_MEMBERSHIPS: Membership[] = [
  {
    id: 'mem_basic_01',
    name: 'Basic Care',
    slug: 'basic',
    validityMonths: 12,
    registrationFee: 299,
    annualRenewalFee: 199,
    opdDiscount: 10,
    labDiscount: 15,
    pharmacyDiscount: 5,
    homeCollectionDiscount: 25,
    specialBenefits: [
      '10% Discount on Doctor Consultations',
      '15% Discount on Routine Diagnostic Blood Tests',
      '5% Discount on Prescribed Medicines',
      'Free Basic Digital Health Records'
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
    validityMonths: 12,
    registrationFee: 599,
    annualRenewalFee: 399,
    opdDiscount: 20,
    labDiscount: 25,
    pharmacyDiscount: 10,
    homeCollectionDiscount: 50,
    specialBenefits: [
      '20% Discount on Specialist Consultations',
      '25% Discount on All Pathology & Radiology Tests',
      '10% Flat Pharmacy Discount',
      '50% Off Home Blood Sample Collection Charges',
      '1 Complimentary Annual Blood Sugar & Lipid Profile'
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
    validityMonths: 12,
    registrationFee: 999,
    annualRenewalFee: 699,
    opdDiscount: 30,
    labDiscount: 35,
    pharmacyDiscount: 15,
    homeCollectionDiscount: 100,
    specialBenefits: [
      '30% Discount on All Outdoor Doctor Consultations',
      '35% Discount on Advanced Diagnostics & ECG/USG',
      '15% Discount on Pharmacy Orders',
      '100% Free Home Blood Sample Collection',
      'Priority Front-Desk Queue Status',
      '2 Free Master Health Checkups per Year'
    ],
    color: '#D97706',
    badgeIcon: 'Crown',
    isFamilyPlan: false,
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'mem_platinum_04',
    name: 'Platinum Elite',
    slug: 'platinum',
    validityMonths: 24,
    registrationFee: 1999,
    annualRenewalFee: 1299,
    opdDiscount: 40,
    labDiscount: 50,
    pharmacyDiscount: 20,
    homeCollectionDiscount: 100,
    specialBenefits: [
      '2-Year Extended Card Validity',
      '40% Discount on Consultations & VIP Lounge Access',
      '50% Discount on All Lab Investigations',
      '20% Pharmacy Discount + Free Medicine Delivery',
      'Unlimited Free Home Sample Collections',
      'Dedicated Healthcare Relationship Manager',
      'Quarterly Comprehensive Health Profiling'
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
    validityMonths: 12,
    registrationFee: 1499,
    annualRenewalFee: 999,
    opdDiscount: 25,
    labDiscount: 30,
    pharmacyDiscount: 12,
    homeCollectionDiscount: 100,
    specialBenefits: [
      'Covers up to 4 Family Members (Primary + Spouse + 2 Children/Parents)',
      'Individual CR80 Health Cards for each member',
      '25% Discount on Consultations for all family members',
      '30% Lab Discount & 12% Pharmacy Discount',
      'Free Home Blood Collection for Entire Household',
      'Shared Family Health Wallet & Unified Statement'
    ],
    color: '#109B48',
    badgeIcon: 'Users',
    isFamilyPlan: true,
    maxFamilyMembers: 4,
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];