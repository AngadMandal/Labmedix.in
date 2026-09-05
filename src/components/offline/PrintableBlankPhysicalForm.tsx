import React, { useState, useRef } from 'react';
import { StorageService } from '../../services/storage';
import {
  Printer,
  FileText,
  Building,
  Calendar,
  User,
  Phone,
  Shield,
  Heart,
  Activity,
  MapPin,
  CheckSquare,
  QrCode,
  Sparkles,
  Layers,
  ArrowLeft,
  Copy,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Stethoscope,
  Pill,
  Baby,
  Smile,
  Eye,
  Sliders,
  Scissors,
  Award,
  DollarSign,
  Briefcase,
  Zap,
  Globe,
  FileCheck,
  Check,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  Stamp,
  Upload,
  XCircle
} from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency } from '../../utils/formatters';
import { HealthCamp, NgoPartner, Membership, User as UserType } from '../../types';

export type FormArchetype =
  | 'general'
  | 'rural_camp'
  | 'school_pediatric'
  | 'geriatric_ncd'
  | 'ngo_csr_charity';

export type FormLanguage = 'bilingual' | 'en' | 'bn';
export type LogoDisplayMode = 'image' | 'crest' | 'blank_stamp' | 'hidden';

interface PrintableBlankPhysicalFormProps {
  onBack?: () => void;
  campNamePreset?: string;
  campLocationPreset?: string;
}

export const PrintableBlankPhysicalForm: React.FC<PrintableBlankPhysicalFormProps> = ({
  onBack,
  campNamePreset = '',
  campLocationPreset = ''
}) => {
  // ── Auto-Loaded Data from Company Settings & Storage Database ──
  const company = StorageService.getCompanyProfile();
  const healthCamps: HealthCamp[] = StorageService.getHealthCamps();
  const ngoPartners: NgoPartner[] = StorageService.getNgoPartners();
  const memberships: Membership[] = StorageService.getActiveMemberships();
  const allUsers: UserType[] = StorageService.getUsers();
  const doctorsList = allUsers.filter(
    u => u.role === 'doctor' || u.department?.toLowerCase().includes('medic') || u.designation?.toLowerCase().includes('dr')
  );

  // Active / Scheduled Camps
  const activeCamps = healthCamps.filter(c => c.status === 'scheduled' || c.status === 'active_today');

  // ── AUTO-FILL ON/OFF TOGGLE (RECOMMENDED DEFAULT: ON) ──
  const [isAutoFillEnabled, setIsAutoFillEnabled] = useState<boolean>(true);

  // ── LOGO CONTROLS ──
  const [logoMode, setLogoMode] = useState<LogoDisplayMode>('image');
  const [logoUrl, setLogoUrl] = useState<string>(company.logoUrl || '/logo.jpg');
  const [imageError, setImageError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── State Customizers ──
  const [formArchetype, setFormArchetype] = useState<FormArchetype>('general');
  const [language, setLanguage] = useState<FormLanguage>('bilingual');
  const [isHighContrastMonochrome, setIsHighContrastMonochrome] = useState<boolean>(false);
  const [includeReverseGuidePage, setIncludeReverseGuidePage] = useState<boolean>(true);

  // Selected Preset IDs
  const [selectedCampId, setSelectedCampId] = useState<string>(activeCamps[0]?.id || '');
  const [selectedNgoId, setSelectedNgoId] = useState<string>(ngoPartners[0]?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctorsList[0]?.id || '');

  // Live Auto-Populated & Editable Fields
  const [campName, setCampName] = useState<string>(() => {
    if (campNamePreset) return campNamePreset;
    if (activeCamps[0]) return activeCamps[0].title;
    return 'Rural Health Outreach & Clinical Diagnostic Camp';
  });

  const [campVenue, setCampVenue] = useState<string>(() => {
    if (campLocationPreset) return campLocationPreset;
    if (activeCamps[0]) return `${activeCamps[0].venueName}, ${activeCamps[0].villageOrPanchayat || activeCamps[0].locationAddress}`;
    return `${company.address}, ${company.district}`;
  });

  const [campDate, setCampDate] = useState<string>(() => {
    if (activeCamps[0]) return activeCamps[0].campDate;
    return new Date().toISOString().split('T')[0];
  });

  const [officerName, setOfficerName] = useState<string>(() => {
    if (doctorsList[0]) return `${doctorsList[0].fullName} (${doctorsList[0].designation || 'Medical Officer'})`;
    return 'Dr. S. K. Roy, MBBS, MD (Lead Medical Officer)';
  });

  const [partnerNgo, setPartnerNgo] = useState<string>(() => {
    if (ngoPartners[0]) return `${ngoPartners[0].name} (80G: ${ngoPartners[0].taxExemption80G})`;
    return 'Medix Rural Health Foundation (Govt Regd)';
  });

  const [coordinatorPhone, setCoordinatorPhone] = useState<string>(() => {
    if (activeCamps[0]) return activeCamps[0].coordinatorPhone || company.helpline;
    return company.helpline || '+91 98765 43210';
  });

  // Serial Range Generation
  const yearCode = new Date().getFullYear();
  const [serialPrefix, setSerialPrefix] = useState(`LM-CAMP-${yearCode}-WB`);
  const [startSerial, setStartSerial] = useState<number>(1001);
  const [printCopies, setPrintCopies] = useState<number>(1);

  // Quick Auto-Populate Handler when Camp Preset changes
  const handleSelectCampPreset = (campId: string) => {
    setSelectedCampId(campId);
    if (!campId) return;
    const foundCamp = healthCamps.find(c => c.id === campId);
    if (foundCamp) {
      setCampName(foundCamp.title);
      setCampVenue(`${foundCamp.venueName}, ${foundCamp.villageOrPanchayat || foundCamp.locationAddress}, ${foundCamp.district}`);
      setCampDate(foundCamp.campDate);
      if (foundCamp.coordinatorPhone) setCoordinatorPhone(foundCamp.coordinatorPhone);
      if (foundCamp.assignedDoctorNames && foundCamp.assignedDoctorNames.length > 0) {
        setOfficerName(foundCamp.assignedDoctorNames.join(', '));
      }
      if (foundCamp.ngoPartnerName) {
        const ngo = ngoPartners.find(n => n.id === foundCamp.ngoPartnerId);
        setPartnerNgo(`${foundCamp.ngoPartnerName} ${ngo?.taxExemption80G ? `(80G: ${ngo.taxExemption80G})` : ''}`);
      }
    }
  };

  // Quick Auto-Populate Handler when NGO Preset changes
  const handleSelectNgoPreset = (ngoId: string) => {
    setSelectedNgoId(ngoId);
    if (!ngoId) return;
    const foundNgo = ngoPartners.find(n => n.id === ngoId);
    if (foundNgo) {
      setPartnerNgo(`${foundNgo.name} (80G: ${foundNgo.taxExemption80G} | Code: ${foundNgo.ngoCode})`);
    }
  };

  // Quick Auto-Populate Handler when Doctor Preset changes
  const handleSelectDoctorPreset = (docId: string) => {
    setSelectedDoctorId(docId);
    if (!docId) return;
    const doc = doctorsList.find(d => d.id === docId);
    if (doc) {
      setOfficerName(`${doc.fullName} - ${doc.designation || 'Medical Consultant'} (${doc.licenseNo || 'WBMC Regd'})`);
    }
  };

  // Reset all to Company Profile defaults
  const handleResetToCompanyDefaults = () => {
    setCampName(`${company.name} - Outreach & Diagnostic Enrollment`);
    setCampVenue(`${company.address}, P.O. ${company.postOffice}, ${company.district} - ${company.pinCode}`);
    setCampDate(new Date().toISOString().split('T')[0]);
    setOfficerName('Dr. Chief Medical Officer / Authorized Registrar');
    setPartnerNgo(company.tagline || 'LabMedix Rural Healthcare Mission');
    setCoordinatorPhone(company.helpline);
    setLogoUrl(company.logoUrl || '/logo.jpg');
    setImageError(false);
    setIsAutoFillEnabled(true);
  };

  // Custom Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
          setImageError(false);
          setLogoMode('image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Array of forms for batch printing
  const formsToRender = Array.from({ length: Math.min(printCopies, 20) }).map((_, idx) => {
    const currentSerial = `${serialPrefix}-${String(startSerial + idx).padStart(4, '0')}`;
    return { currentSerial, index: idx + 1 };
  });

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* TOP CONFIGURATION & RECOMMENDATION TOOLBAR (SCREEN ONLY) */}
      {/* ---------------------------------------------------- */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl print:hidden space-y-6">
        
        {/* Main Title & Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  High-Resolution Physical Application Form Generator
                </h2>
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700 flex items-center gap-1.5 shadow-xs">
                  <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>ISO 9001 & NABH Precision Layout</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Generate high-definition, photocopy-ready hardcopies with real official logo, dynamic active camp auto-fill, and manual handwriting options.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="md"
              onClick={handleResetToCompanyDefaults}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="text-xs font-bold rounded-xl"
            >
              Reset to Company Defaults
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={handlePrint}
              leftIcon={<Printer className="w-5 h-5" />}
              className="shadow-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm px-7 py-3 rounded-2xl border border-blue-400/30 transition-all hover:scale-[1.02]"
            >
              Print Hardcopy Form {printCopies > 1 ? `(${printCopies} Numbered Sheets)` : ''}
            </Button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* PROMINENT TOGGLE: AUTO-FILL FROM ACTIVE CAMP (ON/OFF) */}
        {/* ---------------------------------------------------- */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isAutoFillEnabled
            ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 border-blue-200 dark:border-blue-800 shadow-xs'
            : 'bg-gradient-to-br from-amber-50/80 via-slate-50 to-slate-100 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border-amber-300 dark:border-amber-700/60'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${isAutoFillEnabled ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span>Auto-Fill From Active Camp & Database:</span>
                </span>
                
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide border flex items-center gap-1 ${
                  isAutoFillEnabled
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700'
                    : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700'
                }`}>
                  {isAutoFillEnabled ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>ON (Recommended • রিকমেন্ডেড)</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3" />
                      <span>OFF (Blank Form • ফাঁকা ফরম)</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {isAutoFillEnabled
                  ? '✓ Automatically injects verified camp title, venue, scheduled date, attending doctor, and sponsoring NGO partner into the form.'
                  : '📝 Blank Hardcopy Mode: Leaves camp name, venue, date, and doctor fields as clean dotted writing lines for physical pen entry.'}
              </p>
            </div>

            {/* Toggle Switch Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAutoFillEnabled(!isAutoFillEnabled)}
                className={`relative inline-flex h-9 w-18 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isAutoFillEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={isAutoFillEnabled}
                title="Toggle Auto-Fill from Active Camp"
              >
                <span className="sr-only">Toggle Auto-Fill</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center text-xs font-black ${
                    isAutoFillEnabled ? 'translate-x-9 text-blue-600' : 'translate-x-0 text-slate-500'
                  }`}
                >
                  {isAutoFillEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              <Button
                variant={isAutoFillEnabled ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setIsAutoFillEnabled(!isAutoFillEnabled)}
                className="text-xs font-black"
              >
                {isAutoFillEnabled ? 'Switch to Blank Hardcopy' : 'Enable Auto-Fill (Recommended)'}
              </Button>
            </div>
          </div>

          {/* PRESET SELECTORS (SHOWN WHEN AUTO-FILL IS ON) */}
          {isAutoFillEnabled && (
            <div className="mt-4 pt-4 border-t border-blue-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
              {/* Camp Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-500" />
                  <span>Select Active Camp Preset:</span>
                </label>
                <select
                  value={selectedCampId}
                  onChange={(e) => handleSelectCampPreset(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 truncate"
                >
                  <option value="">-- Manual Camp / Custom Entry --</option>
                  {healthCamps.map(c => (
                    <option key={c.id} value={c.id}>
                      ⛺ {c.title} ({c.campDate} • {c.venueName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Assign Field Doctor / Consultant:</span>
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => handleSelectDoctorPreset(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 truncate"
                >
                  <option value="">-- Default Lead Registrar --</option>
                  {doctorsList.map(d => (
                    <option key={d.id} value={d.id}>
                      👨‍⚕️ {d.fullName} ({d.designation || 'Medical Officer'})
                    </option>
                  ))}
                </select>
              </div>

              {/* NGO Partner Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sponsoring NGO / CSR Partner:</span>
                </label>
                <select
                  value={selectedNgoId}
                  onChange={(e) => handleSelectNgoPreset(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 truncate"
                >
                  <option value="">-- LabMedix Direct Social Mission --</option>
                  {ngoPartners.map(n => (
                    <option key={n.id} value={n.id}>
                      🤝 {n.name} (80G: {n.taxExemption80G})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* LOGO & BRANDING CUSTOMIZER BAR */}
        {/* ---------------------------------------------------- */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>Form Logo & Clinical Insignia Configuration:</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Customize company logo image, monogram crest, or blank seal box
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
            {/* Logo Display Mode Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Logo Display Style:
              </label>
              <select
                value={logoMode}
                onChange={(e) => setLogoMode(e.target.value as LogoDisplayMode)}
                className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="image">🖼️ Official Company Logo (/logo.jpg)</option>
                <option value="crest">🛡️ Clinical Insignia Monogram (LM Crest)</option>
                <option value="blank_stamp">🔲 Blank Box for Official Rubber Stamp (সিল)</option>
                <option value="hidden">❌ Hide Logo (Full Text Header)</option>
              </select>
            </div>

            {/* Custom Logo URL / Status */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Logo Image Source:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    setImageError(false);
                  }}
                  placeholder="/logo.jpg or URL"
                  className="w-full h-10 px-3 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Upload Logo Button & Preview */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload className="w-4 h-4" />}
                className="text-xs font-bold rounded-xl whitespace-nowrap"
              >
                Upload Custom Logo
              </Button>

              {/* Quick Logo Mini Preview */}
              <div className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-xs">
                {logoMode === 'image' && !imageError ? (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-contain"
                    onError={() => setImageError(true)}
                  />
                ) : logoMode === 'crest' || imageError ? (
                  <div className="w-full h-full bg-blue-700 text-white flex flex-col items-center justify-center font-black text-[10px]">
                    LM
                  </div>
                ) : logoMode === 'blank_stamp' ? (
                  <div className="text-[7px] font-bold text-slate-400 text-center">STAMP</div>
                ) : (
                  <div className="text-[8px] text-slate-300">NONE</div>
                )}
              </div>
            </div>

            {/* Quick Reset Logo to Default */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setLogoUrl(company.logoUrl || '/logo.jpg');
                  setLogoMode('image');
                  setImageError(false);
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restore Default Logo (/logo.jpg)</span>
              </button>
            </div>
          </div>
        </div>

        {/* PRIMARY CONTROLS & PRINT STYLING GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Archetype Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Form Template Type:</span>
            </label>
            <select
              value={formArchetype}
              onChange={(e) => setFormArchetype(e.target.value as FormArchetype)}
              className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">📋 1. Standard Health Card & Diagnostic Enrollment (সার্বজনীন)</option>
              <option value="rural_camp">🩺 2. Rural Health Camp, Vitals & Free Medicine (ক্যাম্প ও ওষুধ)</option>
              <option value="school_pediatric">🎒 3. School & Pediatric Screening Record (শিশু ও স্কুল)</option>
              <option value="geriatric_ncd">👴 4. Senior Citizen Geriatric & Chronic NCD Pass (প্রবীণ ও NCD)</option>
              <option value="ngo_csr_charity">🤝 5. NGO Social Welfare & 100% Free Grant Aid (সিএসআর অনুদান)</option>
            </select>
          </div>

          {/* Language Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Language Mode:</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as FormLanguage)}
              className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="bilingual">🇮🇳 Bilingual (English + বাংলা - Recommended)</option>
              <option value="en">🇬🇧 English Only (Official Standard)</option>
              <option value="bn">🇧🇩 বাংলা মাধ্যমে (Bengali Only)</option>
            </select>
          </div>

          {/* Batch Serial Generator */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>Batch Numbered Copies:</span>
            </label>
            <select
              value={printCopies}
              onChange={(e) => setPrintCopies(parseInt(e.target.value) || 1)}
              className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 Form Sheet</option>
              <option value={5}>5 Numbered Copies (1001-1005)</option>
              <option value={10}>10 Numbered Copies (1001-1010)</option>
              <option value={20}>20 Numbered Copies (Camp Pack)</option>
            </select>
          </div>

          {/* Photocopy Contrast Mode */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-500" />
              <span>Print Optimization:</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsHighContrastMonochrome(!isHighContrastMonochrome)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  isHighContrastMonochrome
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isHighContrastMonochrome ? '✓ Pure B&W (Xerox)' : 'Standard Grayscale'}
              </button>

              <button
                type="button"
                onClick={() => setIncludeReverseGuidePage(!includeReverseGuidePage)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  includeReverseGuidePage
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {includeReverseGuidePage ? '✓ Back Guide (P2)' : '1-Page Only'}
              </button>
            </div>
          </div>
        </div>

        {/* CUSTOM EDITABLE HEADERS ACCORDION (WHEN AUTO-FILL IS ON) */}
        {isAutoFillEnabled && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-500" />
                <span>Custom Field Header Override (Prints Directly on Top Banner)</span>
              </span>
              <span className="text-[11px] text-slate-500">Edit any field to customize on-the-fly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input
                label="Camp / Outreach Program Title"
                placeholder="e.g. Sundarbans Rural Health Mission"
                value={campName}
                onChange={(e) => setCampName(e.target.value)}
              />
              <Input
                label="Venue / GP Bhavan / Location"
                placeholder="e.g. Canning Community Hall"
                value={campVenue}
                onChange={(e) => setCampVenue(e.target.value)}
              />
              <Input
                label="Camp Date"
                type="date"
                value={campDate}
                onChange={(e) => setCampDate(e.target.value)}
              />
              <Input
                label="Serial Prefix (Auto Generated)"
                value={serialPrefix}
                onChange={(e) => setSerialPrefix(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <Input
                label="Assigned Doctor / Officer"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
              />
              <Input
                label="Sponsoring Organization / NGO"
                value={partnerNgo}
                onChange={(e) => setPartnerNgo(e.target.value)}
              />
              <Input
                label="Camp Coordinator Helpline"
                value={coordinatorPhone}
                onChange={(e) => setCoordinatorPhone(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* PRINTABLE SHEETS CONTAINER */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col items-center gap-8 bg-slate-200/80 dark:bg-slate-950 p-2 sm:p-8 rounded-3xl overflow-x-auto print:p-0 print:bg-white print:m-0 print:gap-0">
        
        {formsToRender.map(({ currentSerial, index }) => (
          <React.Fragment key={currentSerial}>
            
            {/* PAGE 1: PHYSICAL APPLICATION FORM (STANDARD DIN A4: 210mm x 297mm) */}
            <div
              className={`w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-950 p-6 sm:p-8 shadow-2xl border ${
                isHighContrastMonochrome ? 'border-black' : 'border-slate-300'
              } print:shadow-none print:border-none print:p-0 print:m-0 print:min-h-0 print:max-w-none print:w-full font-sans text-xs leading-snug flex flex-col justify-between`}
              style={{
                boxSizing: 'border-box',
                pageBreakAfter: includeReverseGuidePage || index < formsToRender.length ? 'always' : 'auto',
                breakAfter: includeReverseGuidePage || index < formsToRender.length ? 'page' : 'auto',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              <div>
                {/* ---------------------------------------------------- */}
                {/* MASTER COMPANY HEADER & ACCREDITATION BANNER */}
                {/* ---------------------------------------------------- */}
                <div className={`border-b-2 ${isHighContrastMonochrome ? 'border-black' : 'border-slate-900'} pb-2 mb-2`}>
                  <div className="flex items-start justify-between gap-3">
                    {/* Organization Logo & Accreditations */}
                    <div className="flex items-center gap-3">
                      {/* Dynamic Logo Rendering */}
                      {logoMode === 'image' && (
                        <div className="w-14 h-14 rounded-xl border-2 border-slate-900 bg-white p-0.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                          {!imageError ? (
                            <img
                              src={logoUrl}
                              alt={company.name || 'LabMedix'}
                              className="w-full h-full object-contain"
                              onError={() => setImageError(true)}
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-700 text-white flex flex-col items-center justify-center font-black text-xl leading-none">
                              <span>LM</span>
                              <span className="text-[6px] font-mono uppercase mt-0.5">HEALTH</span>
                            </div>
                          )}
                        </div>
                      )}

                      {logoMode === 'crest' && (
                        <div className={`w-14 h-14 rounded-xl ${isHighContrastMonochrome ? 'bg-black text-white' : 'bg-blue-700 text-white'} flex flex-col items-center justify-center font-black text-2xl border-2 border-slate-900 shrink-0 leading-none shadow-xs`}>
                          <span>LM</span>
                          <span className="text-[7px] font-mono tracking-widest uppercase mt-0.5">HEALTH</span>
                        </div>
                      )}

                      {logoMode === 'blank_stamp' && (
                        <div className="w-14 h-14 border-2 border-dashed border-slate-800 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center p-0.5 shrink-0">
                          <span className="text-[7px] font-black text-slate-700 uppercase leading-tight">OFFICIAL<br/>SEAL</span>
                          <span className="text-[6px] text-slate-500 mt-0.5">(গোল সিল)</span>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase leading-none">
                            {company.name || 'LABMEDIX MULTI-SPECIALITY HEALTHCARE & DIAGNOSTIC CENTRE'}
                          </h1>
                        </div>
                        <p className="text-[9.5px] font-bold text-slate-800 mt-0.5">
                          {company.tagline || 'Confident In Care • Automated Smart Health Card & Rural Diagnostic Network'}
                        </p>
                        <div className="text-[8.5px] font-semibold text-slate-700 flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-300">
                            Reg: {company.registrationNo || 'WB-MED-MALDA-2026/08942'}
                          </span>
                          <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-300">
                            License: {company.clinicalLicenseNo || 'CEA/WB/MLD/2026/1102'}
                          </span>
                          <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-300">
                            GSTIN: {company.gstin || '19AAACL1234F1Z5'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[8px] text-slate-600 mt-0.5 flex-wrap">
                          <span>HQ: {company.address}, {company.district} - {company.pinCode}</span>
                          <span>• 24x7 Helpline: {company.helpline || '+91 98765 43210'}</span>
                          <span>• Ambulance: {company.ambulanceHelpline || '1800 123 4567'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cross-Signed Passport Photo Box */}
                    <div className={`w-22 h-26 border-2 border-dashed ${isHighContrastMonochrome ? 'border-black' : 'border-slate-800'} rounded-lg flex flex-col items-center justify-center text-center p-1 shrink-0 bg-slate-50/50`}>
                      <User className="w-5 h-5 text-slate-400 mb-0.5" />
                      <div className="text-[7.5px] font-black text-slate-800 uppercase leading-tight">
                        {language === 'bn' ? 'পাসপোর্ট ছবি এখানে লাগান' : 'AFFIX PASSPORT PHOTO'}
                      </div>
                      <div className="text-[6.5px] text-slate-500 mt-0.5">(3.5 cm × 4.5 cm)</div>
                      <div className="text-[6px] text-slate-400 mt-0.5">{language === 'bn' ? 'স্বাক্ষর সহ' : 'Cross Signed'}</div>
                    </div>
                  </div>

                  {/* Form Title & Barcoded Unique Serial Header */}
                  <div className={`mt-1.5 py-1 px-3 ${isHighContrastMonochrome ? 'bg-black text-white' : 'bg-slate-900 text-white'} flex items-center justify-between rounded-md`}>
                    <span className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
                      <span>
                        {formArchetype === 'general' && (language === 'bn' ? 'স্মার্ট হেলথ কার্ড ও প্যাথলজি রেজিস্ট্রেশন ফর্ম' : 'PATIENT ENROLLMENT & HEALTH CARD APPLICATION FORM (অফলাইন আবেদনপত্র)')}
                        {formArchetype === 'rural_camp' && (language === 'bn' ? 'গ্রামীণ হেলথ ক্যাম্প ও বিনামূল্যে ওষুধ বিতরণ ফর্ম' : 'RURAL HEALTH CAMP CLINICAL INTAKE & MEDICINE DISPENSARY FORM')}
                        {formArchetype === 'school_pediatric' && (language === 'bn' ? 'স্কুল শিক্ষার্থী ও শিশু স্বাস্থ্য পরীক্ষা রেকর্ড' : 'PEDIATRIC & SCHOOL STUDENT HEALTH SCREENING RECORD')}
                        {formArchetype === 'geriatric_ncd' && (language === 'bn' ? 'প্রবীণ নাগরিক ও ক্রনিক রোগ পরীক্ষা হেলথ পাস' : 'SENIOR CITIZENS GERIATRIC & CHRONIC NCD SCREENING PASS')}
                        {formArchetype === 'ngo_csr_charity' && (language === 'bn' ? 'এনজিও ও সিএসআর সামাজিক চিকিৎসা সহায়তা আবেদনপত্র' : 'NGO / CSR SOCIAL WELFARE & 100% FREE GRANT APPLICATION')}
                      </span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono uppercase text-slate-300 hidden sm:inline">SERIAL NO:</span>
                      <span className="text-xs font-mono font-black tracking-widest text-amber-300">
                        {currentSerial}
                      </span>
                    </div>
                  </div>

                  {/* AUTO-POPULATED OR BLANK CAMP CONTEXT HEADER */}
                  {isAutoFillEnabled ? (
                    <div className="grid grid-cols-12 gap-1 text-[8.5px] mt-1 bg-slate-100/80 p-1.5 rounded border border-slate-300">
                      <div className="col-span-4 font-semibold text-slate-800 truncate">
                        <strong>Program/Camp:</strong> {campName}
                      </div>
                      <div className="col-span-4 font-semibold text-slate-800 truncate">
                        <strong>Venue/GP:</strong> {campVenue}
                      </div>
                      <div className="col-span-2 font-semibold text-slate-800 truncate">
                        <strong>Date:</strong> {campDate}
                      </div>
                      <div className="col-span-2 text-right font-semibold text-slate-800 truncate">
                        <strong>Helpline:</strong> {coordinatorPhone}
                      </div>
                    </div>
                  ) : (
                    /* BLANK WRITE-IN CAMP CONTEXT BANNER */
                    <div className="grid grid-cols-12 gap-1 text-[8.5px] mt-1 bg-slate-50 p-1.5 rounded border border-slate-400">
                      <div className="col-span-4 font-semibold text-slate-800">
                        <strong>Program / Camp:</strong> <span className="border-b border-dotted border-slate-600 inline-block w-28"></span>
                      </div>
                      <div className="col-span-4 font-semibold text-slate-800">
                        <strong>Venue / GP:</strong> <span className="border-b border-dotted border-slate-600 inline-block w-28"></span>
                      </div>
                      <div className="col-span-2 font-semibold text-slate-800">
                        <strong>Date:</strong> [ ][ ]/[ ][ ]/2026
                      </div>
                      <div className="col-span-2 text-right font-semibold text-slate-800">
                        <strong>Helpline:</strong> {company.helpline || '+91 98765 43210'}
                      </div>
                    </div>
                  )}
                </div>

                {/* ---------------------------------------------------- */}
                {/* SECTION 1: PRIMARY PATIENT DEMOGRAPHICS */}
                {/* ---------------------------------------------------- */}
                <div className="mb-2">
                  <div className={`px-2 py-0.5 font-black text-[9px] uppercase tracking-wider ${isHighContrastMonochrome ? 'bg-slate-200 border-l-4 border-black text-black' : 'bg-slate-200 border-l-4 border-blue-700 text-slate-950'} mb-1 flex justify-between`}>
                    <span>1. PRIMARY APPLICANT DEMOGRAPHICS (আবেদনকারীর ব্যক্তিগত বিবরণ)</span>
                    <span className="text-[8px] font-normal text-slate-700">Write in BLOCK LETTERS using Blue/Black Pen</span>
                  </div>

                  <div className="grid grid-cols-12 gap-1">
                    {/* Full Name */}
                    <div className="col-span-8 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        Applicant Full Name (রোগীর পুরো নাম) *:
                      </span>
                      <div className="h-4 border-b border-dotted border-slate-400 mt-0.5"></div>
                    </div>

                    {/* DOB / Age */}
                    <div className="col-span-4 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        DOB & Age (জন্ম তারিখ ও বয়স) *:
                      </span>
                      <div className="h-4 flex items-center justify-between text-[8.5px] text-slate-600 mt-0.5">
                        <span className="font-mono">[D][D] / [M][M] / [Y][Y][Y][Y]</span>
                        <span className="border-l border-slate-400 pl-1 font-bold">Age: _____ Yrs</span>
                      </div>
                    </div>

                    {/* Guardian Name */}
                    <div className="col-span-7 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        Father / Mother / Spouse / Guardian (অভিভাবকের নাম):
                      </span>
                      <div className="h-4 border-b border-dotted border-slate-400 mt-0.5"></div>
                    </div>

                    {/* Gender */}
                    <div className="col-span-5 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        Gender (লিঙ্গ) *:
                      </span>
                      <div className="flex items-center gap-3 text-[8.5px] mt-0.5 font-semibold">
                        <label className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-700 inline-block rounded-xs"></span> Male (পু)</label>
                        <label className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-700 inline-block rounded-xs"></span> Female (ম)</label>
                        <label className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-700 inline-block rounded-xs"></span> Other</label>
                      </div>
                    </div>

                    {/* Blood Group */}
                    <div className="col-span-4 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        Blood Group (রক্তের গ্রুপ):
                      </span>
                      <div className="text-[8px] font-bold mt-0.5 text-slate-900">
                        [ ] A+ [ ] B+ [ ] O+ [ ] AB+ [ ] Rh- [ ] Unknown
                      </div>
                    </div>

                    {/* Marital Status */}
                    <div className="col-span-3 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        Marital Status:
                      </span>
                      <div className="text-[8px] mt-0.5 text-slate-900">
                        [ ] Married [ ] Single [ ] Widowed
                      </div>
                    </div>

                    {/* Govt ID Type Selection */}
                    <div className="col-span-5 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        ID Proof: [ ] Aadhaar [ ] Voter [ ] Ration [ ] Health ID
                      </span>
                    </div>

                    {/* Aadhaar / ID 12-Box Grid */}
                    <div className="col-span-12 border border-slate-400 p-1 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold text-slate-800 uppercase">
                          UIDAI Aadhaar / Official ID Number (১২ ডিজিট আধার নম্বর):
                        </span>
                        <span className="text-[7px] text-slate-500">1 digit per box</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <span key={i} className="w-4 h-3.5 border border-slate-700 inline-block text-center font-mono font-bold text-[8.5px]"></span>
                          ))}
                        </div>
                        <span className="font-bold text-slate-500">-</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <span key={i} className="w-4 h-3.5 border border-slate-700 inline-block text-center font-mono font-bold text-[8.5px]"></span>
                          ))}
                        </div>
                        <span className="font-bold text-slate-500">-</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <span key={i} className="w-4 h-3.5 border border-slate-700 inline-block text-center font-mono font-bold text-[8.5px]"></span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* SECTION 2: CONTACT & RESIDENTIAL ADDRESS RESOLUTION */}
                {/* ---------------------------------------------------- */}
                <div className="mb-2">
                  <div className={`px-2 py-0.5 font-black text-[9px] uppercase tracking-wider ${isHighContrastMonochrome ? 'bg-slate-200 border-l-4 border-black text-black' : 'bg-slate-200 border-l-4 border-blue-700 text-slate-950'} mb-1`}>
                    2. CONTACT NUMBERS & RESIDENTIAL ADDRESS (যোগাযোগ ও স্থায়ী ঠিকানা)
                  </div>

                  <div className="grid grid-cols-12 gap-1">
                    {/* Primary Mobile 10-box */}
                    <div className="col-span-6 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        Primary Mobile No (১০ সংখ্যার মোবাইল নম্বর) *:
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[8.5px] font-bold text-slate-600">+91</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <span key={i} className="w-3.5 h-3.5 border border-slate-700 inline-block text-center font-mono font-bold text-[8.5px]"></span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Alternate Mobile */}
                    <div className="col-span-3 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        WhatsApp / Alt No:
                      </span>
                      <div className="h-3.5 border-b border-dotted border-slate-400 mt-0.5"></div>
                    </div>

                    {/* PIN Code 6-box */}
                    <div className="col-span-3 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        PIN Code (পিন কোড) *:
                      </span>
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <span key={i} className="w-3.5 h-3.5 border border-slate-700 inline-block text-center font-mono font-bold text-[8.5px]"></span>
                        ))}
                      </div>
                    </div>

                    {/* Village / Area / Para */}
                    <div className="col-span-5 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        Village / Street / Para / House (গ্রাম / পাড়া):
                      </span>
                      <div className="h-3.5 border-b border-dotted border-slate-400 mt-0.5"></div>
                    </div>

                    {/* Post Office */}
                    <div className="col-span-3 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        Post Office (ডাকঘর):
                      </span>
                      <div className="h-3.5 border-b border-dotted border-slate-400 mt-0.5"></div>
                    </div>

                    {/* Police Station */}
                    <div className="col-span-2 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        Thana (থানা):
                      </span>
                      <div className="h-3.5 border-b border-dotted border-slate-400 mt-0.5"></div>
                    </div>

                    {/* District */}
                    <div className="col-span-2 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase">
                        District (জেলা):
                      </span>
                      <div className="h-3.5 border-b border-dotted border-slate-400 mt-0.5"></div>
                    </div>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* SECTION 3: CLINICAL TRIAGE & BASELINE VITALS */}
                {/* ---------------------------------------------------- */}
                <div className="mb-2">
                  <div className={`px-2 py-0.5 font-black text-[9px] uppercase tracking-wider ${isHighContrastMonochrome ? 'bg-slate-200 border-l-4 border-black text-black' : 'bg-slate-200 border-l-4 border-blue-700 text-slate-950'} mb-1 flex justify-between`}>
                    <span>3. CLINICAL TRIAGE, BASELINE VITALS & HISTORY (চিকিৎসা ইতিহাস ও ভাইটালস)</span>
                    <span className="text-[7.5px] font-bold text-slate-700">WHO / ESH Clinical Protocol</span>
                  </div>

                  <div className="grid grid-cols-12 gap-1">
                    {/* Pre-Existing Conditions Checklist */}
                    <div className="col-span-6 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase mb-0.5">
                        Chronic Medical History (পূর্ববর্তী রোগ):
                      </span>
                      <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[8px]">
                        <label className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> Diabetes (সুগার)</label>
                        <label className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> Hypertension (রক্তচাপ)</label>
                        <label className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> Cardiac / Heart</label>
                        <label className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> Asthma / COPD (হাঁপানি)</label>
                        <label className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> Thyroid / Goitre</label>
                        <label className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> Drug Allergies (অ্যালার্জি)</label>
                      </div>
                    </div>

                    {/* On-Spot Field Vitals Matrix */}
                    <div className="col-span-6 border border-slate-400 p-1 rounded">
                      <span className="text-[8px] font-bold text-slate-800 block uppercase mb-0.5">
                        On-Spot Recorded Vitals (ক্যাম্পে রেকর্ডকৃত ভাইটালস):
                      </span>
                      <div className="grid grid-cols-3 gap-1 text-[8px]">
                        <div className="border-b border-slate-300 pb-0.5 font-medium">BP: ____ / ____ mmHg</div>
                        <div className="border-b border-slate-300 pb-0.5 font-medium">Pulse: ______ bpm</div>
                        <div className="border-b border-slate-300 pb-0.5 font-medium">SpO2: ______ %</div>
                        <div className="border-b border-slate-300 pb-0.5 font-medium">RBS: ____ mg/dL</div>
                        <div className="border-b border-slate-300 pb-0.5 font-medium">Weight: ____ kg</div>
                        <div className="border-b border-slate-300 pb-0.5 font-medium">Height: ____ cm</div>
                      </div>
                      <div className="flex items-center justify-between text-[7.5px] font-bold mt-0.5 text-slate-700">
                        <span>Triage: [ ] Normal  [ ] Moderate (Stage 1)  [ ] High Risk  [ ] Emergency Crisis</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* SECTION 4: ARCHETYPE SPECIFIC DYNAMIC MATRICES */}
                {/* ---------------------------------------------------- */}

                {/* 4A: UNIVERSAL HEALTH CARD MEMBERSHIP & FAMILY MEMBERS */}
                {formArchetype === 'general' && (
                  <div className="mb-2">
                    <div className={`px-2 py-0.5 font-black text-[9px] uppercase tracking-wider ${isHighContrastMonochrome ? 'bg-slate-200 border-l-4 border-black text-black' : 'bg-slate-200 border-l-4 border-blue-700 text-slate-950'} mb-1 flex justify-between`}>
                      <span>4. FAMILY MEMBERS HEALTH CARD ENROLLMENT (পরিবারের সদস্যবৃন্দের তালিকা)</span>
                      <span className="text-[8px] font-black text-black">
                        Plan: {memberships.map(m => `[ ] ${m.name}${m.isRecommended ? ' ★[RECOMMENDED]' : ''} (${formatCurrency(m.registrationFee)})`).join('  ')}
                      </span>
                    </div>

                    <table className="w-full border-collapse border border-slate-500 text-[8px]">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-slate-900">
                          <th className="border border-slate-500 p-0.5 text-center w-6">#</th>
                          <th className="border border-slate-500 p-0.5 text-left">Family Member Full Name (সদস্যের পুরো নাম)</th>
                          <th className="border border-slate-500 p-0.5 text-center w-20">Relation</th>
                          <th className="border border-slate-500 p-0.5 text-center w-14">Age / Sex</th>
                          <th className="border border-slate-500 p-0.5 text-center w-14">Blood Grp</th>
                          <th className="border border-slate-500 p-0.5 text-center w-18">Card Needed?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3].map((num) => (
                          <tr key={num} className="h-4.5">
                            <td className="border border-slate-500 text-center font-bold">{num}</td>
                            <td className="border border-slate-500 px-1"></td>
                            <td className="border border-slate-500 px-1 text-center text-[7px] text-slate-500">Spouse / Child / Parent</td>
                            <td className="border border-slate-500 px-1"></td>
                            <td className="border border-slate-500 px-1"></td>
                            <td className="border border-slate-500 text-center text-[7.5px]">[ ] Yes [ ] No</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 4B: RURAL HEALTH CAMP FREE MEDICINE DISPENSARY */}
                {formArchetype === 'rural_camp' && (
                  <div className="mb-2">
                    <div className={`px-2 py-0.5 font-black text-[9px] uppercase tracking-wider ${isHighContrastMonochrome ? 'bg-slate-200 border-l-4 border-black text-black' : 'bg-slate-200 border-l-4 border-emerald-700 text-slate-950'} mb-1 flex justify-between`}>
                      <span>4. FIELD MEDICINE DISPENSARY & DOCTOR PRESCRIPTION (বিনামূল্যে ওষুধ বিতরণ)</span>
                      <span className="text-[8px] font-bold text-emerald-800">100% Free NGO Sponsored</span>
                    </div>

                    <table className="w-full border-collapse border border-slate-500 text-[8px]">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-slate-900">
                          <th className="border border-slate-500 p-0.5 text-center w-6">#</th>
                          <th className="border border-slate-500 p-0.5 text-left">Prescribed Medicine (ওষুধের নাম)</th>
                          <th className="border border-slate-500 p-0.5 text-center w-24">Dosage (১-০-১)</th>
                          <th className="border border-slate-500 p-0.5 text-center w-14">Qty</th>
                          <th className="border border-slate-500 p-0.5 text-center w-14">Days</th>
                          <th className="border border-slate-500 p-0.5 text-left">Instructions (খাওয়ার নিয়ম)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3].map((num) => (
                          <tr key={num} className="h-4.5">
                            <td className="border border-slate-500 text-center font-bold">{num}</td>
                            <td className="border border-slate-500 px-1"></td>
                            <td className="border border-slate-500 px-1 text-center"></td>
                            <td className="border border-slate-500 px-1 text-center"></td>
                            <td className="border border-slate-500 px-1 text-center"></td>
                            <td className="border border-slate-500 px-1 text-[7px] text-slate-500">[ ] Before Food [ ] After Food</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 4C: SCHOOL PEDIATRIC HEALTH RECORD */}
                {formArchetype === 'school_pediatric' && (
                  <div className="mb-2">
                    <div className={`px-2 py-0.5 font-black text-[9px] uppercase tracking-wider ${isHighContrastMonochrome ? 'bg-slate-200 border-l-4 border-black text-black' : 'bg-slate-200 border-l-4 border-amber-600 text-slate-950'} mb-1 flex justify-between`}>
                      <span>4. PEDIATRIC & SCHOOL HEALTH SCREENING (শিশু স্বাস্থ্য ও পুষ্টি মূল্যায়ন)</span>
                      <span className="text-[8px] font-bold text-slate-800">School: ____________________ Class: _____ Roll: _____</span>
                    </div>

                    <div className="grid grid-cols-12 gap-1 border border-slate-500 p-1 rounded text-[8px]">
                      <div className="col-span-3 border-r border-slate-300 pr-1">
                        <strong>Vision Acuity (চোখের দৃষ্টি):</strong>
                        <div className="mt-0.5">L: 6 / ___ | R: 6 / ___</div>
                        <div>[ ] Normal  [ ] Squint  [ ] Refractive</div>
                      </div>
                      <div className="col-span-3 border-r border-slate-300 px-1">
                        <strong>Dental & Oral Hygiene:</strong>
                        <div className="mt-0.5">[ ] Healthy [ ] Caries/Cavity</div>
                        <div>[ ] Fluorosis [ ] Malocclusion</div>
                      </div>
                      <div className="col-span-3 border-r border-slate-300 px-1">
                        <strong>Nutritional Grading:</strong>
                        <div className="mt-0.5">BMI: ________ Mid-Arm: ___ cm</div>
                        <div>[ ] SAM [ ] MAM [ ] Normal</div>
                      </div>
                      <div className="col-span-3 pl-1">
                        <strong>Deworming & Prophylaxis:</strong>
                        <div className="mt-0.5">[ ] Albendazole 400mg Given</div>
                        <div>[ ] Vitamin A Syrup Administered</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4D: GERIATRIC & CHRONIC NCD HEALTH PASS */}
                {formArchetype === 'geriatric_ncd' && (
                  <div className="mb-2">
                    <div className={`px-2 py-0.5 font-black text-[9px] uppercase tracking-wider ${isHighContrastMonochrome ? 'bg-slate-200 border-l-4 border-black text-black' : 'bg-slate-200 border-l-4 border-purple-700 text-slate-950'} mb-1 flex justify-between`}>
                      <span>4. GERIATRIC & NON-COMMUNICABLE DISEASE (NCD) MONITORING</span>
                      <span className="text-[8px] font-bold text-purple-800">Senior Care SOS Network</span>
                    </div>

                    <div className="grid grid-cols-12 gap-1 border border-slate-500 p-1 rounded text-[8px]">
                      <div className="col-span-4 border-r border-slate-300 pr-1">
                        <strong>Cardiovascular & ECG:</strong>
                        <div className="mt-0.5">ECG Status: [ ] Normal [ ] Abnormal</div>
                        <div>Angina / Chest Pain: [ ] Yes [ ] No</div>
                      </div>
                      <div className="col-span-4 border-r border-slate-300 px-1">
                        <strong>Glycemic & Renal Markers:</strong>
                        <div className="mt-0.5">Fasting Sugar: ________ mg/dL</div>
                        <div>HbA1c: _____ % | Serum Creatinine: ___</div>
                      </div>
                      <div className="col-span-4 pl-1">
                        <strong>Mobility, Cataract & Fall Risk:</strong>
                        <div className="mt-0.5">Walking Aid: [ ] None [ ] Stick [ ] Chair</div>
                        <div>Cataract Exam: [ ] Clear [ ] Immature [ ] Op</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4E: NGO / CSR CHARITY AID GRANT APPLICATION */}
                {formArchetype === 'ngo_csr_charity' && (
                  <div className="mb-2">
                    <div className={`px-2 py-0.5 font-black text-[9px] uppercase tracking-wider ${isHighContrastMonochrome ? 'bg-slate-200 border-l-4 border-black text-black' : 'bg-slate-200 border-l-4 border-rose-700 text-slate-950'} mb-1 flex justify-between`}>
                      <span>4. NGO / CSR CHARITY MEDICAL AID & SUBSIDY GRANT (সামাজিক চিকিৎসা অনুদান)</span>
                      <span className="text-[8px] font-bold text-rose-800">Income Category: [ ] BPL  [ ] Antyodaya  [ ] Low Income</span>
                    </div>

                    <div className="grid grid-cols-12 gap-1 border border-slate-500 p-1 rounded text-[8px]">
                      <div className="col-span-4 border-r border-slate-300 pr-1">
                        <strong>Sponsoring NGO / Trust:</strong>
                        <div className="mt-0.5 font-bold text-slate-900 truncate">
                          {isAutoFillEnabled ? partnerNgo : '____________________________________'}
                        </div>
                        <div>MoU Grant Scheme: 100% Diagnostic Relief</div>
                      </div>
                      <div className="col-span-4 border-r border-slate-300 px-1">
                        <strong>Requested Medical Aid:</strong>
                        <div className="mt-0.5">[ ] Free Health Card [ ] Free Blood Tests</div>
                        <div>[ ] Free Medicines [ ] Specialist Referral</div>
                      </div>
                      <div className="col-span-4 pl-1">
                        <strong>Welfare Grant Approval:</strong>
                        <div className="mt-0.5">Grant Approved: ₹ ___________</div>
                        <div>Signed by NGO Trustee / Secretary</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* SECTION 5: RECOMMENDED DIAGNOSTIC LAB INVESTIGATION CHECKLIST */}
                {/* ---------------------------------------------------- */}
                <div className="mb-2">
                  <div className={`px-2 py-0.5 font-black text-[9px] uppercase tracking-wider ${isHighContrastMonochrome ? 'bg-slate-200 border-l-4 border-black text-black' : 'bg-slate-200 border-l-4 border-indigo-700 text-slate-950'} mb-1 flex justify-between`}>
                    <span>5. RECOMMENDED LAB DIAGNOSTIC INVESTIGATION CHECKLIST (পরীক্ষা তালিকা)</span>
                    <span className="text-[7.5px] font-semibold text-slate-700">LabMedix Automated Pathology Labs</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-[7.5px] border border-slate-400 p-1 rounded bg-slate-50/40">
                    <div>
                      <label className="flex items-center gap-1 font-medium"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> [ ] CBC (Complete Blood Count)</label>
                      <label className="flex items-center gap-1 font-medium mt-0.5"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> [ ] Blood Glucose (F / PP / R)</label>
                    </div>
                    <div>
                      <label className="flex items-center gap-1 font-medium"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> [ ] HbA1c (3-Month Sugar)</label>
                      <label className="flex items-center gap-1 font-medium mt-0.5"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> [ ] Lipid Profile (Cholesterol)</label>
                    </div>
                    <div>
                      <label className="flex items-center gap-1 font-medium"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> [ ] LFT (Liver Function Test)</label>
                      <label className="flex items-center gap-1 font-medium mt-0.5"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> [ ] KFT / Urea / Creatinine</label>
                    </div>
                    <div>
                      <label className="flex items-center gap-1 font-medium"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> [ ] Thyroid Profile (T3, T4, TSH)</label>
                      <label className="flex items-center gap-1 font-medium mt-0.5"><span className="w-2.5 h-2.5 border border-slate-700 inline-block rounded-xs"></span> [ ] 12-Lead ECG / Chest X-Ray</label>
                    </div>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* SECTION 6: PAYMENT & REGISTRATION LEDGER */}
                {/* ---------------------------------------------------- */}
                <div className="mb-2">
                  <div className={`px-2 py-0.5 font-black text-[9px] uppercase tracking-wider ${isHighContrastMonochrome ? 'bg-slate-200 border-l-4 border-black text-black' : 'bg-slate-200 border-l-4 border-blue-700 text-slate-950'} mb-1`}>
                    6. PAYMENT COLLECTION & ENROLLMENT RECEIPT (পেমেন্ট ও নথিভুক্তিকরণ)
                  </div>

                  <div className="grid grid-cols-12 gap-1 text-[8px]">
                    <div className="col-span-4 border border-slate-400 p-1 rounded">
                      <span className="font-bold text-slate-800 block uppercase">Registration Fee Paid:</span>
                      <div className="mt-0.5 font-mono font-bold">
                        ₹ _____________ (In Words: _______________________)
                      </div>
                    </div>

                    <div className="col-span-4 border border-slate-400 p-1 rounded">
                      <span className="font-bold text-slate-800 block uppercase">Payment Channel:</span>
                      <div className="mt-0.5 font-bold">
                        [ ] Cash  [ ] UPI ({company.upiSettings?.merchantVpa || '7047108226@okbizaxis'})  [ ] 100% Free Grant
                      </div>
                    </div>

                    <div className="col-span-4 border border-slate-400 p-1 rounded">
                      <span className="font-bold text-slate-800 block uppercase">Attending Officer / Registrar:</span>
                      <div className="mt-0.5 font-semibold truncate">
                        {isAutoFillEnabled ? officerName : '____________________________________'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* SECTION 7: DECLARATION & TRIPLE SIGNATURE BOXES */}
                {/* ---------------------------------------------------- */}
                <div className="border border-slate-500 p-1.5 rounded bg-slate-50/50 mb-1.5">
                  <p className="text-[7px] text-slate-700 leading-tight mb-1">
                    <strong>Declaration (ঘোষণা):</strong> I hereby declare that the particulars given above are true and complete. I authorize {company.name || 'LabMedix Healthcare'} to process my registration, generate my Smart Health Card, and maintain my digital Electronic Medical Records (EMR) in strict compliance with clinical data protection guidelines.
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    <div className="text-center">
                      <div className="h-6 border-b border-slate-600"></div>
                      <div className="text-[7.5px] font-bold text-slate-900 mt-0.5">Signature of Applicant</div>
                      <div className="text-[6.5px] text-slate-500">(আবেদনকারীর স্বাক্ষর)</div>
                    </div>

                    <div className="text-center">
                      <div className="w-14 h-6 border border-slate-600 rounded mx-auto bg-white flex items-center justify-center text-[6px] text-slate-400 font-bold uppercase">
                        Left Thumb Impression
                      </div>
                      <div className="text-[7.5px] font-bold text-slate-900 mt-0.5">Thumb Impression (LTI)</div>
                      <div className="text-[6.5px] text-slate-500">(বাম হাতের টিপসই)</div>
                    </div>

                    <div className="text-center">
                      <div className="h-6 border-b border-slate-600"></div>
                      <div className="text-[7.5px] font-bold text-slate-900 mt-0.5">Authorized Registrar & Seal</div>
                      <div className="text-[6.5px] text-slate-500">(ক্যাম্প অফিসার ও সিলমোহর)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* TEAR-OFF BOTTOM ACKNOWLEDGMENT RECEIPT SLIP */}
              {/* ---------------------------------------------------- */}
              <div className="border-t-2 border-dashed border-slate-800 pt-1.5 mt-0.5 shrink-0">
                <div className="flex items-center justify-between text-[7.5px] font-mono font-bold text-slate-700 mb-0.5">
                  <span className="flex items-center gap-1">
                    <Scissors className="w-3 h-3 text-slate-900" />
                    <span>TEAR-OFF PATIENT ACKNOWLEDGMENT RECEIPT & TEMPORARY HEALTH PASS (গ্রাহক প্রাপ্তি স্বীকার রসিদ)</span>
                  </span>
                  <span>Helpline: {company.helpline || '+91 98765 43210'} | Web: {company.website || 'labmedix.in'}</span>
                </div>

                <div className="border border-slate-600 p-1.5 rounded bg-blue-50/40 flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-0.5">
                    <div className="font-black text-[9px] text-slate-950 uppercase flex items-center gap-2">
                      <span>{company.name || 'LABMEDIX MULTI-SPECIALITY CENTRE'}</span>
                      <span className="text-[7px] font-bold px-1 py-0.2 rounded bg-blue-200 text-blue-900 font-mono">
                        TEMPORARY PASS
                      </span>
                    </div>

                    <div className="text-[7.5px] text-slate-800">
                      Patient Name: ________________________________ | Mobile: _____________________
                    </div>

                    <div className="text-[7.5px] text-slate-800 flex items-center gap-3">
                      <span>Application Serial: <strong className="font-mono text-blue-900 font-black">{currentSerial}</strong></span>
                      <span>Date: <strong>{isAutoFillEnabled ? campDate : '____/____/2026'}</strong></span>
                      <span>Amount Received: ₹ __________</span>
                    </div>

                    <div className="text-[6.5px] text-slate-600">
                      * Present this tear-off slip at {company.name} front desk or diagnostic lab counter to collect your permanent PVC Smart Health Card.
                    </div>
                  </div>

                  {/* Stamp & QR Box */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-14 h-14 border border-slate-700 rounded bg-white flex flex-col items-center justify-center text-center p-0.5">
                      <QrCode className="w-7 h-7 text-slate-800" />
                      <span className="text-[5.5px] font-mono font-bold mt-0.5 text-slate-700">SCAN VERIFY</span>
                    </div>

                    <div className="w-18 h-14 border-2 border-dotted border-slate-700 rounded bg-white flex flex-col items-center justify-center text-center p-0.5">
                      <span className="text-[6.5px] font-bold text-slate-400 uppercase">OFFICIAL SEAL</span>
                      <span className="text-[5.5px] text-slate-400 mt-1">& SIGNATURE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* PAGE 2: OPTIONAL REVERSE SIDE (GUIDE & TERMS MATRIX) */}
            {/* ---------------------------------------------------- */}
            {includeReverseGuidePage && (
              <div
                className={`w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-950 p-6 sm:p-8 shadow-2xl border ${
                  isHighContrastMonochrome ? 'border-black' : 'border-slate-300'
                } print:shadow-none print:border-none print:p-0 print:m-0 print:min-h-0 print:max-w-none print:w-full font-sans text-xs leading-snug flex flex-col justify-between`}
                style={{
                  boxSizing: 'border-box',
                  pageBreakAfter: index < formsToRender.length ? 'always' : 'auto',
                  breakAfter: index < formsToRender.length ? 'page' : 'auto',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
              >
                <div>
                  {/* Reverse Header */}
                  <div className="border-b-2 border-slate-900 pb-2 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {logoMode === 'image' && !imageError ? (
                          <img
                            src={logoUrl}
                            alt="Logo"
                            className="w-8 h-8 object-contain rounded-md border border-slate-400 bg-white"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                            LM
                          </div>
                        )}
                        <div>
                          <h2 className="font-black text-sm uppercase text-slate-950">
                            {company.name || 'LABMEDIX HEALTHCARE'} • APPLICANT GUIDELINES & MEMBERSHIP MATRIX
                          </h2>
                          <p className="text-[9px] text-slate-600">
                            Page 2 of 2: Terms of Service, Document Checklist & Diagnostic Entitlements (আবেদনকারী সহায়িকা)
                          </p>
                        </div>
                      </div>

                      <span className="font-mono text-[9px] font-bold px-2 py-0.5 bg-slate-100 rounded border border-slate-300">
                        REF: {currentSerial}
                      </span>
                    </div>
                  </div>

                  {/* Section A: Mandatory Document Checklist */}
                  <div className="mb-3 border border-slate-400 p-2.5 rounded bg-slate-50/50">
                    <div className="font-black text-[9.5px] uppercase text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-blue-700" />
                      <span>A. MANDATORY ENROLLMENT DOCUMENTS (প্রয়োজনীয় নথিপত্র)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[8.5px] text-slate-800">
                      <div className="flex items-start gap-1.5">
                        <span className="font-bold text-blue-800">1.</span>
                        <span>Photocopy of Govt Photo ID Proof (Aadhaar / Voter / Ration / PAN Card).</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="font-bold text-blue-800">2.</span>
                        <span>One passport size colored photograph affixed on front side.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="font-bold text-blue-800">3.</span>
                        <span>For Family Health Card: ID proof copies of listed family members.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="font-bold text-blue-800">4.</span>
                        <span>For NGO / CSR Aid: BPL Ration Card / Panchayat Income Certificate.</span>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Membership Tiers & Discount Comparison */}
                  <div className="mb-3">
                    <div className="font-black text-[9.5px] uppercase text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>B. MEMBERSHIP TIERS, CLINICAL BENEFITS & SAVINGS MATRIX</span>
                    </div>

                    <table className="w-full border-collapse border border-slate-500 text-[8px]">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-slate-900">
                          <th className="border border-slate-500 p-1 text-left">Tier Name</th>
                          <th className="border border-slate-500 p-1 text-center">Registration</th>
                          <th className="border border-slate-500 p-1 text-center">Validity</th>
                          <th className="border border-slate-500 p-1 text-center">Pathology</th>
                          <th className="border border-slate-500 p-1 text-center">Pharmacy</th>
                          <th className="border border-slate-500 p-1 text-center">OPD Consult</th>
                          <th className="border border-slate-500 p-1 text-left">Key Included Entitlements</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memberships.slice(0, 6).map((m) => (
                          <tr key={m.id} className={`h-5 ${m.isRecommended ? 'bg-slate-200 font-black text-black' : ''}`}>
                            <td className="border border-slate-500 px-1.5 font-black text-black">
                              <div className="flex items-center gap-1.5">
                                <span>{m.name}</span>
                                {m.isRecommended && (
                                  <span className="text-[7px] bg-black text-white px-1 py-0.5 rounded font-black tracking-wider uppercase border border-black">
                                    ★ RECOMMENDED
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="border border-slate-500 px-1 text-center font-mono font-bold text-blue-900">
                              {formatCurrency(m.registrationFee)}
                            </td>
                            <td className="border border-slate-500 px-1 text-center">{m.validityMonths} Months</td>
                            <td className="border border-slate-500 px-1 text-center font-bold text-emerald-800">
                              {m.labDiscount ?? 25}% OFF
                            </td>
                            <td className="border border-slate-500 px-1 text-center font-bold text-emerald-800">
                              {m.pharmacyDiscount ?? 12}% OFF
                            </td>
                            <td className="border border-slate-500 px-1 text-center font-bold text-emerald-800">
                              {m.opdDiscount ?? 30}% OFF
                            </td>
                            <td className="border border-slate-500 px-1 text-[7.5px] text-slate-700">
                              {m.specialBenefits?.slice(0, 2).join(' • ') || 'Free Blood Sugar & ECG Screening'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Section C: Terms & Conditions */}
                  <div className="mb-3 border border-slate-400 p-2.5 rounded bg-slate-50/50">
                    <div className="font-black text-[9.5px] uppercase text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-slate-800" />
                      <span>C. GENERAL CLINICAL RULES & SERVICE CONDITIONS (নিয়মাবলী ও শর্তাবলী)</span>
                    </div>

                    <ol className="list-decimal list-inside space-y-1 text-[8px] text-slate-800 leading-relaxed">
                      <li>
                        <strong>Card Non-Transferability:</strong> The Smart Health Card is issued in the applicant's name and is non-transferable except for designated dependent family members.
                      </li>
                      <li>
                        <strong>Validity & Renewal:</strong> Membership discounts and health entitlements remain valid for the period specified from the date of issuance.
                      </li>
                      <li>
                        <strong>Laboratory Accreditation:</strong> All diagnostic testing is conducted under certified clinical protocol and ISO 9001:2015 quality standards.
                      </li>
                      <li>
                        <strong>Digital Electronic Medical Record (EMR):</strong> Diagnostic reports and prescriptions are archived in our secure cloud portal, accessible 24x7 via QR scan.
                      </li>
                      <li>
                        <strong>Emergency Care Hotline:</strong> In case of clinical emergency or ambulance requirement, immediately contact our dedicated 24x7 helpline: <strong>{company.ambulanceHelpline || '1800 123 4567'}</strong>.
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Reverse Page Bottom Footer */}
                <div className="border-t border-slate-400 pt-2 flex items-center justify-between text-[7.5px] text-slate-600">
                  <span>{company.name} • Certified Diagnostic & Social Outreach Network</span>
                  <span>HQ: {company.address}, {company.district} | Helpline: {company.helpline} | Web: {company.website || 'labmedix.in'}</span>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
