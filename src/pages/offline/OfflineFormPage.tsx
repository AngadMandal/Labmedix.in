import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OfflineFormService, OfflinePatientData, OfflineSubmission } from '../../services/offlineFormService';
import { StorageService } from '../../services/storage';
import { AddressLookupService } from '../../services/addressLookupService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { PhotoUploaderWebcam } from '../../components/common/PhotoUploaderWebcam';
import { SignaturePad } from '../../components/common/SignaturePad';
import { PrintableBlankPhysicalForm } from '../../components/offline/PrintableBlankPhysicalForm';
import { CreateFamilyMemberInput } from '../../services/patientService';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { formatCurrency } from '../../utils/formatters';
import {
  Wifi,
  WifiOff,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  FileSpreadsheet,
  Download,
  Users,
  CreditCard,
  Heart,
  Activity,
  MapPin,
  Phone,
  Shield,
  Stethoscope,
  PenTool,
  UploadCloud,
  RefreshCw,
  Search,
  Check,
  X,
  FileText,
  Building,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Edit3
} from 'lucide-react';

export const OfflineFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Active Tab: 'form' | 'queue' | 'print'
  const [activeTab, setActiveTab] = useState<'form' | 'queue' | 'print'>('form');

  // Network Status
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Submissions State
  const [submissions, setSubmissions] = useState<OfflineSubmission[]>([]);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [queueFilter, setQueueFilter] = useState<'all' | 'pending' | 'synced' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Submission for Detail/Edit Modal
  const [selectedSubmission, setSelectedSubmission] = useState<OfflineSubmission | null>(null);

  // Success Modal after offline registration
  const [justSavedToken, setJustSavedToken] = useState<string | null>(null);
  const [justSavedData, setJustSavedData] = useState<OfflinePatientData | null>(null);

  // Load Submissions
  const reloadSubmissions = () => {
    setSubmissions(OfflineFormService.getAllSubmissions());
  };

  useEffect(() => {
    reloadSubmissions();

    const handleOnline = () => {
      setIsOnline(true);
      showToast('success', 'Back Online', 'Internet connection restored. You can now sync pending offline forms to the cloud.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('warning', 'Offline Mode Activated', 'Working in offline mode. All patient registrations will be safely queued locally.');
    };

    const handleQueueChange = () => reloadSubmissions();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('labmedix_offline_queue_changed', handleQueueChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('labmedix_offline_queue_changed', handleQueueChange);
    };
  }, [showToast]);

  // Available Memberships
  const memberships = StorageService.getMemberships().filter(m => m.status === 'active');
  const camps = StorageService.getHealthCamps();

  // ----------------------------------------------------
  // Form State
  // ----------------------------------------------------
  const [fullName, setFullName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [relationshipWithGuardian, setRelationshipWithGuardian] = useState('Father');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [maritalStatus, setMaritalStatus] = useState('Married');
  const [occupation, setOccupation] = useState('Self-Employed / Business');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [governmentIdType, setGovernmentIdType] = useState('Aadhaar Card');
  const [governmentIdNumber, setGovernmentIdNumber] = useState('');

  // Address
  const [villageArea, setVillageArea] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [district, setDistrict] = useState('Kolkata');
  const [stateVal, setStateVal] = useState('West Bengal');
  const [pinCode, setPinCode] = useState('700001');
  const [fullAddress, setFullAddress] = useState('');

  // Medical History
  const [isDiabetic, setIsDiabetic] = useState(false);
  const [isHypertensive, setIsHypertensive] = useState(false);
  const [hasHeartDisease, setHasHeartDisease] = useState(false);
  const [hasAsthma, setHasAsthma] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');

  // Baseline Vitals
  const [bpSystolic, setBpSystolic] = useState<string>('120');
  const [bpDiastolic, setBpDiastolic] = useState<string>('80');
  const [pulseRate, setPulseRate] = useState<string>('72');
  const [bloodSugar, setBloodSugar] = useState<string>('');
  const [sugarType, setSugarType] = useState<'fasting' | 'post_prandial' | 'random'>('random');
  const [spo2, setSpo2] = useState<string>('99');
  const [temperature, setTemperature] = useState<string>('98.4');
  const [weightKg, setWeightKg] = useState<string>('65');
  const [heightCm, setHeightCm] = useState<string>('165');

  // Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('Spouse');
  const [emergencyContactMobile, setEmergencyContactMobile] = useState('');

  // Membership & Payment
  const [membershipId, setMembershipId] = useState(memberships[0]?.id || 'mem_gold');
  const [initialDeposit, setInitialDeposit] = useState<number>(0);
  const [campName, setCampName] = useState('');
  const [campLocation, setCampLocation] = useState('');
  const [volunteerName, setVolunteerName] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'ngo_free_grant' | 'card'>('cash');
  const [feeCollected, setFeeCollected] = useState<number>(500);
  const [generalNotes, setGeneralNotes] = useState('');

  // Media
  const [photoBase64, setPhotoBase64] = useState('');
  const [signatureBase64, setSignatureBase64] = useState('');

  // Family Members
  const [familyMembers, setFamilyMembers] = useState<Array<CreateFamilyMemberInput & { id: string }>>([]);

  // Calculate BMI
  const calculatedBmi = useMemo(() => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm) / 100;
    if (w > 0 && h > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return '';
  }, [weightKg, heightCm]);

  // Auto-Resolve PIN Code offline
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
        showToast('info', 'Offline Address Resolved', `Matched ${best.cityArea}, ${best.district}`);
      }
    }
  };

  // Auto-Save Draft to LocalStorage every few seconds
  useEffect(() => {
    if (!fullName && !mobile) return;
    const timeout = setTimeout(() => {
      OfflineFormService.saveDraft({
        fullName,
        guardianName,
        dob,
        age,
        gender,
        maritalStatus,
        occupation,
        bloodGroup,
        mobile,
        whatsapp,
        email,
        governmentIdType,
        governmentIdNumber,
        villageArea,
        postOffice,
        policeStation,
        district,
        state: stateVal,
        pinCode,
        fullAddress,
        isDiabetic,
        isHypertensive,
        hasHeartDisease,
        hasAsthma,
        allergies,
        chronicConditions,
        currentMedications,
        emergencyContactName,
        emergencyContactRelationship,
        emergencyContactMobile,
        membershipId,
        campName,
        paymentMode,
        feeCollected,
        generalNotes
      });
    }, 1500);

    return () => clearTimeout(timeout);
  }, [
    fullName, guardianName, dob, age, gender, maritalStatus, occupation, bloodGroup, mobile, whatsapp, email,
    governmentIdType, governmentIdNumber, villageArea, postOffice, policeStation, district, stateVal, pinCode, fullAddress,
    isDiabetic, isHypertensive, hasHeartDisease, hasAsthma, allergies, chronicConditions, currentMedications,
    emergencyContactName, emergencyContactRelationship, emergencyContactMobile, membershipId, campName, paymentMode, feeCollected, generalNotes
  ]);

  // Check for saved draft on mount
  useEffect(() => {
    const draft = OfflineFormService.getDraft();
    if (draft && draft.data && draft.data.fullName) {
      // Prompt user or silently restore
      const d = draft.data;
      if (d.fullName) setFullName(d.fullName);
      if (d.guardianName) setGuardianName(d.guardianName);
      if (d.mobile) setMobile(d.mobile);
      if (d.age) setAge(d.age);
      if (d.gender) setGender(d.gender);
      if (d.bloodGroup) setBloodGroup(d.bloodGroup);
      if (d.pinCode) setPinCode(d.pinCode);
      if (d.district) setDistrict(d.district);
      if (d.campName) setCampName(d.campName);
    }
  }, []);

  // Add Family Member
  const addFamilyMember = () => {
    setFamilyMembers(prev => [
      ...prev,
      {
        id: `fam_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        fullName: '',
        relationship: 'Spouse',
        age: 28,
        gender: 'female',
        bloodGroup: 'B+',
        issueCard: true
      }
    ]);
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(f => f.id !== id));
  };

  const updateFamilyMember = (id: string, updates: Partial<CreateFamilyMemberInput>) => {
    setFamilyMembers(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  // Reset Form
  const resetForm = () => {
    setFullName('');
    setGuardianName('');
    setDob('');
    setAge(30);
    setGender('male');
    setMobile('');
    setWhatsapp('');
    setEmail('');
    setGovernmentIdNumber('');
    setVillageArea('');
    setFullAddress('');
    setIsDiabetic(false);
    setIsHypertensive(false);
    setHasHeartDisease(false);
    setHasAsthma(false);
    setAllergies('');
    setChronicConditions('');
    setCurrentMedications('');
    setBloodSugar('');
    setEmergencyContactName('');
    setEmergencyContactMobile('');
    setPhotoBase64('');
    setSignatureBase64('');
    setFamilyMembers([]);
    setGeneralNotes('');
    OfflineFormService.clearDraft();
  };

  // Handle Form Submission (Works 100% Offline)
  const handleSubmitOfflineForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('error', 'Validation Error', 'Please enter Patient Full Name.');
      return;
    }
    if (!mobile.trim()) {
      showToast('error', 'Validation Error', 'Please enter Patient Primary Mobile Number.');
      return;
    }

    const patientData: OfflinePatientData = {
      fullName: fullName.trim(),
      guardianName: guardianName.trim() || undefined,
      relationshipWithGuardian,
      dob: dob || `${new Date().getFullYear() - age}-01-01`,
      age: Number(age) || 30,
      gender,
      maritalStatus,
      occupation,
      bloodGroup,
      mobile: mobile.trim(),
      whatsapp: whatsapp.trim() || mobile.trim(),
      email: email.trim() || undefined,
      governmentIdType,
      governmentIdNumber: governmentIdNumber.trim(),
      villageArea,
      postOffice,
      policeStation,
      district,
      state: stateVal,
      pinCode,
      fullAddress,
      isDiabetic,
      isHypertensive,
      hasHeartDisease,
      hasAsthma,
      allergies,
      chronicConditions,
      currentMedications,
      vitals: {
        bpSystolic: bpSystolic ? parseInt(bpSystolic) : undefined,
        bpDiastolic: bpDiastolic ? parseInt(bpDiastolic) : undefined,
        pulseRate: pulseRate ? parseInt(pulseRate) : undefined,
        bloodSugar: bloodSugar ? parseInt(bloodSugar) : undefined,
        sugarType,
        spo2: spo2 ? parseInt(spo2) : undefined,
        temperature: temperature ? parseFloat(temperature) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
        bmi: calculatedBmi || undefined
      },
      emergencyContactName: emergencyContactName.trim() || guardianName.trim() || 'Family Member',
      emergencyContactRelationship,
      emergencyContactMobile: emergencyContactMobile.trim() || mobile.trim(),
      membershipId,
      initialDeposit,
      familyName: familyMembers.length > 0 ? `${fullName.trim()} Family` : undefined,
      familyMembers: familyMembers.length > 0 ? familyMembers.map(({ id, ...rest }) => rest) : undefined,
      campName: campName.trim() || undefined,
      campLocation: campLocation.trim() || undefined,
      volunteerOrAgentName: volunteerName.trim() || undefined,
      paymentMode,
      feeCollected: Number(feeCollected) || 0,
      generalNotes: generalNotes.trim() || undefined,
      photoBase64,
      signatureBase64
    };

    const saved = OfflineFormService.saveOfflineSubmission(patientData);
    setJustSavedToken(saved.offlineToken);
    setJustSavedData(saved.data);
    reloadSubmissions();
    triggerCelebrationFireworks();
    showToast('success', 'Form Queued Locally', `Offline Token: ${saved.offlineToken}. Stored securely on this device.`);
  };

  // Sync All Pending Submissions
  const handleSyncAll = async () => {
    const pending = OfflineFormService.getPendingSubmissions();
    if (pending.length === 0) {
      showToast('info', 'Queue Clean', 'No pending offline submissions to sync.');
      return;
    }

    setIsSyncingAll(true);
    showToast('info', 'Syncing Records', `Processing ${pending.length} offline registrations to live system...`);

    try {
      const res = await OfflineFormService.syncAllPending();
      reloadSubmissions();
      if (res.failed === 0) {
        triggerCelebrationFireworks();
        showToast('success', 'Sync Completed', `Successfully uploaded ${res.succeeded} patient registrations into live system!`);
      } else {
        showToast('warning', 'Partial Sync', `Uploaded ${res.succeeded} records. ${res.failed} records had issues.`);
      }
    } catch (e: any) {
      showToast('error', 'Sync Failed', e?.message || 'Error occurred while uploading offline queue.');
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Sync Single Submission
  const handleSyncSingle = async (sub: OfflineSubmission) => {
    showToast('info', 'Syncing Submission', `Uploading ${sub.data.fullName} to system...`);
    const res = await OfflineFormService.syncSubmissionToLive(sub.id);
    reloadSubmissions();
    if (res.success) {
      showToast('success', 'Patient Synced!', `Registered ${sub.data.fullName} (ID: ${res.patientId}, Card: ${res.cardNumber})`);
    } else {
      showToast('error', 'Sync Error', res.error || 'Failed to sync submission');
    }
  };

  // Filter Submissions for Queue
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (queueFilter === 'pending' && (s.syncStatus !== 'pending' && s.syncStatus !== 'failed')) return false;
      if (queueFilter === 'synced' && s.syncStatus !== 'synced') return false;
      if (queueFilter === 'failed' && s.syncStatus !== 'failed') return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.data.fullName.toLowerCase().includes(q);
        const matchesMobile = s.data.mobile.includes(q);
        const matchesToken = s.offlineToken.toLowerCase().includes(q);
        const matchesCamp = (s.data.campName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesMobile && !matchesToken && !matchesCamp) return false;
      }
      return true;
    });
  }, [submissions, queueFilter, searchQuery]);

  const pendingCount = submissions.filter(s => s.syncStatus === 'pending' || s.syncStatus === 'failed').length;
  const syncedCount = submissions.filter(s => s.syncStatus === 'synced').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Connectivity Status */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight">Offline Intake & Field Camp Suite</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                    Offline First Engine
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Register patients & issue health cards anywhere with zero internet dependency. Auto-queues locally and syncs to cloud when online.
                </p>
              </div>
            </div>
          </div>

          {/* Live Status Badges & Quick Sync */}
          <div className="flex flex-wrap items-center gap-3">
            {isOnline ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-xs">
                <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Internet Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-xs">
                <WifiOff className="w-4 h-4 text-amber-400" />
                <span>Offline / Camp Mode</span>
              </div>
            )}

            {pendingCount > 0 && (
              <Button
                variant="primary"
                onClick={handleSyncAll}
                disabled={isSyncingAll || !isOnline}
                leftIcon={<UploadCloud className={`w-4 h-4 ${isSyncingAll ? 'animate-bounce' : ''}`} />}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md border border-emerald-400/30"
              >
                {isSyncingAll ? 'Syncing...' : `⚡ Sync ${pendingCount} Pending ${pendingCount === 1 ? 'Record' : 'Records'}`}
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'form'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Digital Offline Form (ক্যাম্প ফর্ম)</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'queue'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Offline Queue & Sync Hub</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('print')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'print'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Print Blank Physical Form (A4)</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: DIGITAL OFFLINE INTAKE FORM */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'form' && (
        <form onSubmit={handleSubmitOfflineForm} className="space-y-6">
          {/* Quick Camp Preset Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Field Camp / Station Details (Optional)</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Tag entries with camp location and field volunteer</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
              <div className="flex-1 min-w-[180px]">
                <Input
                  label=""
                  placeholder="Camp Name (e.g. Medix Free Camp - Sector 5)"
                  value={campName}
                  onChange={e => setCampName(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <Input
                  label=""
                  placeholder="Volunteer / Worker Name"
                  value={volunteerName}
                  onChange={e => setVolunteerName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Main Patient Demographics & Address) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Section 1: Demographics */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5 text-sm font-black text-slate-900 dark:text-white">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>1. Patient Personal & Identity Details (রোগীর বিবরণ)</span>
                  </div>
                  <Badge variant="blue">Required</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Patient Full Name *"
                      placeholder="e.g. Rajesh Kumar Sen"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      label="Father / Mother / Spouse Name"
                      placeholder="e.g. Ramesh Chandra Sen"
                      value={guardianName}
                      onChange={e => setGuardianName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Select
                      label="Relationship with Guardian"
                      value={relationshipWithGuardian}
                      onChange={e => setRelationshipWithGuardian(e.target.value)}
                      options={[
                        { value: 'Father', label: 'Father (পিতা)' },
                        { value: 'Mother', label: 'Mother (মাতা)' },
                        { value: 'Spouse', label: 'Spouse / Husband / Wife (স্বামী / স্ত্রী)' },
                        { value: 'Son', label: 'Son (পুত্র)' },
                        { value: 'Daughter', label: 'Daughter (কন্যা)' },
                        { value: 'Guardian', label: 'Other Guardian (অন্যান্য অভিভাবক)' }
                      ]}
                    />
                  </div>

                  <div>
                    <Input
                      label="Age (Years) *"
                      type="number"
                      min={0}
                      max={120}
                      value={age}
                      onChange={e => setAge(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div>
                    <Select
                      label="Gender *"
                      value={gender}
                      onChange={e => setGender(e.target.value as any)}
                      options={[
                        { value: 'male', label: 'Male (পুরুষ)' },
                        { value: 'female', label: 'Female (মহিলা)' },
                        { value: 'other', label: 'Other (অন্যান্য)' }
                      ]}
                    />
                  </div>

                  <div>
                    <Select
                      label="Blood Group"
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                      options={[
                        { value: 'A+', label: 'A+ (A Positive)' },
                        { value: 'A-', label: 'A- (A Negative)' },
                        { value: 'B+', label: 'B+ (B Positive)' },
                        { value: 'B-', label: 'B- (B Negative)' },
                        { value: 'O+', label: 'O+ (O Positive)' },
                        { value: 'O-', label: 'O- (O Negative)' },
                        { value: 'AB+', label: 'AB+ (AB Positive)' },
                        { value: 'AB-', label: 'AB- (AB Negative)' },
                        { value: 'Unknown', label: 'Unknown / Not Tested' }
                      ]}
                    />
                  </div>

                  <div>
                    <Select
                      label="Marital Status"
                      value={maritalStatus}
                      onChange={e => setMaritalStatus(e.target.value)}
                      options={[
                        { value: 'Married', label: 'Married' },
                        { value: 'Single', label: 'Single / Unmarried' },
                        { value: 'Widowed', label: 'Widowed' },
                        { value: 'Divorced', label: 'Divorced' }
                      ]}
                    />
                  </div>

                  <div>
                    <Select
                      label="Government ID Type"
                      value={governmentIdType}
                      onChange={e => setGovernmentIdType(e.target.value)}
                      options={[
                        { value: 'Aadhaar Card', label: 'Aadhaar Card (UIDAI)' },
                        { value: 'Voter ID', label: 'Voter ID Card (EPIC)' },
                        { value: 'Ration Card', label: 'Digital Ration Card' },
                        { value: 'PAN Card', label: 'PAN Card' },
                        { value: 'Driving License', label: 'Driving License' },
                        { value: 'Passport', label: 'Passport' },
                        { value: 'None', label: 'No Official ID Available' }
                      ]}
                    />
                  </div>

                  <div>
                    <Input
                      label="Government ID Number"
                      placeholder="e.g. 1234 5678 9012"
                      value={governmentIdNumber}
                      onChange={e => setGovernmentIdNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Offline Address */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5 text-sm font-black text-slate-900 dark:text-white">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>2. Contact & Offline Address Resolution (যোগাযোগ ও ঠিকানা)</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ⚡ 100% Offline PIN Resolver
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Primary Mobile Number *"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      label="WhatsApp Number (Optional)"
                      type="tel"
                      placeholder="Leave blank if same as mobile"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      label="Postal PIN Code *"
                      placeholder="6-digit PIN (e.g. 700001)"
                      value={pinCode}
                      onChange={e => handlePinCodeChange(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      label="Village / Area / Street *"
                      placeholder="e.g. Newtown Action Area 1"
                      value={villageArea}
                      onChange={e => setVillageArea(e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      label="Post Office (P.O.)"
                      placeholder="e.g. Central P.O."
                      value={postOffice}
                      onChange={e => setPostOffice(e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      label="Police Station (P.S.)"
                      placeholder="e.g. Newtown PS"
                      value={policeStation}
                      onChange={e => setPoliceStation(e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      label="District"
                      placeholder="e.g. North 24 Parganas"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      label="State"
                      placeholder="e.g. West Bengal"
                      value={stateVal}
                      onChange={e => setStateVal(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Baseline Clinical Vitals & Medical History */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5 text-sm font-black text-slate-900 dark:text-white">
                    <Activity className="w-4 h-4 text-rose-500" />
                    <span>3. Baseline Clinical Vitals & Medical Flags (চিকিৎসা ভাইটালস)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">On-ground clinical metrics</span>
                </div>

                {/* Pre-existing conditions checkboxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDiabetic}
                      onChange={e => setIsDiabetic(e.target.checked)}
                      className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500"
                    />
                    <span>Diabetes (মধুমেহ)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isHypertensive}
                      onChange={e => setIsHypertensive(e.target.checked)}
                      className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500"
                    />
                    <span>Hypertension (BP)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasHeartDisease}
                      onChange={e => setHasHeartDisease(e.target.checked)}
                      className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500"
                    />
                    <span>Cardiac Condition</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasAsthma}
                      onChange={e => setHasAsthma(e.target.checked)}
                      className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500"
                    />
                    <span>Asthma / Respiratory</span>
                  </label>
                </div>

                {/* Field Vitals Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <Input
                      label="BP Systolic (mmHg)"
                      placeholder="120"
                      value={bpSystolic}
                      onChange={e => setBpSystolic(e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      label="BP Diastolic (mmHg)"
                      placeholder="80"
                      value={bpDiastolic}
                      onChange={e => setBpDiastolic(e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      label="Pulse Rate (bpm)"
                      placeholder="72"
                      value={pulseRate}
                      onChange={e => setPulseRate(e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      label="SpO2 (%)"
                      placeholder="99"
                      value={spo2}
                      onChange={e => setSpo2(e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      label="Blood Sugar (mg/dL)"
                      placeholder="e.g. 110"
                      value={bloodSugar}
                      onChange={e => setBloodSugar(e.target.value)}
                    />
                  </div>

                  <div>
                    <Select
                      label="Sugar Test Type"
                      value={sugarType}
                      onChange={e => setSugarType(e.target.value as any)}
                      options={[
                        { value: 'random', label: 'Random (RBS)' },
                        { value: 'fasting', label: 'Fasting (FBS)' },
                        { value: 'post_prandial', label: 'Post Prandial (PPBS)' }
                      ]}
                    />
                  </div>

                  <div>
                    <Input
                      label="Weight (kg)"
                      placeholder="65"
                      value={weightKg}
                      onChange={e => setWeightKg(e.target.value)}
                    />
                  </div>

                  <div>
                    <Input
                      label="Height (cm)"
                      placeholder="165"
                      value={heightCm}
                      onChange={e => setHeightCm(e.target.value)}
                    />
                  </div>
                </div>

                {calculatedBmi && (
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900 dark:text-blue-300">
                      Calculated BMI: <strong>{calculatedBmi} kg/m²</strong>
                    </span>
                    <span className="text-slate-500">
                      {parseFloat(calculatedBmi) < 18.5 ? 'Underweight' : parseFloat(calculatedBmi) < 25 ? 'Normal BMI' : 'Overweight / Elevated'}
                    </span>
                  </div>
                )}
              </div>

              {/* Section 4: Family Members Enrollment */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5 text-sm font-black text-slate-900 dark:text-white">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>4. Family Group Members (পরিবারের সদস্য সংযোগ)</span>
                  </div>
                  <button
                    type="button"
                    onClick={addFamilyMember}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                </div>

                {familyMembers.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3">
                    No family members added yet. Click &quot;Add Member&quot; to enroll dependents under the same health card plan.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {familyMembers.map((fam, idx) => (
                      <div key={fam.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        <div className="flex-1 min-w-[150px]">
                          <input
                            type="text"
                            placeholder="Member Name"
                            value={fam.fullName}
                            onChange={e => updateFamilyMember(fam.id, { fullName: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                          />
                        </div>

                        <div className="w-32">
                          <select
                            value={fam.relationship}
                            onChange={e => updateFamilyMember(fam.id, { relationship: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                          >
                            <option value="Spouse">Spouse</option>
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Sibling">Sibling</option>
                          </select>
                        </div>

                        <div className="w-20">
                          <input
                            type="number"
                            placeholder="Age"
                            value={fam.age}
                            onChange={e => updateFamilyMember(fam.id, { age: parseInt(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFamilyMember(fam.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Photo, Digital Signature, Membership Plan & Payment) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Photo Capture */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Patient Photo (Webcam / Upload)</span>
                </div>

                <PhotoUploaderWebcam
                  photoUrl={photoBase64}
                  onPhotoChange={url => setPhotoBase64(url)}
                />
              </div>

              {/* Digital Signature Pad */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <SignaturePad
                  onSignatureChange={sig => setSignatureBase64(sig)}
                  initialSignature={signatureBase64}
                />
              </div>

              {/* Membership Plan & Payment */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span>Plan & Camp Payment</span>
                </div>

                <div>
                  <Select
                    label="Membership Plan Tier"
                    value={membershipId}
                    onChange={e => {
                      setMembershipId(e.target.value);
                      const selected = memberships.find(m => m.id === e.target.value);
                      if (selected) setFeeCollected(selected.registrationFee);
                    }}
                    options={memberships.map(m => ({
                      value: m.id,
                      label: `${m.name} (Fee: ₹${m.registrationFee})`
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Select
                      label="Payment Mode"
                      value={paymentMode}
                      onChange={e => setPaymentMode(e.target.value as any)}
                      options={[
                        { value: 'cash', label: 'Cash (নগদ)' },
                        { value: 'upi', label: 'UPI / QR Code' },
                        { value: 'ngo_free_grant', label: 'Free (NGO CSR)' },
                        { value: 'card', label: 'Card Payment' }
                      ]}
                    />
                  </div>

                  <div>
                    <Input
                      label="Amount Paid (₹)"
                      type="number"
                      value={feeCollected}
                      onChange={e => setFeeCollected(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <Input
                    label="Staff Notes / Remarks"
                    placeholder="e.g. Free camp voucher redeemed"
                    value={generalNotes}
                    onChange={e => setGeneralNotes(e.target.value)}
                  />
                </div>

                {/* Submit Offline Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Save className="w-4 h-4" />}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-blue-500/20"
                  >
                    💾 Save Patient Form (Offline Safe)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: OFFLINE QUEUE & SYNC HUB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Action Header */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Offline Registrations Queue</span>
                <Badge variant={pendingCount > 0 ? 'warning' : 'success'}>
                  {pendingCount} Pending Sync
                </Badge>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage and batch upload offline patient records collected during field health camps or internet outages.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => OfflineFormService.exportCSV()}
                leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                className="text-xs font-bold"
              >
                Export CSV
              </Button>

              <Button
                variant="secondary"
                onClick={() => OfflineFormService.exportJSON()}
                leftIcon={<Download className="w-4 h-4 text-blue-600" />}
                className="text-xs font-bold"
              >
                Backup JSON
              </Button>

              <Button
                variant="primary"
                onClick={handleSyncAll}
                disabled={isSyncingAll || pendingCount === 0 || !isOnline}
                leftIcon={<UploadCloud className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                {isSyncingAll ? 'Syncing Queue...' : `Sync All (${pendingCount})`}
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQueueFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  queueFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All ({submissions.length})
              </button>

              <button
                onClick={() => setQueueFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  queueFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}
              >
                Pending ({pendingCount})
              </button>

              <button
                onClick={() => setQueueFilter('synced')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  queueFilter === 'synced'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                Synced ({syncedCount})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, mobile, token..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Submissions Table / Cards */}
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">No Offline Submissions Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {submissions.length === 0
                  ? 'All records have been synced to the cloud, or no offline registrations have been created yet.'
                  : 'No submissions match your active filter or search query.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSubmissions.map(sub => (
                <div
                  key={sub.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-500/40 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-sm shrink-0 border border-blue-200 dark:border-blue-800">
                        {sub.data.photoBase64 ? (
                          <img src={sub.data.photoBase64} alt={sub.data.fullName} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          sub.data.fullName.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {sub.data.fullName}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500">
                          {sub.offlineToken}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        sub.syncStatus === 'synced'
                          ? 'success'
                          : sub.syncStatus === 'syncing'
                          ? 'blue'
                          : sub.syncStatus === 'failed'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {sub.syncStatus.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Mobile:</span>
                      <span className="font-semibold">{sub.data.mobile}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Age / Sex / Blood:</span>
                      <span className="font-semibold">{sub.data.age}Y • {sub.data.gender[0].toUpperCase()} • {sub.data.bloodGroup}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Location / Camp:</span>
                      <span className="font-semibold truncate block">{sub.data.campName || sub.data.district || 'General'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Fee / Mode:</span>
                      <span className="font-semibold">₹{sub.data.feeCollected} ({sub.data.paymentMode.toUpperCase()})</span>
                    </div>
                  </div>

                  {sub.syncedPatientId && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span>Live ID: <strong>{sub.syncedPatientId}</strong></span>
                      <span>Card: <strong>{sub.syncedCardNumber}</strong></span>
                    </div>
                  )}

                  {sub.syncError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300">
                      Error: {sub.syncError}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400">
                      {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {sub.syncStatus !== 'synced' && (
                        <button
                          onClick={() => handleSyncSingle(sub)}
                          disabled={!isOnline}
                          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <UploadCloud className="w-3 h-3" />
                          <span>Sync</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete offline record for ${sub.data.fullName}?`)) {
                            OfflineFormService.deleteSubmission(sub.id);
                            reloadSubmissions();
                            showToast('info', 'Record Deleted', 'Offline submission removed.');
                          }
                        }}
                        className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: PRINTABLE BLANK PHYSICAL FORM */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'print' && (
        <PrintableBlankPhysicalForm
          onBack={() => setActiveTab('form')}
          campNamePreset={campName}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: SUCCESS TOKEN AFTER SAVING */}
      {/* ---------------------------------------------------- */}
      {justSavedToken && justSavedData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Registration Queued Successfully!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient record saved to this device&apos;s offline memory.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">OFFLINE TRACKING TOKEN</span>
              <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 tracking-widest">
                {justSavedToken}
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {justSavedData.fullName} • Mobile: {justSavedData.mobile}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setJustSavedToken(null);
                  setJustSavedData(null);
                  setActiveTab('queue');
                }}
                className="w-full font-bold text-xs"
              >
                View Offline Queue
              </Button>

              <Button
                variant="primary"
                onClick={() => {
                  setJustSavedToken(null);
                  setJustSavedData(null);
                  resetForm();
                }}
                className="w-full font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                + Register Next Patient
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: SUBMISSION DETAILS VIEW */}
      {/* ---------------------------------------------------- */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedSubmission.data.fullName}
                </h3>
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                  {selectedSubmission.offlineToken} • {new Date(selectedSubmission.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Mobile Number:</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedSubmission.data.mobile}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Demographics:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {selectedSubmission.data.age} Yrs • {selectedSubmission.data.gender} • {selectedSubmission.data.bloodGroup}
                </span>
              </div>

              <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Address:</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {selectedSubmission.data.fullAddress || `${selectedSubmission.data.villageArea}, ${selectedSubmission.data.district} - ${selectedSubmission.data.pinCode}`}
                </span>
              </div>

              {selectedSubmission.data.vitals && (
                <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] mb-1">Baseline Vitals:</span>
                  <div className="grid grid-cols-4 gap-2 text-[11px]">
                    <div>BP: <strong>{selectedSubmission.data.vitals.bpSystolic}/{selectedSubmission.data.vitals.bpDiastolic}</strong></div>
                    <div>Pulse: <strong>{selectedSubmission.data.vitals.pulseRate} bpm</strong></div>
                    <div>Sugar: <strong>{selectedSubmission.data.vitals.bloodSugar || '-'} mg/dL</strong></div>
                    <div>SpO2: <strong>{selectedSubmission.data.vitals.spo2 || '-'}%</strong></div>
                  </div>
                </div>
              )}

              {selectedSubmission.data.signatureBase64 && (
                <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] mb-1">Digital Signature:</span>
                  <img src={selectedSubmission.data.signatureBase64} alt="Signature" className="h-14 border rounded bg-white p-1" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </Button>

              {selectedSubmission.syncStatus !== 'synced' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleSyncSingle(selectedSubmission);
                    setSelectedSubmission(null);
                  }}
                  disabled={!isOnline}
                  leftIcon={<UploadCloud className="w-4 h-4" />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Sync to Live System Now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
