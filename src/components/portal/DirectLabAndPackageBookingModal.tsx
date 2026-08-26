import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { AddressAutoPopupModal } from '../common/AddressAutoPopupModal';
import { CatalogService, HealthPackageItem, LabTestItem } from '../../services/catalogService';
import { PortalService, BloodTestBooking, BloodTestBookingItem } from '../../services/portalService';
import { WalletService } from '../../services/walletService';
import { AuditService } from '../../services/auditService';
import { Patient, Membership } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import {
  TestTube,
  Package,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Wallet,
  ShieldCheck,
  Zap,
  Sparkles,
  AlertTriangle,
  Heart,
  Activity,
  User,
  Phone,
  Home,
  Building2,
  Check,
  Plus,
  Trash2
} from 'lucide-react';

export interface DirectLabAndPackageBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  membership: Membership;
  walletBalance: number;
  onBookingSuccess: (booking: BloodTestBooking, receiptData?: any) => void;
}

export const DirectLabAndPackageBookingModal: React.FC<DirectLabAndPackageBookingModalProps> = ({
  isOpen,
  onClose,
  patient,
  membership,
  walletBalance,
  onBookingSuccess
}) => {
  const { showToast } = useToast();

  const packages = useMemo(() => CatalogService.getHealthPackages(), []);
  const labTests = useMemo(() => CatalogService.getLabTests(), []);

  // View Mode: 'packages' | 'individual_tests'
  const [bookingMode, setBookingMode] = useState<'packages' | 'individual_tests'>('packages');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Selected Package State
  const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.id || '');

  // Selected Individual Tests State (Array of test IDs)
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>(['test_cbc', 'test_lipid']);

  // Collection Logistics
  const [collectionType, setCollectionType] = useState<'home_collection' | 'lab_visit'>('home_collection');
  const [collectionAddress, setCollectionAddress] = useState(
    patient?.address?.fullAddress || 'Sector 3, Salt Lake, Kolkata 700098'
  );
  const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [scheduledTime, setScheduledTime] = useState('07:30 AM - 09:00 AM (Fasting Slot)');

  // Payment Options
  const [paymentOption, setPaymentOption] = useState<'paid_wallet' | 'pay_at_lab'>('paid_wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active selected package
  const activePackage = useMemo(() => {
    return packages.find(p => p.id === selectedPackageId) || packages[0];
  }, [packages, selectedPackageId]);

  // Active selected tests list
  const activeIndividualTests = useMemo(() => {
    return labTests.filter(t => selectedTestIds.includes(t.id));
  }, [labTests, selectedTestIds]);

  // Calculate Gross, Discount, Net
  const pricing = useMemo(() => {
    const discountPercent = membership?.labDiscount || 25;

    if (bookingMode === 'packages' && activePackage) {
      const gross = activePackage.mrp;
      const net = activePackage.offerPrice;
      const discount = gross - net;
      return { gross, discount, net, discountPercent: Math.round((discount / gross) * 100) };
    } else {
      const gross = activeIndividualTests.reduce((sum, t) => sum + t.mrp, 0);
      const discount = (gross * discountPercent) / 100;
      const net = gross - discount;
      return { gross, discount, net, discountPercent };
    }
  }, [bookingMode, activePackage, activeIndividualTests, membership]);

  // Fasting requirement check
  const requiresFasting = useMemo(() => {
    if (bookingMode === 'packages') return activePackage?.fastingRequired || false;
    return activeIndividualTests.some(t => t.fastingRequired);
  }, [bookingMode, activePackage, activeIndividualTests]);

  // Toggle individual test selection
  const handleToggleTest = (id: string) => {
    setSelectedTestIds(prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.includedTests.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [packages, selectedCategory, searchQuery]);

  // Filtered individual tests
  const filteredLabTests = useMemo(() => {
    return labTests.filter(t => {
      const matchCat = selectedCategory === 'all' || t.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [labTests, selectedCategory, searchQuery]);

  // Handle final booking submission
  const handleConfirmBooking = () => {
    if (bookingMode === 'individual_tests' && activeIndividualTests.length === 0) {
      showToast('error', 'Select Tests', 'Please select at least 1 diagnostic test to book.');
      return;
    }

    if (paymentOption === 'paid_wallet' && walletBalance < pricing.net) {
      showToast(
        'error',
        'Insufficient Wallet Balance',
        `Required: ${formatCurrency(pricing.net)}, Available in Health Wallet: ${formatCurrency(walletBalance)}. Please recharge wallet or select "Pay at Lab".`
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Prepare items
      const bookingItems: BloodTestBookingItem[] =
        bookingMode === 'packages' && activePackage
          ? activePackage.includedTests.map(t => ({
              testName: t,
              category: activePackage.category,
              grossPrice: Math.round(pricing.gross / activePackage.includedTests.length),
              discountAmount: Math.round(pricing.discount / activePackage.includedTests.length),
              netPrice: Math.round(pricing.net / activePackage.includedTests.length),
              fastingRequired: activePackage.fastingRequired
            }))
          : activeIndividualTests.map(t => ({
              testName: t.name,
              category: t.category,
              grossPrice: t.mrp,
              discountAmount: (t.mrp * (membership.labDiscount || 25)) / 100,
              netPrice: t.mrp - (t.mrp * (membership.labDiscount || 25)) / 100,
              fastingRequired: t.fastingRequired
            }));

      const primaryTitle =
        bookingMode === 'packages' && activePackage
          ? activePackage.name
          : activeIndividualTests.map(t => t.name).slice(0, 2).join(', ') + (activeIndividualTests.length > 2 ? ` (+${activeIndividualTests.length - 2} more)` : '');

      const primaryCategory =
        bookingMode === 'packages' && activePackage ? `Health Package (${activePackage.parametersCount} Parameters)` : 'Pathology Diagnostic Panel';

      // 2. Save Lab Booking in PortalService
      const newBooking = PortalService.saveLabBooking({
        patientId: patient.id,
        patientName: patient.fullName,
        testName: primaryTitle,
        category: primaryCategory,
        items: bookingItems,
        collectionType,
        scheduledDate,
        scheduledTime,
        grossPrice: pricing.gross,
        discountPercentage: pricing.discountPercent,
        discountAmount: pricing.discount,
        netPrice: pricing.net,
        paymentStatus: paymentOption,
        status: 'confirmed',
        fastingRequired: requiresFasting
      });

      // 3. If Paid from Health Wallet -> Debit
      if (paymentOption === 'paid_wallet') {
        WalletService.addTransaction(
          patient.id,
          'debit',
          pricing.net,
          `Cashless Payment for Diagnostic Pathology (${primaryTitle}) [Booking Ref: ${newBooking.bookingNo}]`,
          {
            grossAmount: pricing.gross,
            discountAmount: pricing.discount,
            discountPercentage: pricing.discountPercent
          }
        );
      }

      // 4. Audit Log
      AuditService.log(
        'LAB_TEST_BOOKED',
        'patient',
        `Direct self-service pathology booked by ${patient.fullName} (${primaryTitle}) [Ref: ${newBooking.bookingNo}, Net: ${formatCurrency(pricing.net)}]`,
        newBooking.id
      );

      // 5. Generate Receipt
      const receiptData = {
        id: `rcp_lab_${newBooking.id}`,
        receiptNo: `REC-${newBooking.bookingNo}`,
        patientId: patient.id,
        patientName: patient.fullName,
        cardNo: patient.healthCardId,
        cardTier: membership?.name || 'Cardholder',
        serviceType: 'Pathology',
        serviceDescription: `${primaryTitle} (${collectionType === 'home_collection' ? 'Doorstep Home Sample Collection' : 'Lab Walk-in Visit'})`,
        items: bookingItems.map(i => ({ name: i.testName, qty: 1, price: i.netPrice })),
        grossAmount: pricing.gross,
        discountAmount: pricing.discount,
        discountPercentage: pricing.discountPercent,
        netAmount: pricing.net,
        paymentMethod: paymentOption === 'paid_wallet' ? 'Health Wallet (Prepaid Cashless)' : 'Pay on Collection',
        walletClosingBalance: paymentOption === 'paid_wallet' ? walletBalance - pricing.net : walletBalance,
        date: new Date().toISOString(),
        status: 'Confirmed',
        referenceNo: newBooking.bookingNo
      };

      setIsSubmitting(false);
      triggerCelebrationFireworks();
      showToast('success', 'Pathology Booking Confirmed!', `Booking Ref: ${newBooking.bookingNo} is active.`);
      onBookingSuccess(newBooking, receiptData);
      onClose();
    }, 900);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Direct Diagnostic Lab Tests & Preventive Health Checkup Packages (pkg test)"
      maxWidth="4xl"
    >
      <div className="space-y-5 text-xs">
        {/* Main Tab Switcher: Packages vs Individual Tests */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setBookingMode('packages'); setSelectedCategory('all'); }}
            className={`py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              bookingMode === 'packages'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 text-amber-300" />
            <span>📦 Curated Health Packages (pkg test)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/40 text-amber-300 border border-white/20">
              Up to 60% OFF
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setBookingMode('individual_tests'); setSelectedCategory('all'); }}
            className={`py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              bookingMode === 'individual_tests'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TestTube className="w-4 h-4 text-teal-300" />
            <span>🧪 Individual Blood Tests (Search & Choose)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/40 text-teal-300 border border-white/20">
              {membership?.labDiscount || 25}% OFF
            </span>
          </button>
        </div>

        {/* Search Bar & Category Filter Chips */}
        <div className="space-y-2">
          <Input
            placeholder={
              bookingMode === 'packages'
                ? 'Search health packages by organ, disease (Full body, Heart, Diabetes, Liver, Kidney, Senior)...'
                : 'Search individual tests (CBC, Lipid, HbA1c, Thyroid, LFT, KFT, Vitamin D, Urine)...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
            {bookingMode === 'packages' ? (
              ['all', 'Full Body', 'Cardiac', 'Diabetes', 'Senior Citizen', 'Women', 'Liver & Kidney'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white shadow-sm font-bold'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {cat === 'all' ? 'All Packages (6)' : cat}
                </button>
              ))
            ) : (
              ['all', 'Hematology', 'Cardiac', 'Diabetes', 'Thyroid', 'Liver', 'Kidney', 'Vitamins', 'Biochemistry'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white shadow-sm font-bold'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {cat === 'all' ? 'All Diagnostic Tests (14)' : cat}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ================= TAB 1: CURATED HEALTH CHECKUP PACKAGES ================= */}
        {bookingMode === 'packages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
            {filteredPackages.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-teal-950/90 to-slate-900 border-teal-400 ring-2 ring-teal-400/40 shadow-xl'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase font-mono bg-amber-950 text-amber-300 border border-amber-500/50">
                        {pkg.tag}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">{pkg.packageCode}</span>
                      )}
                    </div>

                    <strong className="text-sm font-black text-white block leading-snug">
                      {pkg.name}
                    </strong>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {pkg.description}
                    </p>

                    <div className="mt-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        Included Tests ({pkg.parametersCount}+ Parameters):
                      </span>
                      <ul className="text-[10.5px] text-teal-200/90 font-mono space-y-0.5 list-disc list-inside">
                        {pkg.includedTests.slice(0, 4).map((t, idx) => (
                          <li key={idx} className="truncate">{t}</li>
                        ))}
                        {pkg.includedTests.length > 4 && (
                          <li className="text-amber-300 font-bold">+ {pkg.includedTests.length - 4} more specialized tests</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 line-through mr-1.5">
                        MRP {formatCurrency(pkg.mrp)}
                      </span>
                      <strong className="text-sm font-black text-emerald-400 font-mono">
                        {formatCurrency(pkg.offerPrice)}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        isSelected ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isSelected ? 'Selected ✓' : 'Select Package'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= TAB 2: INDIVIDUAL BLOOD TESTS CHECKLIST ================= */}
        {bookingMode === 'individual_tests' && (
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            <div className="p-2.5 bg-teal-950/60 rounded-xl border border-teal-500/40 flex items-center justify-between text-[11px] text-teal-200">
              <span>{activeIndividualTests.length} Diagnostic Tests Selected</span>
              <span className="font-bold text-emerald-400">Cardholder Discount: {membership?.labDiscount || 25}% OFF Applied</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredLabTests.map((t) => {
                const isChecked = selectedTestIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTest(t.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-2.5 ${
                      isChecked
                        ? 'bg-teal-950/70 border-teal-500/60 ring-1 ring-teal-500'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                        isChecked ? 'bg-teal-600 border-teal-400 text-white' : 'border-slate-600 bg-slate-800'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-xs font-bold text-white leading-tight block">
                            {t.name}
                          </strong>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {t.department} • {t.specimen}
                        </span>
                        {t.fastingRequired && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                            ⏳ Fasting Required (8-10h)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <span className="text-[10px] text-slate-400 line-through block">
                        {formatCurrency(t.mrp)}
                      </span>
                      <strong className="text-xs font-black text-emerald-400 block">
                        {formatCurrency(t.mrp - (t.mrp * (membership?.labDiscount || 25)) / 100)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Collection Mode, Date, Time Logistics */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
            Sample Collection & Appointment Schedule:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCollectionType('home_collection')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                collectionType === 'home_collection'
                  ? 'bg-teal-600 text-white border-teal-400 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Home className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <strong className="block text-xs">🏡 Certified Home Sample Collection</strong>
                <span className="text-[10px] opacity-80 block">NABL Phlebotomist visits doorstep with vacutainer kit</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCollectionType('lab_visit')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                collectionType === 'lab_visit'
                  ? 'bg-teal-600 text-white border-teal-400 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-5 h-5 text-teal-300 shrink-0" />
              <div>
                <strong className="block text-xs">🏥 Central Pathology Lab Walk-in</strong>
                <span className="text-[10px] opacity-80 block">Instant priority counter sampling at main diagnostic center</span>
              </div>
            </button>
          </div>

          {collectionType === 'home_collection' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300">Doorstep Home Collection Address</span>
                <button
                  type="button"
                  onClick={() => setIsAddressPopupOpen(true)}
                  className="text-[10px] text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 underline"
                >
                  <MapPin className="w-3 h-3" />
                  <span>📍 Auto Popup Address / PIN Lookup</span>
                </button>
              </div>
              <Input
                value={collectionAddress}
                onChange={(e) => setCollectionAddress(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Preferred Collection Date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Preferred Time Slot:</label>
              <select
                aria-label="Time Slot"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-700 text-white font-mono text-xs font-bold"
              >
                <option value="07:00 AM - 08:30 AM (Fasting Slot)">07:00 AM - 08:30 AM (Early Fasting Slot)</option>
                <option value="08:30 AM - 10:00 AM (Fasting Slot)">08:30 AM - 10:00 AM (Fasting Slot)</option>
                <option value="10:00 AM - 12:00 PM (Routine Slot)">10:00 AM - 12:00 PM (Routine Non-Fasting)</option>
                <option value="02:00 PM - 05:00 PM (Evening Slot)">02:00 PM - 05:00 PM (Evening Slot)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Billing & Payment Mode */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/40 space-y-3">
          <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Gross Total</span>
              <strong className="text-white text-sm">{formatCurrency(pricing.gross)}</strong>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-emerald-400 block font-sans">Card Discount ({pricing.discountPercent}%)</span>
              <strong className="text-emerald-400 text-sm">- {formatCurrency(pricing.discount)}</strong>
            </div>
            <div className="p-2 bg-teal-950/80 rounded-xl border border-teal-500/50">
              <span className="text-[10px] text-teal-300 block font-sans">Net Total Payable</span>
              <strong className="text-emerald-300 text-base font-black">{formatCurrency(pricing.net)}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentOption('paid_wallet')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                paymentOption === 'paid_wallet'
                  ? 'bg-teal-600 text-white border-teal-400 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-300" />
                <div>
                  <strong className="block text-xs">Pay with Health Wallet</strong>
                  <span className="text-[9.5px] opacity-80 block font-mono">Available: {formatCurrency(walletBalance)}</span>
                </div>
              </div>
              {paymentOption === 'paid_wallet' && <CheckCircle2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setPaymentOption('pay_at_lab')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                paymentOption === 'pay_at_lab'
                  ? 'bg-teal-600 text-white border-teal-400 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-300" />
                <div>
                  <strong className="block text-xs">Pay on Sample Collection</strong>
                  <span className="text-[9.5px] opacity-80 block font-mono">Cash / UPI to phlebotomist</span>
                </div>
              </div>
              {paymentOption === 'pay_at_lab' && <CheckCircle2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmBooking}
            isLoading={isSubmitting}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-lg"
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm Pathology Booking ({formatCurrency(pricing.net)})
          </Button>
        </div>
      </div>

      <AddressAutoPopupModal
        isOpen={isAddressPopupOpen}
        onClose={() => setIsAddressPopupOpen(false)}
        initialQuery={collectionAddress}
        onSelectAddress={(addr) => {
          setCollectionAddress(`${addr.cityArea}, P.O: ${addr.postOffice}, P.S: ${addr.policeStation}, ${addr.district}, ${addr.state} - ${addr.pinCode}`);
          showToast('success', 'Address Selected', `${addr.cityArea}, ${addr.district} (${addr.pinCode}) selected for sample collection.`);
        }}
      />
    </Modal>
  );
};
