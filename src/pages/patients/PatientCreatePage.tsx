import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientService, CreateFamilyMemberInput, CreatePatientResult } from '../../services/patientService';
import { StorageService } from '../../services/storage';
import { DoctorMasterService, DoctorMasterItem } from '../../services/doctorMasterService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { PhotoUploaderWebcam } from '../../components/common/PhotoUploaderWebcam';
import { AddressAutoPopupModal } from '../../components/common/AddressAutoPopupModal';
import { AddressLookupService } from '../../services/addressLookupService';
import { CR80CardFront } from '../../components/card/CR80CardFront';
import { calculateAge, formatCurrency, formatDate } from '../../utils/formatters';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { generatePatientId, generateCardNumber, generateVerificationCode, generateCardCvv } from '../../utils/idGenerator';
import { DEFAULT_CARD_DESIGN } from '../../constants/defaults';
import { HealthCard, Patient, CardThemePreset } from '../../types';
import {
  UserPlus,
  ArrowLeft,
  Heart,
  MapPin,
  PhoneCall,
  Shield,
  Wallet,
  Sparkles,
  Users,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  CreditCard,
  Printer,
  Eye,
  CheckCircle2,
  Stethoscope,
  Building,
  UserCheck,
  Award,
  Layers,
  Activity,
  FileBadge,
  Sliders,
  Share2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface FamilyMemberFormState extends CreateFamilyMemberInput {
  id: string;
}

export const PatientCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const memberships = StorageService.getMemberships().filter(m => m.status === 'active');
  const existingPatients = StorageService.getPatients();
  const existingCards = StorageService.getCards();
  const company = StorageService.getCompanyProfile();
  const doctors = DoctorMasterService.getAllDoctors().filter((d: DoctorMasterItem) => d.status === 'active');

  const previewNextPatientId = useMemo(() => generatePatientId(existingPatients.map(p => p.id)), [existingPatients]);
  const previewNextCardNumber = useMemo(() => generateCardNumber(existingCards.map(c => c.cardNumber)), [existingCards]);

  // Section 1: Primary Personal Details
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number>(32);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [photoUrl, setPhotoUrl] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('Married');
  const [occupation, setOccupation] = useState('Professional / Business');
  const [governmentIdType, setGovernmentIdType] = useState('Aadhaar Card');
  const [governmentIdNumber, setGovernmentIdNumber] = useState('');

  // Section 2: Address
  const [villageArea, setVillageArea] = useState('Medical Square Area');
  const [postOffice, setPostOffice] = useState('Central P.O.');
  const [policeStation, setPoliceStation] = useState('South P.S.');
  const [district, setDistrict] = useState('Kolkata');
  const [stateVal, setStateVal] = useState('West Bengal');
  const [pinCode, setPinCode] = useState('700001');
  const [fullAddress, setFullAddress] = useState('');
  const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);

  // Instant PIN Code Auto-Resolve
  const handlePinCodeChange = (newPin: string) => {
    setPinCode(newPin);
    const clean = newPin.trim();
    if (clean.length === 6 && /^\d{6}$/.test(clean)) {
      const results = AddressLookupService.lookupLocal(clean);
      if (results.length > 0) {
        const best = results[0];
        setVillageArea(best.cityArea);
        setPostOffice(best.postOffice);
        setPoliceStation(best.policeStation);
        setDistrict(best.district);
        setStateVal(best.state);
        showToast('info', 'Address Auto-Resolved', `Matched ${best.cityArea}, ${best.district}`);
      } else {
        AddressLookupService.resolvePinCodeAsync(clean).then(res => {
          if (res.length > 0) {
            const best = res[0];
            setVillageArea(best.cityArea);
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

  // Section 3: Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [emergencyMobile, setEmergencyMobile] = useState('');

  // Section 4: Clinical Triage & Measurements
  const [allergies, setAllergies] = useState('None');
  const [chronicConditions, setChronicConditions] = useState('None');
  const [portalPassword, setPortalPassword] = useState('');
  const [importantNotes, setImportantNotes] = useState('');
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [pulse, setPulse] = useState('74');
  const [rbs, setRbs] = useState('105');
  const [spo2, setSpo2] = useState('99');
  const [weightKg, setWeightKg] = useState('68');
  const [heightCm, setHeightCm] = useState('172');

  // BMI Calculation
  const bmiData = useMemo(() => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm) / 100;
    if (w > 0 && h > 0) {
      const val = parseFloat((w / (h * h)).toFixed(1));
      let category = 'Normal';
      let color = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300';
      if (val < 18.5) {
        category = 'Underweight';
        color = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300';
      } else if (val >= 25 && val < 30) {
        category = 'Overweight';
        color = 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-300';
      } else if (val >= 30) {
        category = 'Obese';
        color = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-300';
      }
      return { val, category, color };
    }
    return null;
  }, [weightKg, heightCm]);

  // Section 5: "Others Recommend" / Referral Details
  const [referralSource, setReferralSource] = useState<'none' | 'doctor' | 'existing_cardholder' | 'staff' | 'camp' | 'agent' | 'other'>('none');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [customDoctorName, setCustomDoctorName] = useState('');
  const [doctorClinic, setDoctorClinic] = useState('');
  const [referralCardNumber, setReferralCardNumber] = useState('');
  const [referralPersonName, setReferralPersonName] = useState('');
  const [referralContact, setReferralContact] = useState('');
  const [referralCampName, setReferralCampName] = useState('');
  const [referralAgentId, setReferralAgentId] = useState('');
  const [referralNotes, setReferralNotes] = useState('');

  // Section 6: Family Shield & Multi-Family Member Additions
  const [enableFamilyShield, setEnableFamilyShield] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberFormState[]>([]);

  // Section 7: Card Plan, Design & Wallet
  const [membershipId, setMembershipId] = useState(memberships[0]?.id || 'mem_gold');
  const [cardPreset, setCardPreset] = useState<CardThemePreset>('royal_gold');
  const [cardMaterial, setCardMaterial] = useState<'gloss' | 'matte' | 'metallic' | 'hologram'>('metallic');
  const [initialDeposit, setInitialDeposit] = useState('500');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal State
  const [createdResult, setCreatedResult] = useState<CreatePatientResult | null>(null);

  // Auto-set card preset based on selected membership
  const selectedMembership = useMemo(() => {
    return memberships.find(m => m.id === membershipId) || memberships[0];
  }, [memberships, membershipId]);

  const handleMembershipChange = (newMemId: string) => {
    setMembershipId(newMemId);
    const m = memberships.find(mem => mem.id === newMemId);
    if (m) {
      if (m.slug === 'platinum') setCardPreset('platinum_elite');
      else if (m.slug === 'gold') setCardPreset('royal_gold');
      else if (m.slug === 'silver') setCardPreset('emerald_health');
      else setCardPreset('executive_navy');
    }
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val) {
      setAge(calculateAge(val));
    }
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = parseInt(e.target.value, 10) || 0;
    setAge(a);
    if (a > 0) {
      const year = new Date().getFullYear() - a;
      setDob(`${year}-01-01`);
    }
  };

  // Add Family Member
  const addFamilyMemberRow = () => {
    const newId = `fam_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setFamilyMembers(prev => [
      ...prev,
      {
        id: newId,
        fullName: '',
        relationship: 'Spouse',
        dob: '1995-01-01',
        age: 28,
        gender: 'female',
        bloodGroup: 'O+',
        mobile: '',
        photoUrl: '',
        allergies: 'None',
        chronicConditions: 'None',
        issueCard: true // Default checked to issue individual Health Card!
      }
    ]);
  };

  const updateFamilyMember = (id: string, field: keyof FamilyMemberFormState, value: any) => {
    setFamilyMembers(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
  };

  // Mock Card Object for Live Preview
  const livePreviewCard: HealthCard = useMemo(() => {
    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + (selectedMembership?.validityMonths || 12));

    return {
      id: 'preview_card',
      cardNumber: previewNextCardNumber,
      patientId: previewNextPatientId,
      membershipId: selectedMembership?.id || 'mem_gold',
      issueDate: now.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      status: 'active',
      cvv: '849',
      verificationCode: 'VER-8942-1049',
      designConfig: {
        ...DEFAULT_CARD_DESIGN,
        preset: cardPreset,
        material: cardMaterial,
        showFamilyBadge: enableFamilyShield || familyMembers.length > 0
      },
      statusHistory: [],
      renewedCount: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
  }, [previewNextCardNumber, previewNextPatientId, selectedMembership, cardPreset, cardMaterial, enableFamilyShield, familyMembers.length]);

  const livePreviewPatient: Patient = useMemo(() => {
    return {
      id: previewNextPatientId,
      fullName: fullName || 'Patient Name',
      dob: dob || '1992-05-15',
      age: age || 34,
      gender,
      mobile: mobile || '9830012345',
      whatsapp: whatsapp || mobile,
      bloodGroup: bloodGroup || 'B+',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      address: {
        villageArea,
        postOffice,
        policeStation,
        district,
        state: stateVal,
        pinCode,
        fullAddress: fullAddress || `${villageArea}, ${district}, ${stateVal} - ${pinCode}`
      },
      emergencyContact: {
        name: emergencyName || 'Primary Contact',
        relationship: emergencyRelation,
        mobile: emergencyMobile || mobile
      },
      medicalInfo: {
        allergies,
        chronicConditions,
        importantNotes,
        bloodGroup
      },
      portalPassword,
      walletId: 'wal_preview',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Front Desk'
    };
  }, [
    previewNextPatientId, fullName, dob, age, gender, mobile, whatsapp, bloodGroup, photoUrl,
    villageArea, postOffice, policeStation, district, stateVal, pinCode, fullAddress,
    emergencyName, emergencyRelation, emergencyMobile, allergies, chronicConditions, importantNotes
  ]);

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobile.trim()) {
      showToast('error', 'Required Fields Missing', 'Please enter primary patient full name and mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build Referral Details
      let refPayload: any = { source: referralSource };
      if (referralSource === 'doctor') {
        const doc = doctors.find((d: DoctorMasterItem) => d.id === selectedDoctorId);
        refPayload.name = doc ? `Dr. ${doc.name} (${doc.speciality})` : customDoctorName;
        refPayload.doctorId = selectedDoctorId;
        refPayload.details = doctorClinic || (doc ? `${doc.department} - Reg: ${doc.regNumber}` : '');
      } else if (referralSource === 'existing_cardholder') {
        refPayload.name = referralPersonName;
        refPayload.cardNo = referralCardNumber;
        refPayload.contact = referralContact;
      } else if (referralSource === 'camp') {
        refPayload.name = referralCampName;
        refPayload.details = 'Community Outreach Health Camp';
      } else if (referralSource === 'agent') {
        refPayload.name = referralPersonName || `Agent ID: ${referralAgentId}`;
        refPayload.details = referralAgentId;
      } else if (referralSource === 'other' || referralSource === 'staff') {
        refPayload.name = referralPersonName;
        refPayload.contact = referralContact;
        refPayload.notes = referralNotes;
      }

      // Build Clinical Vitals
      const vitalsPayload = {
        bp: bpSystolic && bpDiastolic ? `${bpSystolic}/${bpDiastolic} mmHg` : undefined,
        pulse: parseInt(pulse, 10) || undefined,
        rbs: rbs ? `${rbs} mg/dL` : undefined,
        spo2: parseInt(spo2, 10) || undefined,
        weight: parseFloat(weightKg) || undefined,
        height: parseFloat(heightCm) || undefined,
        bmi: bmiData?.val
      };

      // Filter family members with valid names
      const validFamilyMembers = (enableFamilyShield || familyMembers.length > 0)
        ? familyMembers.filter(m => m.fullName.trim().length > 0)
        : [];

      const result = PatientService.createPatient({
        fullName: fullName.trim(),
        dob: dob || '1990-01-01',
        age: age || 35,
        gender,
        mobile: mobile.trim(),
        whatsapp: whatsapp.trim() || mobile.trim(),
        email: email.trim(),
        bloodGroup,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        address: {
          villageArea,
          postOffice,
          policeStation,
          district,
          state: stateVal,
          pinCode,
          fullAddress: fullAddress || `${villageArea}, ${postOffice}, ${district}, ${stateVal} - ${pinCode}`
        },
        emergencyContact: {
          name: emergencyName.trim() || 'Family Member',
          relationship: emergencyRelation,
          mobile: emergencyMobile.trim() || mobile.trim()
        },
        medicalInfo: {
          allergies,
          chronicConditions,
          importantNotes,
          emergencyNotes: '',
          bloodGroup
        },
        maritalStatus,
        occupation,
        governmentIdType,
        governmentIdNumber,
        referral: referralSource !== 'none' ? refPayload : undefined,
        vitalsAtReg: vitalsPayload,
        membershipId,
        initialDeposit: parseFloat(initialDeposit) || 0,
        cardDesignPreset: cardPreset,
        cardMaterial,
        familyName: familyName.trim() || `${fullName.trim()}'s Family Health Shield`,
        familyMembers: validFamilyMembers
      });

      triggerCelebrationFireworks();
      setCreatedResult(result);
      showToast(
        'success',
        'Registration & Issuance Successful!',
        `Patient ${result.patient.fullName} (${result.patient.id}) registered with Health Card ${result.card.cardNumber}. ${result.issuedFamilyCards.length > 0 ? `+${result.issuedFamilyCards.length} Family Members enrolled.` : ''}`
      );
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Status Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Directory
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Next Auto Patient ID</span>
            <div className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">
              {previewNextPatientId}
            </div>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">CR80 Health Card Serial</span>
            <div className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
              {previewNextCardNumber}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Live Interactive Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Comprehensive Registration Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
          
          {/* Main Title Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <CreditCard className="w-64 h-64 text-white" />
            </div>
            <div className="relative z-10 space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5" /> High-Security Auto Issuance Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                New Patient Registration & Smart Health Card
              </h1>
              <p className="text-xs text-blue-200/80 leading-relaxed">
                Enroll primary patient, attach multiple family dependents, configure referral channels, and instantly auto-issue encrypted CR80 Health Cards with QR & NFC verification.
              </p>
            </div>
          </div>

          {/* SECTION 1: Personal Details & Photo */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">1</span>
                <span>Personal Identity & Photo Capture</span>
              </h3>
              <Badge variant="blue">Primary Member</Badge>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="shrink-0 flex flex-col items-center gap-2">
                <PhotoUploaderWebcam photoUrl={photoUrl} onPhotoChange={setPhotoUrl} />
                <span className="text-[10px] text-slate-400 text-center font-medium">Card Photo / Live Webcam</span>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <Input
                  label="Full Patient Name *"
                  placeholder="e.g. Rajesh Mukherjee"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Date of Birth *"
                    type="date"
                    value={dob}
                    onChange={handleDobChange}
                    required
                  />
                  <Input
                    label="Age (Yrs) *"
                    type="number"
                    value={age || ''}
                    onChange={handleAgeChange}
                    required
                  />
                </div>

                <Select
                  label="Gender *"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' }
                  ]}
                />

                <Select
                  label="Blood Group *"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  options={[
                    { value: 'A+', label: 'A+ (Positive)' },
                    { value: 'A-', label: 'A- (Negative)' },
                    { value: 'B+', label: 'B+ (Positive)' },
                    { value: 'B-', label: 'B- (Negative)' },
                    { value: 'O+', label: 'O+ (Positive)' },
                    { value: 'O-', label: 'O- (Negative)' },
                    { value: 'AB+', label: 'AB+ (Positive)' },
                    { value: 'AB-', label: 'AB- (Negative)' }
                  ]}
                />

                <Input
                  label="Primary Mobile (10-Digits) *"
                  placeholder="e.g. 9830012345"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />

                <Input
                  label="WhatsApp Number"
                  placeholder="e.g. 9830012345"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  helperText="Used for digital health card delivery"
                />

                <Input
                  label="Email Address (Optional)"
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Select
                  label="Marital Status"
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  options={[
                    { value: 'Married', label: 'Married' },
                    { value: 'Single', label: 'Single / Unmarried' },
                    { value: 'Widowed', label: 'Widowed' },
                    { value: 'Divorced', label: 'Divorced' }
                  ]}
                />

                <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                  <Select
                    label="Govt ID Document"
                    value={governmentIdType}
                    onChange={(e) => setGovernmentIdType(e.target.value)}
                    options={[
                      { value: 'Aadhaar Card', label: 'Aadhaar Card' },
                      { value: 'Voter ID', label: 'Voter ID (EPIC)' },
                      { value: 'PAN Card', label: 'PAN Card' },
                      { value: 'ABHA Health ID', label: 'ABHA (NDHM) ID' },
                      { value: 'Passport', label: 'Passport' },
                      { value: 'Ration Card', label: 'Digital Ration Card' }
                    ]}
                  />
                  <Input
                    label="Government ID / ABHA Number"
                    placeholder="e.g. 4589 1234 5678"
                    value={governmentIdNumber}
                    onChange={(e) => setGovernmentIdNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Address & Emergency Contact */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center justify-center">2</span>
                <span>Address & Emergency Guardianship</span>
              </h3>
              
              <button
                type="button"
                id="admin-auto-popup-address-btn"
                onClick={() => setIsAddressPopupOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:scale-105 transition-all"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>📍 Auto Popup Address / PIN Lookup</span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Village / Area / Street *" value={villageArea} onChange={(e) => setVillageArea(e.target.value)} required />
              <Input label="Post Office *" value={postOffice} onChange={(e) => setPostOffice(e.target.value)} required />
              <Input label="Police Station *" value={policeStation} onChange={(e) => setPoliceStation(e.target.value)} required />
              <Input label="District *" value={district} onChange={(e) => setDistrict(e.target.value)} required />
              <Input label="State *" value={stateVal} onChange={(e) => setStateVal(e.target.value)} required />
              <div>
                <Input
                  label="PIN Code (Auto-Resolves) *"
                  placeholder="e.g. 700001"
                  value={pinCode}
                  onChange={(e) => handlePinCodeChange(e.target.value)}
                  required
                />
                <span className="text-[10.5px] text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">
                  💡 Type 6-digit PIN for instant auto-fill
                </span>
              </div>

              <div className="sm:col-span-3">
                <Input
                  label="Complete Residential Address"
                  placeholder="House No, Landmark, Sector, Building..."
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-500 block mb-3 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-rose-500" /> Emergency Contact
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Contact Person Name" placeholder="e.g. Anjali Mukherjee" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
                <Input label="Relationship" placeholder="e.g. Spouse / Father / Mother" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} />
                <Input label="Emergency Phone Number" placeholder="e.g. 9830099999" value={emergencyMobile} onChange={(e) => setEmergencyMobile(e.target.value)} />
              </div>
            </div>
          </div>

          {/* SECTION 3: Clinical Triage & Physical Measurements */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-black flex items-center justify-center">3</span>
                <span>Clinical Triage & Physical Measurements</span>
              </h3>
              <Badge variant="purple">Card Back Medical Profile</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Blood Pressure</label>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    placeholder="120"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-full text-xs font-bold p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-slate-400">/</span>
                  <input
                    type="number"
                    placeholder="80"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="w-full text-xs font-bold p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Pulse (BPM)</label>
                <input
                  type="number"
                  placeholder="72"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full text-xs font-bold p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Random Blood Sugar</label>
                <input
                  type="number"
                  placeholder="mg/dL"
                  value={rbs}
                  onChange={(e) => setRbs(e.target.value)}
                  className="w-full text-xs font-bold p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Oxygen (SpO2 %)</label>
                <input
                  type="number"
                  placeholder="98"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full text-xs font-bold p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="65"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full text-xs font-bold p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Height (cm)</label>
                <input
                  type="number"
                  placeholder="170"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full text-xs font-bold p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 mt-1"
                />
              </div>

              <div className="col-span-2 flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500">Auto Computed BMI</span>
                {bmiData ? (
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${bmiData.color}`}>
                    {bmiData.val} kg/m² • {bmiData.category}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Enter Wt & Ht</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Known Drug Allergies" placeholder="e.g. Penicillin, Sulfa, None" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
              <Input label="Chronic Medical Conditions" placeholder="e.g. Hypertension, Type-2 Diabetes, Asthma" value={chronicConditions} onChange={(e) => setChronicConditions(e.target.value)} />
              <div className="sm:col-span-2">
                <Input label="Special Physician / Clinical Follow-up Notes" placeholder="Special patient instructions or priority clinical notes..." value={importantNotes} onChange={(e) => setImportantNotes(e.target.value)} />
              </div>
            </div>
          </div>

          {/* SECTION 4: "Others Recommend" / Referral Details (USER EXPLICIT REQUEST) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 text-xs font-black flex items-center justify-center">4</span>
                <span>Referral Channel & "Others Recommend"</span>
              </h3>
              <Badge variant="warning">Referral Tracking</Badge>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Referred By / Channel Source"
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value as any)}
                  options={[
                    { value: 'none', label: 'Direct Walk-in (Self Registered)' },
                    { value: 'doctor', label: 'Doctor Recommendation / Specialist' },
                    { value: 'existing_cardholder', label: 'Existing Cardholder / Family Referral' },
                    { value: 'staff', label: 'Hospital Staff / Reception Desk' },
                    { value: 'camp', label: 'Free Health Camp / Village Outreach' },
                    { value: 'agent', label: 'Health Advisor / Field Agent' },
                    { value: 'other', label: 'Other Recommend / Corporate / NGO' }
                  ]}
                />

                {referralSource === 'doctor' && (
                  <Select
                    label="Select Registered Doctor"
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    options={[
                      { value: '', label: '-- Choose Doctor or Type Below --' },
                      ...doctors.map((d: DoctorMasterItem) => ({
                        value: d.id,
                        label: `Dr. ${d.name} (${d.speciality} • ${d.department})`
                      }))
                    ]}
                  />
                )}

                {referralSource === 'existing_cardholder' && (
                  <Input
                    label="Referrer Health Card / Patient ID"
                    placeholder="e.g. LHC-2026-000001 or LMDX-2026-000001"
                    value={referralCardNumber}
                    onChange={(e) => setReferralCardNumber(e.target.value)}
                    helperText="Enters referrer patient ID for referral rewards"
                  />
                )}

                {referralSource === 'camp' && (
                  <Input
                    label="Health Camp Name & Code"
                    placeholder="e.g. Sonarpur Free Mega Camp (Code: CAMP-2026-04)"
                    value={referralCampName}
                    onChange={(e) => setReferralCampName(e.target.value)}
                  />
                )}

                {referralSource === 'agent' && (
                  <Input
                    label="Field Agent Code / ID"
                    placeholder="e.g. AGENT-KOL-88"
                    value={referralAgentId}
                    onChange={(e) => setReferralAgentId(e.target.value)}
                  />
                )}
              </div>

              {/* Dynamic secondary fields */}
              {referralSource !== 'none' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 bg-amber-50/40 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-900/50">
                  <Input
                    label="Recommender / Person Name"
                    placeholder={referralSource === 'doctor' ? 'Doctor Name (if not in list)' : 'Name of person who recommended'}
                    value={referralSource === 'doctor' && !selectedDoctorId ? customDoctorName : referralPersonName}
                    onChange={(e) => {
                      if (referralSource === 'doctor' && !selectedDoctorId) setCustomDoctorName(e.target.value);
                      else setReferralPersonName(e.target.value);
                    }}
                  />
                  <Input
                    label="Recommender Contact Phone"
                    placeholder="e.g. 9830088888"
                    value={referralContact}
                    onChange={(e) => setReferralContact(e.target.value)}
                  />
                  <Input
                    label="Clinic / Remarks / Notes"
                    placeholder="e.g. Care Polyclinic / Community club"
                    value={referralSource === 'doctor' ? doctorClinic : referralNotes}
                    onChange={(e) => {
                      if (referralSource === 'doctor') setDoctorClinic(e.target.value);
                      else setReferralNotes(e.target.value);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: Multi-Family Shield & Dependent Card Issuance (USER EXPLICIT REQUEST) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center">5</span>
                  <span>Family Health Shield & Dependent Card Issuance</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Add multiple family members under a single card account. Check the box to auto-issue cards!
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEnableFamilyShield(!enableFamilyShield);
                  if (!enableFamilyShield && familyMembers.length === 0) {
                    addFamilyMemberRow();
                  }
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  enableFamilyShield
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                {enableFamilyShield ? 'Family Shield Active' : '+ Enable Family Shield'}
              </button>
            </div>

            {enableFamilyShield && (
              <div className="space-y-6">
                {/* Family Group Name */}
                <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-200/60 dark:border-indigo-900/60">
                  <Input
                    label="Family Shield / Group Account Name"
                    placeholder={`e.g. ${fullName ? `${fullName}'s Family Health Shield` : 'Mukherjee Family Health Shield'}`}
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    helperText="Primary member will be designated as Head of Family. All issued cards share family tier discounts."
                  />
                </div>

                {/* Family Members Dynamic List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Family Members List ({familyMembers.length})
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addFamilyMemberRow}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Another Member
                    </Button>
                  </div>

                  {familyMembers.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">No family dependents added yet.</p>
                      <button
                        type="button"
                        onClick={addFamilyMemberRow}
                        className="text-xs font-bold text-blue-600 hover:underline mt-1"
                      >
                        + Click here to add spouse, children or parents
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {familyMembers.map((member, idx) => (
                        <div
                          key={member.id}
                          className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" /> Member #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFamilyMember(member.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input
                              label="Member Full Name *"
                              placeholder="e.g. Suman Mukherjee"
                              value={member.fullName}
                              onChange={(e) => updateFamilyMember(member.id, 'fullName', e.target.value)}
                              required
                            />

                            <Select
                              label="Relationship to Head *"
                              value={member.relationship}
                              onChange={(e) => updateFamilyMember(member.id, 'relationship', e.target.value)}
                              options={[
                                { value: 'Spouse', label: 'Spouse / Wife / Husband' },
                                { value: 'Son', label: 'Son' },
                                { value: 'Daughter', label: 'Daughter' },
                                { value: 'Father', label: 'Father' },
                                { value: 'Mother', label: 'Mother' },
                                { value: 'Brother', label: 'Brother' },
                                { value: 'Sister', label: 'Sister' },
                                { value: 'Grandfather', label: 'Grandfather' },
                                { value: 'Grandmother', label: 'Grandmother' },
                                { value: 'Father-in-law', label: 'Father-in-law' },
                                { value: 'Mother-in-law', label: 'Mother-in-law' },
                                { value: 'Dependent', label: 'Dependent' },
                                { value: 'Other', label: 'Other' }
                              ]}
                            />

                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                label="Age"
                                type="number"
                                value={member.age || ''}
                                onChange={(e) => updateFamilyMember(member.id, 'age', parseInt(e.target.value, 10) || 0)}
                              />
                              <Select
                                label="Gender"
                                value={member.gender}
                                onChange={(e) => updateFamilyMember(member.id, 'gender', e.target.value as any)}
                                options={[
                                  { value: 'female', label: 'Female' },
                                  { value: 'male', label: 'Male' },
                                  { value: 'other', label: 'Other' }
                                ]}
                              />
                            </div>

                            <Select
                              label="Blood Group"
                              value={member.bloodGroup}
                              onChange={(e) => updateFamilyMember(member.id, 'bloodGroup', e.target.value)}
                              options={[
                                { value: 'A+', label: 'A+' },
                                { value: 'A-', label: 'A-' },
                                { value: 'B+', label: 'B+' },
                                { value: 'B-', label: 'B-' },
                                { value: 'O+', label: 'O+' },
                                { value: 'O-', label: 'O-' },
                                { value: 'AB+', label: 'AB+' },
                                { value: 'AB-', label: 'AB-' }
                              ]}
                            />

                            <Input
                              label="Mobile Number"
                              placeholder="Optional or same as head"
                              value={member.mobile || ''}
                              onChange={(e) => updateFamilyMember(member.id, 'mobile', e.target.value)}
                            />

                            <Input
                              label="Allergies / Conditions"
                              placeholder="e.g. Penicillin / None"
                              value={member.allergies || ''}
                              onChange={(e) => updateFamilyMember(member.id, 'allergies', e.target.value)}
                            />
                          </div>

                          {/* KEY CHECKBOX: Card Issuance for this member (USER REQUIREMENT) */}
                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={member.issueCard}
                                onChange={(e) => updateFamilyMember(member.id, 'issueCard', e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                              />
                              <div>
                                <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                  Issue Individual CR80 Health Card for {member.fullName || 'this member'}
                                </span>
                                <span className="text-[10px] text-slate-500 block">
                                  Generates a dedicated card number, QR code & smart verification credentials under this family account.
                                </span>
                              </div>
                            </label>

                            <Badge variant={member.issueCard ? 'success' : 'neutral'}>
                              {member.issueCard ? 'Card Will Be Issued' : 'Dependent Only (No Card)'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 6: Health Card Membership Plan & Customization */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">6</span>
                <span>Health Card Tier, Styling & Wallet Deposit</span>
              </h3>
              <Badge variant="success">Live Config</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Select Membership Plan *"
                value={membershipId}
                onChange={(e) => handleMembershipChange(e.target.value)}
                options={memberships.map((m) => ({
                  value: m.id,
                  label: `${m.name} (Reg Fee: ₹${m.registrationFee} • OPD ${m.opdDiscount}% | Lab ${m.labDiscount}%)`
                }))}
              />

              <Input
                label="Initial Health Wallet Balance (₹)"
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                helperText="Instant prepaid balance credited to patient wallet"
              />

              <Select
                label="Card Visual Theme Preset"
                value={cardPreset}
                onChange={(e) => setCardPreset(e.target.value as any)}
                options={[
                  { value: 'royal_gold', label: '👑 Royal Gold Prestige' },
                  { value: 'platinum_elite', label: '💎 Platinum Elite Obsidian' },
                  { value: 'executive_navy', label: '🛡️ Executive Navy Classic' },
                  { value: 'emerald_health', label: '🌿 Emerald Health Nature' },
                  { value: 'crimson_care', label: '❤️ Crimson Care Medical' },
                  { value: 'clean_minimal', label: '⚡ Clean Minimal Modern' }
                ]}
              />

              <Select
                label="Card Physical Surface Material"
                value={cardMaterial}
                onChange={(e) => setCardMaterial(e.target.value as any)}
                options={[
                  { value: 'gloss', label: 'Ultra High Gloss PVC' },
                  { value: 'matte', label: 'Satin Matte Premium Finish' },
                  { value: 'metallic', label: 'Brushed Metallic Luster' },
                  { value: 'hologram', label: '3D Holographic Security Film' }
                ]}
              />
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/patients')}>
              Cancel & Return
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<UserPlus className="w-5 h-5" />}
              className="w-full sm:w-auto px-8 shadow-xl shadow-blue-600/30"
            >
              Complete Registration & Issue Cards
            </Button>
          </div>
        </form>

        {/* Right Column: Sticky Live CR80 Real-Time Card Preview */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" /> Real-time CR80 Preview
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Live Rendering
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              This is how the patient's physical CR80 smart health card will be printed.
            </p>

            {/* Live Front Card View */}
            <div className="flex justify-center py-2 overflow-hidden">
              <div className="transform scale-[0.85] origin-top sm:scale-100">
                <CR80CardFront
                  patient={livePreviewPatient}
                  card={livePreviewCard}
                  membership={selectedMembership}
                  company={company}
                  scale={1}
                />
              </div>
            </div>

            {/* Live Card Specs Summary */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400">Cardholder:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{fullName || 'Rajesh Mukherjee'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400">Membership Tier:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedMembership?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400">OPD & Lab Discount:</span>
                <span className="font-bold text-emerald-600">OPD {selectedMembership?.opdDiscount}% | Lab {selectedMembership?.labDiscount}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400">Family Members:</span>
                <span className="font-bold text-indigo-600">
                  {familyMembers.length > 0 ? `${familyMembers.length} Dependents (${familyMembers.filter(m => m.issueCard).length} Cards)` : 'Single Account'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Referral Channel:</span>
                <span className="font-bold text-amber-600 capitalize">{referralSource.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POST-REGISTRATION MULTI-CARD SUCCESS MODAL */}
      {createdResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                Cards Successfully Provisioned
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Registration & Issuance Complete!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Primary cardholder registered and individual health cards have been issued.
              </p>
            </div>

            {/* Issued Cards Breakdown */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Issued Health Cards Summary</span>
                <Badge variant="blue">
                  {1 + createdResult.issuedFamilyCards.filter(c => c.card).length} Total Cards
                </Badge>
              </div>

              {/* Primary Card */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center font-black text-xs">
                    HEAD
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      {createdResult.patient.fullName} (Primary)
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500">
                      ID: {createdResult.patient.id} • Card: {createdResult.card.cardNumber}
                    </span>
                  </div>
                </div>
                <Badge variant="success">Active Card</Badge>
              </div>

              {/* Family Members Cards */}
              {createdResult.issuedFamilyCards.map((item, i) => (
                <div
                  key={item.patient.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {item.patient.fullName} ({item.relationship})
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        ID: {item.patient.id} {item.card ? `• Card: ${item.card.cardNumber}` : '• (Dependent on Family Plan)'}
                      </span>
                    </div>
                  </div>
                  <Badge variant={item.card ? 'success' : 'neutral'}>
                    {item.card ? 'Issued Card' : 'Covered Dependent'}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => navigate('/cards/print-sheet')}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Cards on A4 Sheet
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/patients/${createdResult.patient.id}`)}
                leftIcon={<ChevronRight className="w-4 h-4" />}
              >
                Go to Patient Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Address Auto Popup Modal */}
      {isAddressPopupOpen && (
        <AddressAutoPopupModal
          isOpen={isAddressPopupOpen}
          onClose={() => setIsAddressPopupOpen(false)}
          initialQuery={pinCode || villageArea}
          onSelectAddress={(addr) => {
            setVillageArea(addr.cityArea);
            setPostOffice(addr.postOffice);
            setPoliceStation(addr.policeStation);
            setDistrict(addr.district);
            setStateVal(addr.state);
            setPinCode(addr.pinCode);
            showToast('success', 'Address Auto-Filled', `${addr.cityArea}, PIN ${addr.pinCode}`);
          }}
        />
      )}
    </div>
  );
};
