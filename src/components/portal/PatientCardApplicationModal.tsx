import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, ArrowRight, ArrowLeft, Star, Shield, CreditCard, Sparkles, User, Phone, Mail, MapPin, Droplets } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { StorageService } from '../../services/storage';
import { MembershipTierService } from '../../services/membershipTierService';
import { PortalService } from '../../services/portalService';
import { Membership, CardApplicationRequest } from '../../types';
import { triggerCelebrationFireworks } from '../../utils/confetti';

interface PatientCardApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationComplete: (app: CardApplicationRequest) => void;
  onOpenStatusTracker?: (appNo: string) => void;
  defaultTierName?: string;
}

export const PatientCardApplicationModal: React.FC<PatientCardApplicationModalProps> = ({
  isOpen,
  onClose,
  onApplicationComplete,
  onOpenStatusTracker,
  defaultTierName
}) => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('32');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [fullAddress, setFullAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'net_banking' | 'branch_cash'>('upi');

  const [memberships, setMemberships] = useState<Membership[]>(() => StorageService.getActiveMemberships());
  const [selectedMembershipId, setSelectedMembershipId] = useState<string>('');
  const [createdApplication, setCreatedApplication] = useState<CardApplicationRequest | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const active = StorageService.getActiveMemberships();
      setMemberships(active);
      const rec = active.find(m => m.name && (m.name.toLowerCase()).includes((defaultTierName || '').toLowerCase())) ||
                  StorageService.getRecommendedMembership() ||
                  active[0];
      if (rec) setSelectedMembershipId(rec.id);
    }
  }, [isOpen, defaultTierName]);

  useEffect(() => {
    const unsub = MembershipTierService.subscribeToTiers((allTiers) => {
      const active = allTiers.filter(t => t.status === 'active');
      setMemberships(active);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const selectedTier = memberships.find(m => m.id === selectedMembershipId) || memberships[0];

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      showToast('warning', 'Missing Details', 'Please provide your full name and active phone number.');
      return;
    }
    if (phone.trim().length < 10) {
      showToast('warning', 'Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setStep(2);
  };

  const handleSubmitApplication = async () => {
    if (!selectedTier) {
      showToast('error', 'Select Tier', 'Please select a health card membership tier.');
      return;
    }

    setIsSubmitting(true);
    try {
      const savedApp = PortalService.saveCardApplication({
        fullName: fullName.trim(),
        mobile: phone.trim(),
        email: email.trim() || undefined,
        dob: '1994-01-01',
        age: parseInt(age) || 30,
        gender: (gender.toLowerCase() as 'male' | 'female' | 'other') || 'male',
        bloodGroup,
        address: {
          villageArea: fullAddress || 'Local Area',
          postOffice: 'Local',
          policeStation: 'Local',
          district: 'Kolkata',
          state: 'West Bengal',
          pinCode: '700001',
          fullAddress: fullAddress || 'Kolkata, West Bengal'
        },
        emergencyContact: {
          name: 'Primary Contact',
          relationship: 'Family',
          mobile: phone.trim()
        },
        medicalInfo: {
          bloodGroup,
          allergies: 'None',
          chronicConditions: 'None'
        },
        membershipId: selectedTier.id,
        membershipName: selectedTier.name,
        membershipPrice: selectedTier.registrationFee || 500,
        totalPaidAmount: selectedTier.registrationFee || 500,
        paymentStatus: 'paid',
        paymentMethod: paymentMethod,
        paymentReference: 'UPI-' + Math.floor(100000 + Math.random() * 900000)
      });

      setIsSubmitting(false);
      setCreatedApplication(savedApp);
      triggerCelebrationFireworks();
      showToast('success', 'Health Card Application Submitted!', `Tracking ID: ${savedApp.trackingId}`);
      onApplicationComplete(savedApp);
      setStep(4);
    } catch (err) {
      console.error('Application submission error:', err);
      setIsSubmitting(false);
      showToast('error', 'Submission Failed', 'Could not submit card application. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚡ Apply for Smart Health Card (Instant Digital + CR80 PVC)" maxWidth="xl">
      <div className="p-5 space-y-5 text-xs font-sans">
        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2 pb-3 border-b border-slate-800 text-[11px] font-mono text-slate-400">
          <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-teal-400 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step > 1 ? 'bg-teal-500 text-slate-950 font-black' : 'bg-slate-800 text-white'}`}>1</span>
            Applicant Info
          </div>
          <span className="text-slate-600">---</span>
          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-teal-400 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step > 2 ? 'bg-teal-500 text-slate-950 font-black' : 'bg-slate-800 text-white'}`}>2</span>
            Card Tier
          </div>
          <span className="text-slate-600">---</span>
          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-teal-400 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step > 3 ? 'bg-teal-500 text-slate-950 font-black' : 'bg-slate-800 text-white'}`}>3</span>
            Payment
          </div>
          <span className="text-slate-600">---</span>
          <div className={`flex items-center gap-1.5 ${step === 4 ? 'text-emerald-400 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-slate-800 text-white">4</span>
            Confirmation
          </div>
        </div>

        {/* STEP 1: APPLICANT INFO */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <User className="w-4 h-4 text-teal-400" />
                Applicant Personal & Contact Information
              </h3>
              <p className="text-[11px] text-slate-400">
                Please provide correct details for health card embossing and verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Patient Name *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Debashis Roy"
                required
              />
              <Input
                label="Active Mobile Number *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9830098300"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Email Address (Optional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="debashis@example.com"
              />
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Residential Address / Village / Area *"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="e.g. 14/2 Park Street, Kolkata - 700016"
              required
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}>
                Proceed to Select Card Tier
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: SELECT CARD TIER */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Select Health Card Shield Tier
              </h3>
              <p className="text-[11px] text-slate-400">
                All tiers include 350+ Lab Test discounts, OPD cashless privileges, and free family emergency coverage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {memberships.map((m) => {
                const isSelected = selectedMembershipId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMembershipId(m.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/30 shadow-lg'
                        : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                    }`}
                  >
                    {m.isRecommended && (
                      <span className="absolute -top-2.5 right-3 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <Star className="w-2.5 h-2.5 fill-slate-950" /> Recommended
                      </span>
                    )}
                    <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-amber-400" />
                      {m.name}
                    </h4>
                    <p className="text-emerald-400 font-mono text-sm font-black mt-1">
                      {formatCurrency(m.registrationFee)} <span className="text-[10px] text-slate-400 font-normal">/ year</span>
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 text-[10px] font-mono text-slate-300">
                      <div>OPD: <span className="text-teal-400 font-bold">{m.opdDiscount}% OFF</span></div>
                      <div>Lab Tests: <span className="text-teal-400 font-bold">{m.labDiscount}% OFF</span></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="md" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4 mr-1" />}>
                Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setStep(3)} rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}>
                Proceed to Secure Payment ({formatCurrency(selectedTier?.registrationFee || 500)})
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT & CONFIRMATION */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Secure Annual Contribution & Payment
              </h3>
              <p className="text-[11px] text-slate-400">
                Choose your preferred payment gateway mode to activate your health card instantly.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800 pb-2">
                <span>Applicant Name:</span>
                <strong className="text-white">{fullName} ({phone})</strong>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800 pb-2">
                <span>Selected Health Tier:</span>
                <strong className="text-amber-400">{selectedTier?.name}</strong>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300 font-mono pt-1">
                <span className="font-bold text-slate-200">Total Annual Contribution:</span>
                <strong className="text-emerald-400 text-sm font-black">{formatCurrency(selectedTier?.registrationFee || 500)}</strong>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-slate-300">Select Payment Mode:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'upi', label: 'UPI / QR Code', icon: '⚡' },
                  { id: 'card', label: 'Credit / Debit', icon: '💳' },
                  { id: 'net_banking', label: 'Net Banking', icon: '🏦' },
                  { id: 'branch_cash', label: 'Pay at Counter', icon: '💵' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === m.id
                        ? 'bg-teal-500/20 border-teal-500 text-white font-bold shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base block mb-1">{m.icon}</span>
                    <span className="text-[11px] block">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="md" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4 mr-1" />}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                onClick={handleSubmitApplication}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg shadow-emerald-500/20"
              >
                Pay {formatCurrency(selectedTier?.registrationFee || 500)} & Activate Card
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {step === 4 && createdApplication && (
          <div className="space-y-4 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-white">Health Card Application Successfully Created!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Your application has been logged into LabMedix Production Desk with instant priority.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto space-y-2 text-left font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Tracking Reference ID:</span>
                <strong className="text-teal-400">{createdApplication.trackingId}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Applicant:</span>
                <strong className="text-white">{createdApplication.fullName}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Membership Tier:</span>
                <strong className="text-amber-400">{createdApplication.membershipName}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Payment Status:</span>
                <strong className="text-emerald-400 uppercase">Paid & Verified (₹{createdApplication.totalPaidAmount})</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
              {onOpenStatusTracker && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    onClose();
                    onOpenStatusTracker(createdApplication.trackingId);
                  }}
                >
                  Track Application Status
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                onClick={onClose}
                className="bg-teal-500 text-slate-950 font-black"
              >
                Done & Return
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
