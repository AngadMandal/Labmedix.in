import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Membership, CardApplicationRequest, ApplicationFamilyMember, CashDeskVoucher } from '../../types';
import { StorageService } from '../../services/storage';
import { PortalService } from '../../services/portalService';
import { IntegrationService } from '../../services/integrationService';
import { CashDeskVoucherService } from '../../services/cashDeskVoucherService';
import { DoctorMasterService, DoctorMasterItem } from '../../services/doctorMasterService';
import { AddressAutoPopupModal } from '../common/AddressAutoPopupModal';
import { AddressLookupService } from '../../services/addressLookupService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { GooglePayMerchantQR } from '../payment/GooglePayMerchantQR';
import { ZohoMerchantCheckout } from '../payment/ZohoMerchantCheckout';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  QrCode,
  Printer,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Smartphone,
  Copy,
  Check,
  Building2,
  Lock,
  Users2,
  Plus,
  Trash2,
  Wallet,
  Clock,
  Search,
  ExternalLink,
  Camera,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  MapPin,
  HeartHandshake,
  Ticket,
  KeyRound,
  ShieldAlert,
  Coins,
  Receipt,
  FileCheck,
  Stethoscope,
  Activity,
  Heart,
  UserCheck,
  Building
} from 'lucide-react';

interface PatientCardApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationComplete?: (application: CardApplicationRequest) => void;
  onOpenStatusTracker?: (appNo?: string) => void;
}

export const PatientCardApplicationModal: React.FC<PatientCardApplicationModalProps> = ({
  isOpen,
  onClose,
  onApplicationComplete,
  onOpenStatusTracker
}) => {
  const { showToast } = useToast();
  const memberships = StorageService.getMemberships();
  const company = StorageService.getCompanyProfile();

  // Multi-step Wizard: 1: Profile -> 2: 3D Plan -> 3: Payment -> 4: Success Slip
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // 0. Passport Size Photo State (Mandatory)
  const [photoUrl, setPhotoUrl] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample Passport Photos for Quick 1-Click Testing
  const samplePassportPhotos = [
    { name: 'Male Applicant', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
    { name: 'Female Applicant', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
    { name: 'Senior Citizen', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80' },
    { name: 'Young Adult', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80' },
  ];

  // Step 1: Patient Profile Form State (Clean defaults, zero dummy prefilled data)
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');

  // Address Details (Mandatory)
  const [cityArea, setCityArea] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [district, setDistrict] = useState('Kolkata');
  const [stateVal, setStateVal] = useState('West Bengal');
  const [pinCode, setPinCode] = useState('');
  const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);

  // Instant PIN Code Auto-Resolve
  const handlePinCodeChange = (newPin: string) => {
    setPinCode(newPin);
    const clean = newPin.trim();
    if (clean.length === 6 && /^\d{6}$/.test(clean)) {
      const results = AddressLookupService.lookupLocal(clean);
      if (results.length > 0) {
        const best = results[0];
        setCityArea(best.cityArea);
        setPostOffice(best.postOffice);
        setPoliceStation(best.policeStation);
        setDistrict(best.district);
        setStateVal(best.state);
        showToast('info', 'Address Auto-Resolved', `Matched ${best.cityArea}, ${best.district}`);
      } else {
        AddressLookupService.resolvePinCodeAsync(clean).then(res => {
          if (res.length > 0) {
            const best = res[0];
            setCityArea(best.cityArea);
            setPostOffice(best.postOffice);
            setPoliceStation(best.policeStation);
            setDistrict(best.district);
            setStateVal(best.state);
            showToast('info', 'Postal PIN Matched', `${best.cityArea}, ${best.district}`);
          }
        });
      }
    }
  };

  // Emergency & Medical (Mandatory)
  const [emName, setEmName] = useState('');
  const [emRelation, setEmRelation] = useState('Spouse');
  const [emMobile, setEmMobile] = useState('');

  // Clinical Vitals & Triage (Optional for public, auto-analyzed)
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [pulse, setPulse] = useState('72');
  const [rbs, setRbs] = useState('100');
  const [spo2, setSpo2] = useState('99');
  const [weightKg, setWeightKg] = useState('65');
  const [heightCm, setHeightCm] = useState('170');
  const [allergies, setAllergies] = useState('None');
  const [chronicConditions, setChronicConditions] = useState('None');
  const [importantNotes, setImportantNotes] = useState('');

  // Computed BMI
  const bmiData = useMemo(() => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm) / 100;
    if (w > 0 && h > 0) {
      const val = parseFloat((w / (h * h)).toFixed(1));
      let category = 'Normal';
      let color = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50';
      if (val < 18.5) {
        category = 'Underweight';
        color = 'text-amber-400 bg-amber-950/60 border-amber-500/50';
      } else if (val >= 25 && val < 30) {
        category = 'Overweight';
        color = 'text-orange-400 bg-orange-950/60 border-orange-500/50';
      } else if (val >= 30) {
        category = 'Obese';
        color = 'text-rose-400 bg-rose-950/60 border-rose-500/50';
      }
      return { val, category, color };
    }
    return null;
  }, [weightKg, heightCm]);

  // "Others Recommend" / Referral Details
  const [referralSource, setReferralSource] = useState<
    'doctor' | 'existing_cardholder' | 'hospital_staff' | 'health_camp' | 'agent' | 'other' | 'none'
  >('none');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [customDoctorName, setCustomDoctorName] = useState('');
  const [doctorClinic, setDoctorClinic] = useState('');
  const [referrerPatientId, setReferrerPatientId] = useState('');
  const [referrerCardNumber, setReferrerCardNumber] = useState('');
  const [hospitalStaffName, setHospitalStaffName] = useState('');
  const [hospitalStaffId, setHospitalStaffId] = useState('');
  const [healthCampName, setHealthCampName] = useState('');
  const [healthCampCode, setHealthCampCode] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentCode, setAgentCode] = useState('');
  const [otherReferralDetails, setOtherReferralDetails] = useState('');

  // Active Doctors from Master
  const activeDoctors = useMemo<DoctorMasterItem[]>(() => {
    return DoctorMasterService.getAllDoctors().filter(d => d.status === 'active');
  }, []);

  // Validation Errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Family Members Coverage State (1 Card Covers Whole Family with Individual Issue Toggle)
  const [includeFamily, setIncludeFamily] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<ApplicationFamilyMember[]>([]);
  const [newFamName, setNewFamName] = useState('');
  const [newFamRel, setNewFamRel] = useState('Spouse');
  const [newFamAge, setNewFamAge] = useState<number | ''>('');
  const [newFamGender, setNewFamGender] = useState<'male' | 'female' | 'other'>('female');
  const [newFamBlood, setNewFamBlood] = useState('B+');
  const [newFamMobile, setNewFamMobile] = useState('');
  const [newFamIssueCard, setNewFamIssueCard] = useState(true);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);

  // Step 2: 3D Card Plan Selection (Default to Recommended Gold Plan)
  const [selectedMembershipId, setSelectedMembershipId] = useState<string>(() => {
    const gold = memberships.find(m => m.slug === 'gold' || m.name.toLowerCase().includes('gold')) || memberships[0];
    return gold ? gold.id : '';
  });
  const [initialDeposit, setInitialDeposit] = useState<number>(500);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Dynamic Integration Gating (Indian Gateways Only)
  const isZohoEnabled = IntegrationService.isIntegrationEnabled('zoho_payments');
  const isGpayEnabled = IntegrationService.isIntegrationEnabled('gpay_upi_merchant');

  // Step 3: Payment Checkout
  // 1: UPI Dynamic QR with 12-Digit UTR submission
  // 2: Cash Desk Financial Voucher Code & PIN entry
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'voucher_code' | 'zoho_pay' | 'cards' | 'netbanking'>('upi_qr');
  const [paymentReference, setPaymentReference] = useState(() => `PAY-${Date.now().toString(36).toUpperCase()}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // 1. UPI QR & UTR Number States
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');

  // 2. Cash Desk Voucher States
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [voucherPinInput, setVoucherPinInput] = useState('');
  const [showVoucherPin, setShowVoucherPin] = useState(false);
  const [verifiedVoucher, setVerifiedVoucher] = useState<CashDeskVoucher | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [isVerifyingVoucher, setIsVerifyingVoucher] = useState(false);

  // Step 4: Generated Application Slip
  const [submittedApplication, setSubmittedApplication] = useState<CardApplicationRequest | null>(null);

  // Sync WhatsApp with Mobile
  useEffect(() => {
    if (sameAsMobile) {
      setWhatsapp(mobile);
    }
  }, [mobile, sameAsMobile]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Selected membership
  const selectedMembership = useMemo(() => {
    return memberships.find(m => m.id === selectedMembershipId) || memberships[0] || {
      id: 'mem_gold',
      name: 'Gold Privilege Card',
      slug: 'gold',
      registrationFee: 1200,
      opdDiscount: 25,
      labDiscount: 30,
      pharmacyDiscount: 15,
      color: '#D97706',
      validityMonths: 12
    };
  }, [memberships, selectedMembershipId]);

  const totalPayable = (selectedMembership.registrationFee || 1000) + (initialDeposit || 0);

  // Camera Handlers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      showToast('error', 'Camera Error', 'Unable to access camera. Please upload an image file instead.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 400, 480);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPhotoUrl(dataUrl);
      if (validationErrors.photo) {
        setValidationErrors(prev => {
          const next = { ...prev };
          delete next.photo;
          return next;
        });
      }
      showToast('success', 'Passport Photo Attached', 'Photo captured and framed for PVC Health Card printing.');
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'Please upload a photo under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoUrl(event.target.result as string);
        if (validationErrors.photo) {
          setValidationErrors(prev => {
            const next = { ...prev };
            delete next.photo;
            return next;
          });
        }
        showToast('success', 'Photo Attached', 'Passport photo attached to application.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-calculate age on DOB change
  const handleDobChange = (val: string) => {
    setDob(val);
    if (val) {
      const birth = new Date(val);
      const now = new Date();
      let diff = now.getFullYear() - birth.getFullYear();
      if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
        diff--;
      }
      setAge(Math.max(1, diff));
    }
  };

  // Sequential Enter Key navigation to move cursor smoothly through all fields
  const handleFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, nextFieldId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextEl = document.getElementById(nextFieldId);
      if (nextEl) {
        nextEl.focus();
      }
    }
  };

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamName.trim()) {
      showToast('error', 'Required Field', 'Please provide family member full name.');
      return;
    }
    const newMember: ApplicationFamilyMember = {
      id: `fam_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      fullName: newFamName.trim(),
      relationship: newFamRel,
      gender: newFamGender,
      age: typeof newFamAge === 'number' ? newFamAge : 25,
      bloodGroup: newFamBlood,
      mobile: newFamMobile.trim() || mobile.trim(),
      issueCard: newFamIssueCard,
      medicalNotes: newFamIssueCard ? 'Individual CR80 Health Card requested' : 'Covered under primary family card'
    };
    setFamilyMembers(prev => [...prev, newMember]);
    setNewFamName('');
    setNewFamRel('Son');
    setNewFamAge('');
    setNewFamMobile('');
    setNewFamIssueCard(true);
    setShowAddMemberForm(false);
    showToast('success', 'Family Member Added', `${newMember.fullName} (${newMember.relationship}) added to card.`);
  };

  const handleRemoveFamilyMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
    showToast('info', 'Member Removed', 'Family member removed from application.');
  };

  // Comprehensive Mandatory Form Validation
  const handleNextToPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!photoUrl) {
      errors.photo = 'Passport size photo is mandatory for PVC digital health card printing.';
    }
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Cardholder full legal name is mandatory.';
    }
    if (!dob) {
      errors.dob = 'Date of birth is mandatory.';
    }
    if (!gender) {
      errors.gender = 'Gender selection is mandatory.';
    }
    if (!bloodGroup) {
      errors.bloodGroup = 'Blood group selection is mandatory.';
    }
    const cleanMobile = mobile.trim().replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      errors.mobile = 'Valid 10-digit mobile number is mandatory for card login & OTP.';
    }
    if (!email.trim() || !email.includes('@')) {
      errors.email = 'Valid email address is mandatory for receiving digital e-Card.';
    }
    if (!cityArea.trim()) {
      errors.cityArea = 'Street address / village / locality is mandatory.';
    }
    if (!postOffice.trim()) {
      errors.postOffice = 'Post office is mandatory.';
    }
    if (!policeStation.trim()) {
      errors.policeStation = 'Police station is mandatory.';
    }
    if (!district.trim()) {
      errors.district = 'District is mandatory.';
    }
    const cleanPin = pinCode.trim().replace(/\D/g, '');
    if (!cleanPin || cleanPin.length < 6) {
      errors.pinCode = 'Valid 6-digit postal PIN code is mandatory.';
    }
    if (!emName.trim()) {
      errors.emName = 'Emergency contact person name is mandatory.';
    }
    const cleanEmMobile = emMobile.trim().replace(/\D/g, '');
    if (!cleanEmMobile || cleanEmMobile.length < 10) {
      errors.emMobile = 'Emergency contact 10-digit mobile number is mandatory.';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      showToast('error', 'All Fields Mandatory', 'Please upload your passport photo and fill all mandatory fields marked with *');
      
      // Auto-focus and scroll to first missing element
      if (errors.photo) {
        document.getElementById('photo-uploader-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const firstKey = Object.keys(errors)[0];
        const elem = document.getElementById(`input-${firstKey}`);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          elem.focus();
        }
      }
      return;
    }

    setStep(2);
  };

  const handleNextToPayment = () => {
    setPaymentReference(`PAY-${Date.now().toString(36).toUpperCase()}`);
    setUtrError('');
    setVoucherError('');
    setStep(3);
  };

  const handleVerifyVoucher = () => {
    setVoucherError('');
    if (!voucherCodeInput.trim()) {
      setVoucherError('Please enter Voucher Code (যেমন: LMDX-CSH-2026-00001)');
      return;
    }
    if (!voucherPinInput.trim()) {
      setVoucherError('Please enter 6-digit Cryptographic PIN printed on the voucher slip.');
      return;
    }

    setIsVerifyingVoucher(true);
    setTimeout(() => {
      const res = CashDeskVoucherService.validateVoucherForPayment(
        voucherCodeInput,
        voucherPinInput,
        fullName
      );
      setIsVerifyingVoucher(false);

      if (res.valid && res.voucher) {
        setVerifiedVoucher(res.voucher);
        setVoucherError('');
        showToast('success', 'Voucher Verified!', `Valid voucher found: ₹${res.voucher.amount} (${res.voucher.categoryName})`);
      } else {
        setVerifiedVoucher(null);
        setVoucherError(res.error || 'Voucher verification failed.');
        showToast('error', 'Voucher Invalid', res.error || 'Voucher verification failed.');
      }
    }, 350);
  };

  const handleFinalPaymentSubmit = (overrideTxnRef?: string, overrideMethod?: string) => {
    // 1. Validation for UPI Dynamic QR + 12-Digit UTR submission
    if (paymentMethod === 'upi_qr' && !overrideTxnRef) {
      const cleanUtr = utrNumber.trim().replace(/\s+/g, '');
      if (!cleanUtr || cleanUtr.length < 8) {
        setUtrError('Please enter valid 12-digit UTR / UPI Reference Number from your payment app.');
        showToast('error', '12-Digit UTR Required', 'Please enter your 12-digit UPI UTR number so Super Admin can verify your transaction.');
        return;
      }
    }

    // 2. Validation & Single-Use Redemption for Cash Desk Voucher
    let redeemedVoucherRecord: CashDeskVoucher | null = null;
    if (paymentMethod === 'voucher_code' && !overrideTxnRef) {
      if (!voucherCodeInput.trim() || !voucherPinInput.trim()) {
        setVoucherError('Please enter both Voucher Code and Security PIN.');
        showToast('error', 'Voucher Required', 'Please enter your Voucher Code and 6-digit PIN.');
        return;
      }

      // Execute Single-Use Redemption immediately to prevent ANY duplicate usage!
      const redeemRes = CashDeskVoucherService.verifyAndRedeemVoucher(
        voucherCodeInput,
        voucherPinInput,
        fullName || 'Online Card Applicant',
        {
          redemptionChannel: 'wallet_credit',
          redemptionNotes: `Redeemed for Digital Health Card Application (${selectedMembership.name})`,
          patientName: fullName,
          billReference: `APP-CARD-${Date.now().toString(36).toUpperCase()}`
        }
      );

      if (!redeemRes.success || !redeemRes.voucher) {
        setVoucherError(redeemRes.error || 'Failed to redeem voucher. It may have already been used.');
        showToast('error', 'Voucher Redemption Blocked', redeemRes.error || 'Failed to redeem voucher.');
        return;
      }

      redeemedVoucherRecord = redeemRes.voucher;
      setVerifiedVoucher(redeemedVoucherRecord);
    }

    setIsSubmitting(true);

    const resolvedRef = overrideTxnRef || (
      paymentMethod === 'upi_qr'
        ? `UTR: ${utrNumber.trim()}`
        : paymentMethod === 'voucher_code' && redeemedVoucherRecord
        ? `VCH: ${redeemedVoucherRecord.voucherCode} [SEAL: ${redeemedVoucherRecord.authSealCode}]`
        : paymentReference
    );

    const resolvedMethod = overrideMethod || (
      paymentMethod === 'upi_qr'
        ? 'UPI Bharat QR (12-Digit UTR Verification)'
        : paymentMethod === 'voucher_code'
        ? 'Hospital Cash Desk Voucher (Single-Use Redeemed)'
        : paymentMethod === 'zoho_pay'
        ? 'Zoho Payments Merchant Gateway'
        : paymentMethod === 'cards'
        ? 'Debit/Credit Card (Tokenized)'
        : 'Partner NetBanking Gateway'
    );

    const paymentStatusVal = paymentMethod === 'upi_qr' ? 'pending_verification' : 'paid';

    setTimeout(() => {
      const fullAddressStr = `${cityArea.trim()}, P.O: ${postOffice.trim()}, P.S: ${policeStation.trim()}, ${district.trim()}, ${stateVal.trim()} - ${pinCode.trim()}`;

      const newApp = PortalService.saveCardApplication({
        fullName: fullName.trim(),
        dob: dob || '1995-01-01',
        age: typeof age === 'number' ? age : 30,
        gender,
        mobile: mobile.trim(),
        whatsapp: whatsapp.trim() || mobile.trim(),
        email: email.trim() || `${mobile.trim()}@labmedix.org`,
        bloodGroup,
        photoUrl: photoUrl || '/logo.jpg',
        address: {
          villageArea: cityArea.trim(),
          postOffice: postOffice.trim(),
          policeStation: policeStation.trim(),
          district: district.trim(),
          state: stateVal.trim(),
          pinCode: pinCode.trim(),
          fullAddress: fullAddressStr
        },
        emergencyContact: {
          name: emName.trim() || fullName.trim(),
          relationship: emRelation,
          mobile: emMobile.trim() || mobile.trim()
        },
        medicalInfo: {
          allergies: allergies.trim() || 'None',
          chronicConditions: chronicConditions.trim() || 'None',
          bloodGroup
        },
        clinicalVitals: {
          bpSystolic: parseFloat(bpSystolic) || undefined,
          bpDiastolic: parseFloat(bpDiastolic) || undefined,
          pulseRate: parseFloat(pulse) || undefined,
          bloodSugar: parseFloat(rbs) || undefined,
          spo2: parseFloat(spo2) || undefined,
          weightKg: parseFloat(weightKg) || undefined,
          heightCm: parseFloat(heightCm) || undefined,
          bmi: bmiData ? `${bmiData.val} (${bmiData.category})` : undefined
        },
        referralSource: referralSource !== 'none' ? referralSource : undefined,
        referralDetails: referralSource !== 'none' ? {
          source: referralSource,
          doctorId: selectedDoctorId,
          doctorName: customDoctorName || activeDoctors.find(d => d.id === selectedDoctorId)?.name,
          doctorClinic,
          referrerPatientId,
          referrerCardNumber,
          hospitalStaffName,
          hospitalStaffId,
          healthCampName,
          healthCampCode,
          agentName,
          agentCode,
          otherNotes: otherReferralDetails
        } : undefined,
        familyMembers: includeFamily ? familyMembers : [],
        membershipId: selectedMembership.id,
        membershipName: selectedMembership.name,
        membershipPrice: selectedMembership.registrationFee || 1000,
        initialDeposit,
        totalPaidAmount: totalPayable,
        paymentMethod: resolvedMethod,
        paymentReference: resolvedRef,
        paymentStatus: paymentStatusVal
      });

      setSubmittedApplication(newApp);
      setIsSubmitting(false);
      setStep(4);
      triggerCelebrationFireworks();
      showToast('success', 'Application Submitted!', `Application ${newApp.applicationNo} queued for Super Admin review.`);

      if (onApplicationComplete) {
        onApplicationComplete(newApp);
      }
    }, 1100);
  };

  const handlePrintSlip = () => {
    const printContent = document.getElementById('application-tracking-slip');
    if (!printContent) return;

    const printWin = window.open('', '', 'width=800,height=900');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <html>
        <head>
          <title>LABMEDIX - Health Card Application Slip</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #0f172a; margin: 0; background: #fff; }
            .slip-card { border: 2px solid #0f766e; border-radius: 16px; padding: 24px; max-width: 650px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 16px; margin-bottom: 16px; }
            .badge { display: inline-block; padding: 4px 12px; background: #ccfbf1; color: #0f766e; font-weight: bold; border-radius: 9999px; font-size: 11px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; margin-bottom: 16px; }
            .label { color: #64748b; font-size: 10px; text-transform: uppercase; }
            .val { font-weight: bold; color: #0f172a; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="slip-card">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // 3D Card Theme styles based on plan
  const getPlanTheme = (slug: string) => {
    if (slug === 'platinum' || slug.includes('platinum')) {
      return {
        bg: 'linear-gradient(135deg, #020617 0%, #1e293b 50%, #0f172a 100%)',
        border: 'border-slate-400',
        text: 'text-white',
        badge: 'bg-slate-700 text-slate-200 border-slate-500',
        glow: 'shadow-slate-500/20'
      };
    }
    if (slug === 'gold' || slug.includes('gold')) {
      return {
        bg: 'linear-gradient(135deg, #1c1308 0%, #451a03 50%, #78350f 100%)',
        border: 'border-amber-500/60',
        text: 'text-amber-100',
        badge: 'bg-amber-950 text-amber-300 border-amber-500',
        glow: 'shadow-amber-500/30'
      };
    }
    return {
      bg: 'linear-gradient(135deg, #02241C 0%, #064E3B 50%, #047857 100%)',
      border: 'border-emerald-500/60',
      text: 'text-emerald-100',
      badge: 'bg-emerald-950 text-emerald-300 border-emerald-500',
      glow: 'shadow-emerald-500/30'
    };
  };

  const planTheme = getPlanTheme(selectedMembership.slug || 'gold');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚡ LABMEDIX Official Digital Health Card Application"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Progress Step Header Bar with Glowing Step Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold font-mono">
          <div className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-2 shadow-sm ${
            step === 1
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 border-teal-300 shadow-lg shadow-teal-500/30 ring-2 ring-teal-400 font-black scale-[1.02]'
              : step > 1
              ? 'bg-teal-950/80 text-teal-300 border-teal-600/80'
              : 'bg-slate-900/90 text-slate-500 border-slate-800'
          }`}>
            <span className="w-5 h-5 rounded-full bg-slate-950/40 flex items-center justify-center text-[10px] font-bold">1</span>
            <span className="tracking-wide">1. Profile & Photo</span>
          </div>

          <div className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-2 shadow-sm ${
            step === 2
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/30 ring-2 ring-amber-400 font-black scale-[1.02]'
              : step > 2
              ? 'bg-teal-950/80 text-teal-300 border-teal-600/80'
              : 'bg-slate-900/90 text-slate-500 border-slate-800'
          }`}>
            <span className="w-5 h-5 rounded-full bg-slate-950/40 flex items-center justify-center text-[10px] font-bold">2</span>
            <span className="tracking-wide">2. 3D Card Plan</span>
          </div>

          <div className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-2 shadow-sm ${
            step === 3
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 border-teal-300 shadow-lg shadow-teal-500/30 ring-2 ring-teal-400 font-black scale-[1.02]'
              : step > 3
              ? 'bg-teal-950/80 text-teal-300 border-teal-600/80'
              : 'bg-slate-900/90 text-slate-500 border-slate-800'
          }`}>
            <span className="w-5 h-5 rounded-full bg-slate-950/40 flex items-center justify-center text-[10px] font-bold">3</span>
            <span className="tracking-wide">3. GPay Merchant QR</span>
          </div>

          <div className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-2 shadow-sm ${
            step === 4
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-400 font-black scale-[1.02]'
              : 'bg-slate-900/90 text-slate-500 border-slate-800'
          }`}>
            <span className="w-5 h-5 rounded-full bg-slate-950/40 flex items-center justify-center text-[10px] font-bold">4</span>
            <span className="tracking-wide">4. Approval Slip</span>
          </div>
        </div>

        {/* ================= STEP 1: PATIENT PROFILE & PASSPORT PHOTO ================= */}
        {step === 1 && (
          <form onSubmit={handleNextToPlan} className="space-y-5 text-xs">
            {/* Header Notification Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border border-teal-500/40 flex items-center justify-between text-teal-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-bold">Official Self-Registration • Every Field is Mandatory for Card Verification</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/40">
                ⭐ ISO 9001:2015 Verified
              </span>
            </div>

            {/* SECTION 0: PASSPORT SIZE PHOTO UPLOADER (MANDATORY) */}
            <div
              id="photo-uploader-section"
              className={`p-4 rounded-3xl bg-slate-900 border-2 transition-all ${
                validationErrors.photo
                  ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-950/10'
                  : photoUrl
                  ? 'border-teal-500/60 bg-gradient-to-r from-teal-950/30 via-slate-900 to-slate-900'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row items-center gap-5">
                {/* Passport Frame Visual */}
                <div className="relative w-32 h-40 rounded-2xl overflow-hidden border-2 border-dashed border-teal-400/80 bg-slate-950 shadow-2xl flex flex-col items-center justify-center group flex-shrink-0">
                  {isCameraActive ? (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover scale-x-[-1]"
                      autoPlay
                      playsInline
                      muted
                    />
                  ) : photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Passport Size Photo"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400 space-y-1">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-teal-400">
                        <User className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-slate-300 block uppercase">Passport Photo</span>
                      <span className="text-[8.5px] text-rose-400 font-bold block">* MANDATORY</span>
                    </div>
                  )}

                  {/* Oval Face Guide Overlay */}
                  <div className="absolute inset-2 border border-white/20 rounded-[50%] pointer-events-none opacity-40" />

                  {/* Delete Button */}
                  {photoUrl && !isCameraActive && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition-opacity shadow-md"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Upload & Camera Controls */}
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>📸 Official Passport Size Photo (পাসপোর্ট সাইজ ছবি)</span>
                      <span className="text-rose-500 text-base">*</span>
                    </strong>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono uppercase ${
                      photoUrl ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-rose-950 text-rose-300 border border-rose-500'
                    }`}>
                      {photoUrl ? '✓ Photo Attached' : '⚠️ Photo Required'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Standard 35mm × 45mm color portrait. Plain light/white background recommended. This photo will be physically printed on your CR80 Digital PVC Health Card.
                  </p>

                  {validationErrors.photo && (
                    <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{validationErrors.photo}</span>
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 justify-center md:justify-start">
                    {isCameraActive ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          className="bg-emerald-600 hover:bg-emerald-500 font-bold shadow-md"
                          leftIcon={<Camera className="w-3.5 h-3.5" />}
                          onClick={capturePhoto}
                        >
                          Capture Snapshot
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={stopCamera}
                        >
                          Cancel Camera
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="bg-slate-800 border-teal-500/40 text-teal-300 hover:bg-slate-700 font-bold"
                          leftIcon={<Camera className="w-3.5 h-3.5 text-teal-400" />}
                          onClick={startCamera}
                        >
                          Take Live Selfie / Webcam
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="bg-slate-800 border-slate-700 hover:bg-slate-700 font-bold text-white"
                          leftIcon={<Upload className="w-3.5 h-3.5 text-blue-400" />}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Upload From Device
                        </Button>
                      </>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* Quick Sample Selector */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium font-sans">⚡ Or 1-Click Sample Avatar:</span>
                    {samplePassportPhotos.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPhotoUrl(s.url);
                          if (validationErrors.photo) {
                            setValidationErrors(prev => {
                              const next = { ...prev };
                              delete next.photo;
                              return next;
                            });
                          }
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-teal-900 border border-slate-700 text-[10px] text-slate-300 font-medium transition-colors"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1: PRIMARY PERSONAL IDENTIFICATION */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <User className="w-4 h-4 text-teal-400" />
                1. Personal Identity & Bio Data (All Fields Mandatory)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Full Name */}
                <div className="sm:col-span-2">
                  <Input
                    id="input-fullName"
                    tabIndex={1}
                    label="1. Cardholder Full Name"
                    placeholder="Enter legal full name e.g. Aniket Mandal"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={(e) => handleFieldKeyDown(e, 'input-dob')}
                    leftIcon={<User className="w-4 h-4 text-slate-400" />}
                    error={validationErrors.fullName}
                    required
                  />
                </div>

                {/* 2. Gender */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    2. Gender <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['male', 'female', 'other'] as const).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2 rounded-xl font-bold uppercase text-[11px] transition-all ${
                          gender === g ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 3. Date of Birth */}
                <Input
                  id="input-dob"
                  tabIndex={2}
                  label="3. Date of Birth"
                  type="date"
                  value={dob}
                  onChange={(e) => handleDobChange(e.target.value)}
                  onKeyDown={(e) => handleFieldKeyDown(e, 'input-age')}
                  error={validationErrors.dob}
                  required
                />

                {/* 4. Age */}
                <Input
                  id="input-age"
                  tabIndex={3}
                  label="4. Age (Auto-Calculated)"
                  type="number"
                  placeholder="Age in years"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || '')}
                  onKeyDown={(e) => handleFieldKeyDown(e, 'input-bloodGroup')}
                  required
                />

                {/* 5. Blood Group */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    5. Blood Group <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="input-bloodGroup"
                    tabIndex={4}
                    aria-label="Blood Group"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    onKeyDown={(e) => handleFieldKeyDown(e, 'input-mobile')}
                    className="w-full p-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white font-bold text-xs focus:border-teal-400 focus:outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: CONTACT & NOTIFICATIONS */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                2. Contact & Communication Channels (All Fields Mandatory)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 6. Mobile Number */}
                <Input
                  id="input-mobile"
                  tabIndex={5}
                  label="6. Mobile Number (Card Login ID)"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  onKeyDown={(e) => handleFieldKeyDown(e, 'input-whatsapp')}
                  leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                  error={validationErrors.mobile}
                  required
                />

                {/* 7. WhatsApp Number */}
                <div>
                  <Input
                    id="input-whatsapp"
                    tabIndex={6}
                    label="7. WhatsApp Number"
                    placeholder="WhatsApp number for reports"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    onKeyDown={(e) => handleFieldKeyDown(e, 'input-email')}
                    leftIcon={<Smartphone className="w-4 h-4 text-emerald-400" />}
                    required
                  />
                  <label className="flex items-center gap-1.5 mt-1 text-[10.5px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsMobile}
                      onChange={(e) => setSameAsMobile(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-teal-500"
                    />
                    <span>Same as Primary Mobile</span>
                  </label>
                </div>

                {/* 8. Email Address */}
                <Input
                  id="input-email"
                  tabIndex={7}
                  label="8. Email Address (Digital e-Card)"
                  placeholder="patient@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => handleFieldKeyDown(e, 'input-cityArea')}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  error={validationErrors.email}
                  required
                />
              </div>
            </div>

            {/* SECTION 3: RESIDENTIAL POSTAL ADDRESS */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  3. Residential Address & Police Verification (All Fields Mandatory)
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddressPopupOpen(true)}
                  className="px-3 py-1 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[11px] font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-sm"
                >
                  <Search className="w-3.5 h-3.5 text-teal-400" />
                  <span>📍 Auto Popup Address / PIN Lookup</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 9. Street Address */}
                <Input
                  id="input-cityArea"
                  tabIndex={8}
                  label="9. Street / Village / Locality"
                  placeholder="e.g. 14/B Central Avenue, Behala"
                  value={cityArea}
                  onChange={(e) => setCityArea(e.target.value)}
                  onKeyDown={(e) => handleFieldKeyDown(e, 'input-postOffice')}
                  error={validationErrors.cityArea}
                  required
                />

                {/* 10. Post Office */}
                <Input
                  id="input-postOffice"
                  tabIndex={9}
                  label="10. Post Office (P.O.)"
                  placeholder="e.g. Behala P.O."
                  value={postOffice}
                  onChange={(e) => setPostOffice(e.target.value)}
                  onKeyDown={(e) => handleFieldKeyDown(e, 'input-policeStation')}
                  error={validationErrors.postOffice}
                  required
                />

                {/* 11. Police Station */}
                <Input
                  id="input-policeStation"
                  tabIndex={10}
                  label="11. Police Station (P.S.)"
                  placeholder="e.g. Behala P.S."
                  value={policeStation}
                  onChange={(e) => setPoliceStation(e.target.value)}
                  onKeyDown={(e) => handleFieldKeyDown(e, 'input-district')}
                  error={validationErrors.policeStation}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 12. District */}
                <Input
                  id="input-district"
                  tabIndex={11}
                  label="12. District"
                  placeholder="e.g. Kolkata / South 24 Parganas"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  onKeyDown={(e) => handleFieldKeyDown(e, 'input-state')}
                  error={validationErrors.district}
                  required
                />

                {/* 13. State */}
                <Input
                  id="input-state"
                  tabIndex={12}
                  label="13. State"
                  placeholder="e.g. West Bengal"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  onKeyDown={(e) => handleFieldKeyDown(e, 'input-pinCode')}
                  required
                />

                {/* 14. PIN Code */}
                <div>
                  <Input
                    id="input-pinCode"
                    tabIndex={13}
                    label="14. Postal PIN Code (6 Digits)"
                    placeholder="e.g. 700034"
                    value={pinCode}
                    onChange={(e) => handlePinCodeChange(e.target.value)}
                    onKeyDown={(e) => handleFieldKeyDown(e, 'input-emName')}
                    error={validationErrors.pinCode}
                    required
                  />
                  <span className="text-[10px] text-teal-400/80 block mt-0.5">
                    💡 Typing 6 digits will auto-resolve Post Office & Police Station
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 4: EMERGENCY MEDICAL CONTACT */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-rose-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                4. 24x7 Emergency Contact Person (All Fields Mandatory)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 15. Emergency Name */}
                <Input
                  id="input-emName"
                  tabIndex={14}
                  label="15. Emergency Contact Name"
                  placeholder="e.g. Piyali Mandal"
                  value={emName}
                  onChange={(e) => setEmName(e.target.value)}
                  onKeyDown={(e) => handleFieldKeyDown(e, 'input-emRelation')}
                  error={validationErrors.emName}
                  required
                />

                {/* 16. Relationship */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    16. Relationship <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="input-emRelation"
                    tabIndex={15}
                    aria-label="Emergency Relationship"
                    value={emRelation}
                    onChange={(e) => setEmRelation(e.target.value)}
                    onKeyDown={(e) => handleFieldKeyDown(e, 'input-emMobile')}
                    className="w-full p-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white font-bold text-xs focus:border-teal-400 focus:outline-none"
                  >
                    <option value="Spouse">Spouse (Wife / Husband)</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Friend">Friend / Relative</option>
                  </select>
                </div>

                {/* 17. Emergency Mobile */}
                <Input
                  id="input-emMobile"
                  tabIndex={16}
                  label="17. Emergency Mobile Number"
                  placeholder="10-digit emergency number"
                  value={emMobile}
                  onChange={(e) => setEmMobile(e.target.value)}
                  error={validationErrors.emMobile}
                  required
                />
              </div>
            </div>

            {/* SECTION 5: 1-CARD WHOLE FAMILY COVERAGE SYSTEM & INDIVIDUAL CARD ISSUANCE */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-teal-500/10 border-2 border-amber-500/40 space-y-3 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                    <Users2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">Family Shield Coverage (1 Card Covers Whole Family)</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950">
                        RECOMMENDED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Add spouse, children, elderly parents, or siblings. Entire household shares 1 Health Card or can request individual cards per member.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIncludeFamily(!includeFamily)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                    includeFamily
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black ring-2 ring-amber-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Users2 className="w-3.5 h-3.5" />
                  <span>{includeFamily ? '✓ Family Shield Active' : '+ Add Family Dependents'}</span>
                </button>
              </div>

              {includeFamily && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      Covered Family Dependents ({familyMembers.length} Members Added):
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                      className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showAddMemberForm ? 'Close Form' : '+ Add Family Member'}</span>
                    </button>
                  </div>

                  {showAddMemberForm && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-teal-500/30 space-y-3 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Family Member Full Name"
                            value={newFamName}
                            onChange={(e) => setNewFamName(e.target.value)}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:border-teal-400"
                          />
                        </div>
                        <div>
                          <select
                            value={newFamRel}
                            onChange={(e) => setNewFamRel(e.target.value)}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                          >
                            <option value="Spouse">Spouse (Wife/Husband)</option>
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                            <option value="Other">Other Dependent</option>
                          </select>
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Age (Years)"
                            value={newFamAge}
                            onChange={(e) => setNewFamAge(parseInt(e.target.value) || '')}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <select
                            value={newFamGender}
                            onChange={(e) => setNewFamGender(e.target.value as any)}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                          >
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <select
                            value={newFamBlood}
                            onChange={(e) => setNewFamBlood(e.target.value)}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                          >
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Mobile (Optional)"
                            value={newFamMobile}
                            onChange={(e) => setNewFamMobile(e.target.value)}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-amber-500/30">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-200">
                          <input
                            type="checkbox"
                            checked={newFamIssueCard}
                            onChange={(e) => setNewFamIssueCard(e.target.checked)}
                            className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-amber-400"
                          />
                          <span>💳 Issue Individual CR80 Physical Health Card for this Member</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAddFamilyMember}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:scale-105 transition-all shadow-md shrink-0 self-end sm:self-auto"
                        >
                          Add Member to Shield
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of currently added family members */}
                  {familyMembers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {familyMembers.map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-400/40 flex items-center justify-between text-xs transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px]">
                              {m.relationship.slice(0, 1)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white block">{m.fullName}</span>
                                {m.issueCard ? (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                                    Card: Yes
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-800 text-slate-400">
                                    Covered Dependent
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {m.relationship} • {m.age} yrs • Blood: {m.bloodGroup}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFamilyMember(m.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                            aria-label="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No family members added yet. Click "+ Add Family Member" above.</p>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 6: CLINICAL MEASUREMENTS & PRELIMINARY TRIAGE */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  6. Preliminary Clinical Measurements & Health Profile (Optional)
                </span>
                {bmiData && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${bmiData.color}`}>
                    BMI: {bmiData.val} ({bmiData.category})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">BP (Systolic / Diastolic)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      placeholder="Sys (120)"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(e.target.value)}
                      className="w-1/2 p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                    />
                    <input
                      type="number"
                      placeholder="Dia (80)"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(e.target.value)}
                      className="w-1/2 p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 72"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Blood Sugar / RBS (mg/dL)</label>
                  <input
                    type="number"
                    placeholder="e.g. 110"
                    value={rbs}
                    onChange={(e) => setRbs(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">SpO2 Oxygen (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 99"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Weight (Kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 68"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 172"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Known Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Dust, None"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Chronic Medical History</label>
                  <input
                    type="text"
                    placeholder="e.g. Hypertension, Diabetes, None"
                    value={chronicConditions}
                    onChange={(e) => setChronicConditions(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 7: OTHERS RECOMMEND & REFERRAL DETAILS */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <UserCheck className="w-4 h-4 text-purple-400" />
                7. Referral Source & "Others Recommend"
              </span>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Who Recommended LabMedix Health Card to You?
                  </label>
                  <select
                    value={referralSource}
                    onChange={(e) => setReferralSource(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-700 text-white font-bold text-xs focus:border-teal-400 focus:outline-none"
                  >
                    <option value="none">Direct / Self Walk-in (No referral)</option>
                    <option value="doctor">🩺 Recommended by Doctor / Physician</option>
                    <option value="existing_cardholder">💳 Recommended by Existing Health Cardholder / Relative</option>
                    <option value="hospital_staff">🏥 Hospital / Nursing Home Staff</option>
                    <option value="health_camp">🏕️ Free Health Screening Camp</option>
                    <option value="agent">🤝 Community Health Representative / Agent</option>
                    <option value="other">💬 Other Source (Social Media, Flyer, Newspaper)</option>
                  </select>
                </div>

                {/* Sub-form based on Referral Source */}
                {referralSource === 'doctor' && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Select Doctor from Master Registry
                        </label>
                        <select
                          value={selectedDoctorId}
                          onChange={(e) => {
                            setSelectedDoctorId(e.target.value);
                            const doc = activeDoctors.find(d => d.id === e.target.value);
                            if (doc) {
                              setCustomDoctorName(doc.name);
                              setDoctorClinic(doc.department || doc.opdRoom || '');
                            }
                          }}
                          className="w-full p-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white text-xs font-bold"
                        >
                          <option value="">-- Choose Referring Doctor --</option>
                          {activeDoctors.map(doc => (
                            <option key={doc.id} value={doc.id}>
                              {doc.name} ({doc.speciality} - {doc.qualification})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Or Enter Doctor Name (If not in list)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Dr. A. K. Banerjee"
                          value={customDoctorName}
                          onChange={(e) => setCustomDoctorName(e.target.value)}
                          className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {referralSource === 'existing_cardholder' && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Referrer Card Number (e.g. LMX-GOLD-9482)"
                        placeholder="LMX-XXXX-XXXX"
                        value={referrerCardNumber}
                        onChange={(e) => setReferrerCardNumber(e.target.value)}
                      />
                      <Input
                        label="Referrer Patient ID / Mobile Number"
                        placeholder="e.g. PID-2026-001 or 9876543210"
                        value={referrerPatientId}
                        onChange={(e) => setReferrerPatientId(e.target.value)}
                      />
                    </div>
                    <span className="text-[10px] text-purple-300 block">
                      🎁 Both referrer and applicant receive 100 Health Points upon issuance!
                    </span>
                  </div>
                )}

                {referralSource === 'hospital_staff' && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Staff Name / Desk"
                        placeholder="e.g. Reception Desk 2 / Nurse Priya"
                        value={hospitalStaffName}
                        onChange={(e) => setHospitalStaffName(e.target.value)}
                      />
                      <Input
                        label="Staff Employee ID"
                        placeholder="e.g. EMP-1042"
                        value={hospitalStaffId}
                        onChange={(e) => setHospitalStaffId(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {referralSource === 'health_camp' && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Camp Name / Location"
                        placeholder="e.g. Behala Free Health Checkup Camp"
                        value={healthCampName}
                        onChange={(e) => setHealthCampName(e.target.value)}
                      />
                      <Input
                        label="Camp Verification Code"
                        placeholder="e.g. CAMP-2026-KOL"
                        value={healthCampCode}
                        onChange={(e) => setHealthCampCode(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {referralSource === 'agent' && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Representative / Agent Name"
                        placeholder="e.g. Amitava Ghosh"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                      />
                      <Input
                        label="Agent ID / Badge Code"
                        placeholder="e.g. AGT-WB-042"
                        value={agentCode}
                        onChange={(e) => setAgentCode(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {referralSource === 'other' && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/30 animate-in fade-in duration-200">
                    <Input
                      label="Please describe how you heard about us"
                      placeholder="e.g. Newspaper ad, Facebook, Banner near hospital..."
                      value={otherReferralDetails}
                      onChange={(e) => setOtherReferralDetails(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Form Footer Action */}
            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                id="btn-proceed-step1"
                type="submit"
                variant="primary"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 font-bold shadow-lg text-sm px-6 py-2.5"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Card Plan Selection →
              </Button>
            </div>
          </form>
        )}

        {/* ================= STEP 2: 3D CARD PLAN SELECTION ================= */}
        {step === 2 && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Select Health Card Privilege Tier</h3>
                <p className="text-xs text-slate-400">Choose your membership level (Gold Recommended) with real-time 3D preview</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-400 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip to {isCardFlipped ? 'Front' : 'Back'}</span>
              </button>
            </div>

            {/* 3D INTERACTIVE CARD VISUAL PREVIEW BOX WITH REAL PASSPORT PHOTO */}
            <div className="flex justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
              <div
                className="w-full max-w-[420px] aspect-[1.586/1] rounded-2xl p-5 text-white shadow-2xl border flex flex-col justify-between relative transform hover:scale-102 transition-transform"
                style={{
                  background: planTheme.bg,
                  borderColor: selectedMembership.color
                }}
              >
                {/* Holographic Watermark glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none rounded-2xl" />

                {!isCardFlipped ? (
                  <>
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shadow-md">
                          <img src={company.logoUrl || '/logo.jpg'} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <strong className="text-xs font-black tracking-wider uppercase block">{company.name}</strong>
                          <span className="text-[9px] text-teal-300 font-mono">DIGITAL HEALTH CARD</span>
                        </div>
                      </div>

                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono border"
                        style={{
                          backgroundColor: selectedMembership.color + '30',
                          color: selectedMembership.color,
                          borderColor: selectedMembership.color
                        }}
                      >
                        {selectedMembership.name}
                      </span>
                    </div>

                    {/* Cardholder Info with Real Uploaded Passport Photo */}
                    <div className="my-auto py-2 relative z-10 flex items-center gap-3.5">
                      <div className="w-14 h-16 rounded-xl bg-slate-950 border-2 border-white/50 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
                        {photoUrl ? (
                          <img src={photoUrl} alt="Passport Photo" className="w-full h-full object-cover object-top" />
                        ) : (
                          <User className="w-8 h-8 text-slate-400" />
                        )}
                      </div>

                      <div>
                        <span className="text-[9.5px] text-slate-300 font-mono tracking-widest block">CARDHOLDER NAME</span>
                        <strong className="text-base font-black tracking-wide text-white block uppercase">
                          {fullName || 'YOUR NAME'}
                        </strong>
                        <span className="text-[10.5px] font-mono text-amber-300 mt-0.5 block">
                          LHC-2026-PENDING • {gender.toUpperCase()} • BLOOD: {bloodGroup}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 border-t border-white/20 pt-2 relative z-10">
                      <span>VALIDITY: {selectedMembership.validityMonths || 12} MONTHS</span>
                      <span className="text-emerald-300 font-bold">{selectedMembership.opdDiscount}% OPD • {selectedMembership.labDiscount}% LAB</span>
                      <span>NABH CERTIFIED</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-slate-950/80 rounded-xl border border-white/20 text-center font-mono text-[9px] text-slate-300 space-y-1">
                      <p>Emergency Helpline: <strong>{company.helpline || '1800-889-9911'}</strong></p>
                      <p>Scan QR at any hospital/lab counter for instant 100% cashless treatment float.</p>
                    </div>
                    <div className="text-center py-2">
                      <QrCode className="w-14 h-14 mx-auto text-white/80" />
                      <span className="text-[8.5px] font-mono text-teal-300 block mt-1">VER-2026-PROVISIONAL</span>
                    </div>
                    <div className="text-[8px] font-mono text-slate-400 text-center border-t border-white/20 pt-1">
                      Cardholder Benefits: {selectedMembership.opdDiscount}% OPD, {selectedMembership.labDiscount}% Pathology, {selectedMembership.pharmacyDiscount}% Pharmacy
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Membership Plan Selection Cards (Recommended Highlighted) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {memberships.map((mem) => {
                const isSelected = selectedMembershipId === mem.id;
                const isRecommended = mem.slug === 'gold' || mem.name.toLowerCase().includes('gold');
                return (
                  <div
                    key={mem.id}
                    onClick={() => setSelectedMembershipId(mem.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                      isSelected
                        ? 'bg-gradient-to-b from-slate-900 to-teal-950 border-teal-400 ring-2 ring-teal-400/40 shadow-xl'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md">
                        RECOMMENDED
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <strong className="text-sm font-black text-white">{mem.name}</strong>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                      </div>

                      <div className="text-lg font-black text-emerald-400 font-mono mb-2">
                        {formatCurrency(mem.registrationFee || 1000)}
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-300 font-mono border-t border-slate-800 pt-2">
                        <div className="flex justify-between">
                          <span>Doctor OPD:</span>
                          <strong className="text-teal-300">{mem.opdDiscount}% OFF</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Pathology Lab:</span>
                          <strong className="text-teal-300">{mem.labDiscount}% OFF</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Pharmacy:</span>
                          <strong className="text-teal-300">{mem.pharmacyDiscount}% OFF</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Validity:</span>
                          <span>{mem.validityMonths} Months</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`mt-3 w-full py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        isSelected ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isSelected ? 'Selected Plan ✓' : 'Select Plan'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Optional Cashless Wallet Float Deposit */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  Initial Cashless Treatment Wallet Float Deposit (Optional):
                </span>
                <span className="text-emerald-400 font-mono font-bold text-sm">+{formatCurrency(initialDeposit)}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                100% of this float is credited to your card upon activation for instant cashless doctor OPD and diagnostic tests.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {[0, 500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInitialDeposit(amt)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                      initialDeposit === amt
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {amt === 0 ? 'No Initial Float' : `+ ₹${amt} ${amt === 500 ? '(Recommended)' : ''}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/40 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-slate-400 block font-sans">Total Payable Amount (Card Registration + Wallet Float):</span>
                <span className="text-teal-300 text-sm font-bold font-sans">{selectedMembership.name}</span>
              </div>
              <div className="text-right">
                <strong className="text-xl font-black text-emerald-400 font-mono">{formatCurrency(totalPayable)}</strong>
                <span className="text-[10px] text-slate-400 block font-sans">All Taxes Included</span>
              </div>
            </div>

            {/* Wizard Navigation */}
            <div className="pt-2 flex justify-between gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Profile
              </Button>
              <Button
                type="button"
                variant="primary"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 font-bold shadow-lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleNextToPayment}
              >
                Proceed to Live Payment ({formatCurrency(totalPayable)}) →
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: LIVE PAYMENT & VERIFICATION ================= */}
        {step === 3 && (
          <div className="space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-400/40 uppercase tracking-wider">
                  Payment Verification Mode
                </span>
                <h3 className="text-sm font-black text-white mt-1">Select Payment / Voucher Processing Method</h3>
                <p className="text-[11px] text-indigo-200">
                  Choose between UPI Bharat QR (UTR Verification) or Cash Desk Financial Voucher Code.
                </p>
              </div>
              <div className="text-right font-mono bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 flex-shrink-0">
                <span className="text-[10px] text-slate-400 block font-sans">Total Payable (Card + Float):</span>
                <strong className="text-emerald-400 text-base font-black">{formatCurrency(totalPayable)}</strong>
              </div>
            </div>

            {/* 2 Primary Modes Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Dynamic Bharat QR & UTR */}
              <div
                onClick={() => setPaymentMethod('upi_qr')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                  paymentMethod === 'upi_qr'
                    ? 'bg-gradient-to-br from-teal-950/90 via-slate-900 to-slate-900 border-teal-400 ring-2 ring-teal-400/50 shadow-xl'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/40">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-black text-teal-400 uppercase">OPTION 1 (RECOMMENDED)</span>
                      <h4 className="text-xs font-black text-white">Dynamic UPI QR & 12-Digit UTR</h4>
                    </div>
                  </div>
                  {paymentMethod === 'upi_qr' && <CheckCircle2 className="w-5 h-5 text-teal-400" />}
                </div>
                <p className="text-[11px] text-slate-300 mt-2">
                  Scan QR with GPay / PhonePe / Paytm, pay ₹{totalPayable}, and submit the 12-digit bank UTR reference.
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono text-teal-300/90 font-bold">
                  ⚡ Verified by Super Admin & Auto-Minted
                </span>
              </div>

              {/* Option 2: Cash Desk Voucher Code */}
              <div
                onClick={() => setPaymentMethod('voucher_code')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                  paymentMethod === 'voucher_code'
                    ? 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-900 border-amber-400 ring-2 ring-amber-400/50 shadow-xl'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/40">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-black text-amber-400 uppercase">OPTION 2 (OFFICIAL VOUCHER)</span>
                      <h4 className="text-xs font-black text-white">Cash Desk Voucher Code & PIN</h4>
                    </div>
                  </div>
                  {paymentMethod === 'voucher_code' && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-300 mt-2">
                  Enter official hospital cash desk voucher slip code & cryptographic PIN. Strict single-use protected.
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono text-amber-300/90 font-bold">
                  🛡️ Instant Anti-Duplicate Verification
                </span>
              </div>
            </div>

            {/* Other Payment Methods Toggle / Fallbacks */}
            {(isZohoEnabled || true) && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Other Methods:</span>
                <div className="flex flex-wrap gap-1.5">
                  {isZohoEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('zoho_pay')}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all ${
                        paymentMethod === 'zoho_pay'
                          ? 'bg-teal-600 text-white border-teal-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Zoho Merchant (India)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cards')}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all ${
                      paymentMethod === 'cards'
                        ? 'bg-teal-600 text-white border-teal-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Debit / Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'bg-teal-600 text-white border-teal-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    NetBanking
                  </button>
                </div>
              </div>
            )}

            {/* ================= OPTION 1 CONTENT: UPI QR & 12-DIGIT UTR ================= */}
            {paymentMethod === 'upi_qr' && (
              <div className="space-y-4">
                <GooglePayMerchantQR
                  amount={totalPayable}
                  referenceNo={paymentReference}
                  note={`Health Card Registration: ${selectedMembership.name}`}
                  merchantVpa={company.upiSettings?.merchantVpa || '7047108226@okbizaxis'}
                  merchantName={company.upiSettings?.merchantName || company.name}
                  merchantMcc={company.upiSettings?.merchantMcc || '8099'}
                />

                {/* 12-Digit UTR Submission Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border-2 border-teal-500/50 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-teal-300 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-teal-400" />
                      Submit 12-Digit Bank UTR / UPI Reference Number (বাধ্যতামূলক):
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                      Super Admin Verification Required
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Input
                      label="12-Digit UTR Number (যেমন: 428190348210)"
                      placeholder="Enter 12-digit UTR from GPay/PhonePe payment receipt"
                      value={utrNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                        setUtrNumber(val);
                        if (val.length >= 10) setUtrError('');
                      }}
                      error={utrError}
                      leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      className="font-mono text-sm font-black tracking-widest text-emerald-300 bg-slate-900 border-teal-500/60"
                      required
                    />
                    <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-1">
                      <span>Digit Count: <strong className={utrNumber.length === 12 ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>{utrNumber.length}/12 digits</strong></span>
                      <span className="text-slate-400">Found in Google Pay / PhonePe / Paytm payment details under "UPI Ref No / UTR"</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <span className="font-bold text-teal-300 block">ℹ️ Super Admin Auto-Minting Process:</span>
                    <p>1. After submission, Dr. Labmedix Super Admin will reconcile this 12-digit UTR against the hospital bank account.</p>
                    <p>2. Once verified, your <strong>{selectedMembership.name}</strong> will be minted instantly with active NFC and wallet balance.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ================= OPTION 2 CONTENT: CASH DESK VOUCHER CODE & PIN ================= */}
            {paymentMethod === 'voucher_code' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-2 border-amber-500/60 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-amber-400" />
                      Hospital Cash Desk Voucher Redemption (ক্যাশ ডেস্ক ভাউচার কোড):
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400 text-slate-950 uppercase">
                      Single-Use Anti-Duplicate
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Enter the official <strong>Voucher Code</strong> and <strong>Cryptographic PIN</strong> printed on your Cash Desk Voucher slip.
                  </p>

                  {/* Voucher Input Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Voucher Code */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Voucher Serial Code <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. LMDX-CSH-2026-00001"
                          value={voucherCodeInput}
                          onChange={(e) => {
                            setVoucherCodeInput(e.target.value.toUpperCase());
                            setVerifiedVoucher(null);
                            setVoucherError('');
                          }}
                          className="w-full p-2.5 pl-9 rounded-xl border bg-slate-900 border-amber-500/50 text-white font-mono font-black text-xs tracking-wider focus:border-amber-400 focus:outline-none uppercase"
                        />
                        <Ticket className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    {/* Cryptographic PIN */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Cryptographic Security PIN <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showVoucherPin ? 'text' : 'password'}
                          placeholder="6-digit PIN (e.g. 839215)"
                          value={voucherPinInput}
                          onChange={(e) => {
                            setVoucherPinInput(e.target.value.replace(/\D/g, '').slice(0, 8));
                            setVerifiedVoucher(null);
                            setVoucherError('');
                          }}
                          className="w-full p-2.5 pl-9 pr-10 rounded-xl border bg-slate-900 border-amber-500/50 text-rose-400 font-mono font-black text-xs tracking-widest focus:border-amber-400 focus:outline-none"
                        />
                        <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowVoucherPin(!showVoucherPin)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs font-mono"
                        >
                          {showVoucherPin ? 'HIDE' : 'SHOW'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Verify Voucher Action */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
                    {/* Quick Active Voucher Sample Chips for Testing */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400">Quick Test Vouchers:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setVoucherCodeInput('LMDX-CSH-2026-00001');
                          setVoucherPinInput('839215');
                          setVerifiedVoucher(null);
                          setVoucherError('');
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 hover:bg-slate-700 font-mono text-[10px]"
                      >
                        LMDX-00001 (₹2000)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVoucherCodeInput('LMDX-CSH-2026-00002');
                          setVoucherPinInput('491827');
                          setVerifiedVoucher(null);
                          setVoucherError('');
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 hover:bg-slate-700 font-mono text-[10px]"
                      >
                        LMDX-00002 (₹1500)
                      </button>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      isLoading={isVerifyingVoucher}
                      onClick={handleVerifyVoucher}
                      className="border-amber-400 text-amber-300 hover:bg-amber-950 font-bold"
                      leftIcon={<ShieldCheck className="w-4 h-4 text-amber-400" />}
                    >
                      Verify Voucher Code
                    </Button>
                  </div>

                  {/* Verification Error Notice */}
                  {voucherError && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="block font-bold">Voucher Verification Blocked:</strong>
                        <p>{voucherError}</p>
                      </div>
                    </div>
                  )}

                  {/* Verified Voucher Success Banner */}
                  {verifiedVoucher && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-400 text-white space-y-2 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          VOUCHER VERIFIED & AUTHENTICATED
                        </span>
                        <span className="text-xs font-mono font-black text-emerald-400">
                          {formatCurrency(verifiedVoucher.amount)} Credit
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[9px] text-slate-400 block font-sans">Code:</span>
                          <strong className="text-white truncate block">{verifiedVoucher.voucherCode}</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[9px] text-slate-400 block font-sans">Category:</span>
                          <strong className="text-teal-300 truncate block">{verifiedVoucher.categoryName}</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[9px] text-slate-400 block font-sans">Auth Seal:</span>
                          <strong className="text-amber-400 truncate block">{verifiedVoucher.authSealCode}</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[9px] text-slate-400 block font-sans">Valid Till:</span>
                          <strong className="text-slate-200 truncate block">{formatDate(verifiedVoucher.validUntil)}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-bold bg-emerald-950/60 p-2 rounded-xl border border-emerald-500/40 mt-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Anti-Duplicate Lock: Upon submission, this voucher will be redeemed permanently. No duplicate usage permitted.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= OPTION 3 CONTENT: ZOHO / CARDS / NETBANKING ================= */}
            {paymentMethod === 'zoho_pay' && (
              <ZohoMerchantCheckout
                amount={totalPayable}
                orderDescription={`Health Card Registration: ${selectedMembership.name}`}
                patientName={fullName || 'Cardholder'}
                onPaymentSuccess={(result) => {
                  setPaymentReference(result.transactionId);
                  handleFinalPaymentSubmit(result.transactionId, result.gateway);
                }}
              />
            )}

            {paymentMethod === 'cards' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <Input label="Cardholder Name" value={fullName || 'Cardholder'} readOnly />
                <Input label="Card Number" placeholder="4532 •••• •••• 8892" value="4532 9988 7711 8892" readOnly />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Expiry Date" placeholder="MM/YY" value="08/29" readOnly />
                  <Input label="CVV" placeholder="•••" value="882" type="password" readOnly />
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-center py-6">
                <Building2 className="w-10 h-10 mx-auto text-teal-400 mb-2" />
                <h4 className="text-sm font-bold text-white">Indian Partner NetBanking Gateway</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Direct netbanking checkout via SBI, HDFC, ICICI, Axis Bank, and 50+ Indian Banks.
                </p>
              </div>
            )}

            {/* Wizard Navigation */}
            <div className="pt-2 flex justify-between gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Plan
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 font-black shadow-lg"
                onClick={() => handleFinalPaymentSubmit()}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {paymentMethod === 'voucher_code'
                  ? `Redeem Voucher & Submit Application (${formatCurrency(totalPayable)})`
                  : `Submit Application with ${paymentMethod === 'upi_qr' ? 'UTR Reference' : 'Payment'} (${formatCurrency(totalPayable)})`}
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: OFFICIAL APPLICATION SLIP & STATUS TRACKING ================= */}
        {step === 4 && submittedApplication && (
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950 border-2 border-emerald-500 text-center space-y-2 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-emerald-300 uppercase">
                Application & Payment Slip Generated!
              </h3>
              <p className="text-xs text-slate-300">
                Payment of <strong className="text-emerald-400">{formatCurrency(submittedApplication.totalPaidAmount)}</strong> confirmed. Application <strong className="text-white font-mono">{submittedApplication.applicationNo}</strong> is pending Super Admin review.
              </p>
            </div>

            {/* PRINTABLE OFFICIAL TRACKING SLIP */}
            <div id="application-tracking-slip" className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 font-mono text-xs shadow-xl">
              <div className="header text-center border-b border-slate-800 pb-3 space-y-1">
                <strong className="text-sm font-black text-white block uppercase tracking-wider">{company.name}</strong>
                <span className="text-[10px] text-teal-400 block font-sans">Official Health Card Application & Payment Receipt</span>
                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/60 uppercase">
                  STATUS: PENDING SUPER ADMIN APPROVAL
                </span>
              </div>

              {/* Slip Body with Photo */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-teal-500/50 shadow-md flex-shrink-0 bg-slate-900">
                  <img
                    src={submittedApplication.photoUrl || '/logo.jpg'}
                    alt={submittedApplication.fullName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="flex-1 grid grid-cols-2 gap-2.5 text-xs w-full">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Application Reference No:</span>
                    <strong className="text-teal-300 text-sm font-black">{submittedApplication.applicationNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Submission Date:</span>
                    <span className="text-slate-200">{formatDate(submittedApplication.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Applicant Full Name:</span>
                    <strong className="text-white font-sans">{submittedApplication.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Registered Mobile:</span>
                    <span className="text-slate-200">{submittedApplication.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Chosen Card Privilege Tier:</span>
                    <strong className="text-amber-400 font-sans">{submittedApplication.membershipName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Total Paid Amount:</span>
                    <strong className="text-emerald-400 font-bold">{formatCurrency(submittedApplication.totalPaidAmount)}</strong>
                  </div>
                </div>
              </div>

              {submittedApplication.familyMembers && submittedApplication.familyMembers.length > 0 && (
                <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px] font-sans">
                      <Users2 className="w-3.5 h-3.5" />
                      Family Shield Dependents (Covered Under Single Card):
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      {submittedApplication.familyMembers.length} Members Linked
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {submittedApplication.familyMembers.map((fm, idx) => (
                      <div key={fm.id || idx} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[10.5px]">
                        <span className="text-white font-medium">{fm.fullName} ({fm.relationship})</span>
                        <span className="text-slate-400 font-mono">{fm.age} yrs • {fm.bloodGroup}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-sans text-slate-300 space-y-1">
                <span className="font-bold text-teal-400 block">📱 Step-by-Step Approval Protocol:</span>
                <p>1. <strong>Super Administrator Review:</strong> Super Admin approves your application in the queue.</p>
                <p>2. <strong>Auto-Minting:</strong> Upon approval, your <strong>Health Card Number</strong>, <strong>CVV</strong>, and <strong>13.56 MHz NFC Chip</strong> are generated automatically.</p>
                <p>3. <strong>Cardholder Access:</strong> You can check your status anytime using your mobile number or Reference No.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<Printer className="w-4 h-4" />}
                  onClick={handlePrintSlip}
                >
                  Print Slip
                </Button>

                {onOpenStatusTracker && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-teal-500 text-teal-300 hover:bg-teal-950"
                    leftIcon={<Search className="w-4 h-4 text-teal-400" />}
                    onClick={() => {
                      onClose();
                      onOpenStatusTracker(submittedApplication.applicationNo);
                    }}
                  >
                    🔍 Check Status Live
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="primary"
                onClick={onClose}
              >
                Close Window
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Address Auto-Popup Modal for Patient Portal */}
      <AddressAutoPopupModal
        isOpen={isAddressPopupOpen}
        onClose={() => setIsAddressPopupOpen(false)}
        initialQuery={pinCode || cityArea || district}
        onSelectAddress={(addr) => {
          setCityArea(addr.cityArea);
          setPostOffice(addr.postOffice);
          setPoliceStation(addr.policeStation);
          setDistrict(addr.district);
          setStateVal(addr.state);
          setPinCode(addr.pinCode);
          showToast('success', 'Address Selected', `${addr.cityArea}, ${addr.district} (${addr.pinCode}) auto-populated.`);
        }}
      />
    </Modal>
  );
};
