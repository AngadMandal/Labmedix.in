import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WebsiteService, WebsiteCMSConfig, WebsiteCardTierConfig } from '../../services/websiteService';
import { CatalogService, HealthPackageItem, LabTestItem } from '../../services/catalogService';
import {
  DiagnosticAIService,
  AI_SYMPTOM_KNOWLEDGE_BASE,
  AISymptomMapping
} from '../../services/diagnosticAIService';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LabMedixLogo } from '../../components/common/LabMedixLogo';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PatientCardApplicationModal } from '../../components/portal/PatientCardApplicationModal';
import { ApplicationStatusTrackModal } from '../../components/portal/ApplicationStatusTrackModal';
import { DirectLabAndPackageBookingModal } from '../../components/portal/DirectLabAndPackageBookingModal';
import { AIVirtualHealthAssistantWidget } from '../../components/website/AIVirtualHealthAssistantWidget';
import { CardholderAuthModal } from '../../components/portal/CardholderAuthModal';
import { Patient, Membership } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import {
  Shield,
  ShieldCheck,
  CreditCard,
  HeartPulse,
  Activity,
  TestTube,
  Package,
  Stethoscope,
  Phone,
  Clock,
  Sparkles,
  Zap,
  ChevronRight,
  Star,
  CheckCircle2,
  Lock,
  Crown,
  Edit,
  ArrowRight,
  Truck,
  Flame,
  Award,
  Globe,
  MapPin,
  Mail,
  User,
  LogIn,
  Check,
  Search,
  ExternalLink,
  Layers,
  HelpCircle,
  Eye,
  Bot,
  BrainCircuit,
  FileSpreadsheet,
  FileText,
  Sliders,
  DollarSign,
  AlertCircle,
  Thermometer,
  RotateCcw,
  Menu,
  X,
  QrCode,
  Microscope,
  Building2,
  Calendar,
  UserCheck,
  Dna
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isSuperAdmin = currentUser?.role === 'super_admin';

  // CMS Configuration State
  const [cmsConfig, setCmsConfig] = useState<WebsiteCMSConfig>(() => WebsiteService.getWebsiteConfig());
  const [healthPackages, setHealthPackages] = useState<HealthPackageItem[]>(() => CatalogService.getHealthPackages());
  const [labTests, setLabTests] = useState<LabTestItem[]>(() => CatalogService.getLabTests());

  // Interactive Modals
  const [isCardAppModalOpen, setIsCardAppModalOpen] = useState(false);
  const [selectedTierForApp, setSelectedTierForApp] = useState<string>('Gold');
  const [isLabBookingModalOpen, setIsLabBookingModalOpen] = useState(false);
  const [isCardholderAuthModalOpen, setIsCardholderAuthModalOpen] = useState(false);
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState<'login' | 'signup' | 'track'>('login');
  const [isTrackStatusModalOpen, setIsTrackStatusModalOpen] = useState(false);
  const [trackingAppNo, setTrackingAppNo] = useState<string | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-Popup for "Get Health Card" Form on Visitor Landing (Step-by-Step Glowing Modal)
  useEffect(() => {
    const hasDismissed = sessionStorage.getItem('labmedix_auto_card_popup_dismissed');
    if (!hasDismissed) {
      const timer = setTimeout(() => {
        setSelectedTierForApp('Gold');
        setIsCardAppModalOpen(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen to Single Source of Truth Real-Time Data Sync (Central Server Database)
  useEffect(() => {
    const handleSync = () => {
      setCmsConfig(WebsiteService.getWebsiteConfig());
      setHealthPackages(CatalogService.getHealthPackages());
      setLabTests(CatalogService.getLabTests());
    };
    window.addEventListener('labmedix_data_synced', handleSync);
    return () => window.removeEventListener('labmedix_data_synced', handleSync);
  }, []);

  // 3D Card Interactive Tilt State
  const [cardMousePos, setCardMousePos] = useState({ x: 0, y: 0 });
  const [isCardHovered, setIsCardHovered] = useState(false);

  // AI Symptom Evaluator State (Feature 1)
  const [aiSymptomQuery, setAiSymptomQuery] = useState('');
  const [activeSymptomKey, setActiveSymptomKey] = useState<string>('fever_infection');

  // AI Card Savings Calculator State (Feature 2)
  const [calcFamilyMembers, setCalcFamilyMembers] = useState<number>(4);
  const [calcMonthlySpend, setCalcMonthlySpend] = useState<number>(5000);
  const [calcChronicRisk, setCalcChronicRisk] = useState<string>('diabetes');

  // Active AI Symptom Object
  const currentAiSymptom = useMemo(() => {
    return AI_SYMPTOM_KNOWLEDGE_BASE.find(s => s.symptomKey === activeSymptomKey) || AI_SYMPTOM_KNOWLEDGE_BASE[0];
  }, [activeSymptomKey]);

  // AI Recommended Card Tier Calculation
  const recommendedCardCalculation = useMemo(() => {
    const annualSpend = calcMonthlySpend * 12;
    let idealTier: 'Silver' | 'Gold' | 'Platinum' | 'VIP' = 'Gold';
    let discountPct = 25;
    let annualFee = 999;

    if (calcFamilyMembers >= 7 || annualSpend >= 100000) {
      idealTier = 'VIP';
      discountPct = 50;
      annualFee = 4999;
    } else if (calcFamilyMembers >= 5 || annualSpend >= 60000 || calcChronicRisk === 'surgery_senior') {
      idealTier = 'Platinum';
      discountPct = 35;
      annualFee = 1999;
    } else if (calcFamilyMembers >= 3 || annualSpend >= 30000 || calcChronicRisk === 'diabetes') {
      idealTier = 'Gold';
      discountPct = 25;
      annualFee = 999;
    } else {
      idealTier = 'Silver';
      discountPct = 15;
      annualFee = 499;
    }

    const estimatedSavings = Math.round(annualSpend * (discountPct / 100)) - annualFee;
    const netSavings = estimatedSavings > 0 ? estimatedSavings : 5000;

    return {
      idealTier,
      discountPct,
      annualFee,
      netSavings,
      annualSpend
    };
  }, [calcFamilyMembers, calcMonthlySpend, calcChronicRisk]);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -30;
    setCardMousePos({ x, y });
  };

  const handleCardMouseLeave = () => {
    setIsCardHovered(false);
    setCardMousePos({ x: 0, y: 0 });
  };

  const handleCardTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 25;
      const y = ((touch.clientY - rect.top) / rect.height - 0.5) * -25;
      setIsCardHovered(true);
      setCardMousePos({ x, y });
    }
  };

  const handleCardTouchEnd = () => {
    setIsCardHovered(false);
    setCardMousePos({ x: 0, y: 0 });
  };

  const handleSectionScroll = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Mock guest patient and membership for direct booking
  const guestPatient: Patient = useMemo(() => {
    const existing = StorageService.getPatients();
    if (existing && existing.length > 0) return existing[0];
    return {
      id: 'PUBLIC-GUEST-01',
      patientNo: 'GUEST-ONLINE',
      fullName: 'Online Public Patient',
      phone: '01700000000',
      mobile: '01700000000',
      email: 'guest@labmedix.health',
      dob: '1990-01-01',
      age: 36,
      gender: 'male',
      address: 'Dhaka, Bangladesh',
      bloodGroup: 'O+',
      status: 'active',
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emergencyContact: { name: 'Emergency Support', phone: '10666', relation: 'Care Desk' },
      medicalInfo: { allergies: [], chronicConditions: [] }
    } as unknown as Patient;
  }, []);

  const guestMembership: Membership = useMemo(() => {
    const existing = StorageService.getMemberships();
    if (existing && existing.length > 0) return existing[0];
    return {
      id: 'MEM-GOLD-DEFAULT',
      name: 'Gold Executive Shield',
      tier: 'Gold',
      fee: 999,
      validityDays: 365,
      validityMonths: 12,
      discountPercentage: 25,
      cashbackPercentage: 5,
      maxFamilyMembers: 4,
      freeDelivery: true,
      emergencyAssistance: true,
      colorTheme: 'from-amber-600 via-yellow-700 to-amber-950',
      status: 'active',
      createdAt: new Date().toISOString()
    } as unknown as Membership;
  }, []);

  return (
    <div className="min-h-screen text-slate-100 font-sans overflow-x-hidden relative" style={{background:'linear-gradient(180deg, #060d1f 0%, #0a1628 40%, #060d1f 100%)'}}>
      {/* 1. TOP ULTRA GLOWING ANNOUNCEMENT TICKER */}
      <div className="relative overflow-hidden border-b border-blue-900/60 text-xs py-2 px-4 shadow-lg z-40" style={{background:'linear-gradient(90deg,#04091a,#0a1628,#04091a)'}}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase font-mono animate-pulse shadow-sm tracking-wider shrink-0" style={{background:'linear-gradient(90deg,#15803d,#16a34a)',color:'#fff',boxShadow:'0 0 12px rgba(21,128,61,0.4)'}}>
              ⚡ OFFICIAL NETWORK
            </span>
            <span className="text-[11px] font-semibold text-blue-200 truncate">
              {cmsConfig.announcementTicker}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
            <Link
              to="/portal"
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-black text-[10px] tracking-wide hover:scale-105 transition-all shadow-md" style={{background:'linear-gradient(90deg,#15803d,#16a34a)',color:'#fff',boxShadow:'0 0 14px rgba(21,128,61,0.4)'}}
            >
              <Sparkles className="w-3 h-3 text-green-200 animate-pulse" />
              <span>CARD LOGIN / SIGN UP →</span>
            </Link>

            <div className="hidden md:flex items-center gap-3">
              <span>•</span>
              <a
                href={`tel:${cmsConfig.emergencyHotline}`}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>24/7 Helpline: {cmsConfig.emergencyHotline}</span>
              </a>
              <span>•</span>
              <a
                href={`tel:${cmsConfig.ambulanceHelpline}`}
                className="text-rose-400 hover:text-rose-300 font-bold transition-colors"
              >
                🚑 Ambulance: {cmsConfig.ambulanceHelpline}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HIGH-GRAPHIC 3D MAIN HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur-2xl border-b transition-all" style={{background:'rgba(6,13,31,0.92)',borderColor:'rgba(30,58,138,0.35)',boxShadow:'0 4px 30px rgba(30,58,138,0.15)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo with Glowing Shield */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 rounded-2xl p-0.5 shadow-lg transition-all group-hover:scale-105 flex items-center justify-center" style={{background:'linear-gradient(135deg,#15803d,#1e3a8a)',boxShadow:'0 0 20px rgba(21,128,61,0.35)'}}>
              <ShieldCheck className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight group-hover:text-green-400 transition-colors" style={{background:'linear-gradient(90deg,#22c55e,#60a5fa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                  LABMEDIX
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase font-mono" style={{background:'rgba(21,128,61,0.2)',color:'#4ade80',border:'1px solid rgba(21,128,61,0.4)'}}>
                  HEALTH
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block">
                AUTO HEALTH CARD & DIAGNOSTICS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Clean & Non-Duplicated) */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-300">
            <a href="#ai-symptom-checker" onClick={handleSectionScroll('ai-symptom-checker')} className="transition-colors flex items-center gap-1.5" style={{color:'#4ade80'}}>
              <BrainCircuit className="w-3.5 h-3.5 animate-pulse" style={{color:'#818cf8'}} />
              <span>AI Symptom Checker</span>
            </a>
            <a href="#health-cards" onClick={handleSectionScroll('health-cards')} className="hover:text-green-400 transition-colors flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" style={{color:'#60a5fa'}} />
              <span>3D Health Cards</span>
            </a>
            <a href="#ai-savings-calculator" onClick={handleSectionScroll('ai-savings-calculator')} className="hover:text-green-400 transition-colors flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-green-400" />
              <span>Savings Calculator</span>
            </a>
            <a href="#packages" onClick={handleSectionScroll('packages')} className="hover:text-green-400 transition-colors flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" style={{color:'#f59e0b'}} />
              <span>Health Packages</span>
            </a>
            <a href="#specialties" onClick={handleSectionScroll('specialties')} className="hover:text-green-400 transition-colors flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" style={{color:'#60a5fa'}} />
              <span>Telemedicine</span>
            </a>
            <Link to="/verify" className="hover:text-green-400 transition-colors flex items-center gap-1.5 text-slate-300">
              <QrCode className="w-3.5 h-3.5 text-green-400" />
              <span>Verify Card</span>
            </Link>
          </nav>

          {/* Action Hub */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* UNIFIED ULTRA-STRONG CARDHOLDER & PATIENT PORTAL ENTRY POINT */}
            <Link to="/portal">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs text-white transition-all hover:scale-105 shadow-xl"
                style={{background:'linear-gradient(135deg,#15803d,#16a34a)',boxShadow:'0 0 20px rgba(21,128,61,0.4)',border:'1px solid rgba(74,222,128,0.3)'}}
              >
                <HeartPulse className="w-4 h-4 text-green-200 animate-pulse shrink-0" />
                <span>CARD LOGIN / SIGN UP</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono" style={{background:'rgba(0,0,0,0.4)',color:'#4ade80',border:'1px solid rgba(74,222,128,0.4)'}}>
                  RECOMMENDED
                </span>
              </button>
            </Link>

            {/* Staff / Admin Operational Login */}
            <Link to={isAuthenticated ? "/dashboard" : "/login"}>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-800 hover:border-slate-600 bg-slate-900/80 text-slate-300 hover:text-white font-bold text-xs transition-all px-3"
                leftIcon={isAuthenticated ? <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> : <LogIn className="w-3.5 h-3.5 text-slate-400" />}
              >
                {isAuthenticated ? 'Staff Dashboard' : 'Staff Login'}
              </Button>
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-700 text-teal-400 hover:text-white transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Drawer Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 p-4 space-y-3 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top-2 duration-200">
            {/* Unified Top Recommended Portal in Mobile Drawer */}
            <Link
              to="/portal"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3.5 rounded-2xl font-black text-sm flex items-center justify-between shadow-xl text-white"
              style={{background:'linear-gradient(135deg,#15803d,#1e3a8a)',boxShadow:'0 0 24px rgba(21,128,61,0.35)',border:'1px solid rgba(74,222,128,0.25)'}}
            >
              <div className="flex items-center gap-2.5">
                <HeartPulse className="w-5 h-5 text-green-300 animate-pulse" />
                <span>CARD LOGIN / SIGN UP</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono" style={{background:'rgba(0,0,0,0.5)',color:'#4ade80',border:'1px solid rgba(74,222,128,0.4)'}}>
                RECOMMENDED
              </span>
            </Link>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <a
                href="#ai-symptom-checker"
                onClick={handleSectionScroll('ai-symptom-checker')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-teal-300 hover:bg-teal-950/60"
              >
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span>AI Symptom Checker</span>
              </a>
              <a
                href="#health-cards"
                onClick={handleSectionScroll('health-cards')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-200 hover:bg-teal-950/60"
              >
                <CreditCard className="w-4 h-4 text-teal-400" />
                <span>3D Health Cards</span>
              </a>
              <a
                href="#ai-savings-calculator"
                onClick={handleSectionScroll('ai-savings-calculator')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-emerald-300 hover:bg-teal-950/60"
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Savings Calculator</span>
              </a>
              <a
                href="#packages"
                onClick={handleSectionScroll('packages')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-amber-300 hover:bg-teal-950/60"
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span>Health Packages</span>
              </a>
              <a
                href="#specialties"
                onClick={handleSectionScroll('specialties')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-blue-300 hover:bg-teal-950/60"
              >
                <Stethoscope className="w-4 h-4 text-blue-400" />
                <span>Telemedicine</span>
              </a>
              <Link
                to="/verify"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-emerald-300 hover:bg-teal-950/60"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Verify Card</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 text-xs font-black"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setSelectedTierForApp('Gold');
                  setIsCardAppModalOpen(true);
                }}
              >
                🎁 Apply for Digital Health Card
              </Button>

              <Link to={isAuthenticated ? "/dashboard" : "/login"} onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full border-slate-700 text-slate-300 text-xs font-bold"
                  leftIcon={isAuthenticated ? <ShieldCheck className="w-4 h-4 text-teal-400" /> : <LogIn className="w-4 h-4 text-teal-400" />}
                >
                  {isAuthenticated ? 'Staff Dashboard' : 'Staff Operational Login'}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION WITH 3D HOLOGRAPHIC ROTATING CARD */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Futuristic Cyber Light Orbs & Mesh Background */}
        <div className="absolute top-1/4 left-1/4 w-[700px] h-[500px] rounded-full blur-[160px] pointer-events-none" style={{background:'radial-gradient(ellipse,rgba(30,58,138,0.25),transparent 70%)'}} />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none" style={{background:'radial-gradient(ellipse,rgba(21,128,61,0.18),transparent 70%)'}} />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full blur-[130px] pointer-events-none" style={{background:'radial-gradient(ellipse,rgba(220,38,38,0.10),transparent 70%)'}} />
        <div className="absolute inset-0 grid-mesh opacity-40 pointer-events-none" style={{maskImage:'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)'}} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* LEFT HERO TEXT & CTAS */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Accreditation Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold shadow-lg" style={{background:'linear-gradient(90deg,rgba(30,58,138,0.25),rgba(21,128,61,0.20))',border:'1px solid rgba(74,222,128,0.35)',color:'#4ade80',boxShadow:'0 0 20px rgba(21,128,61,0.15)'}}>
                <Building2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>NABL ACCREDITED DIAGNOSTIC CENTRE & MULTI-SPECIALITY OUTDOOR</span>
              </div>

              {/* Main Headline with Theme Glow */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
                Labmedix Multi-Speciality <span className="text-brand-gradient">Outdoor & Diagnosis Centre</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                West Bengal’s trusted medical destination — combining 50+ senior outdoor specialist consultants, fully automated NABL pathology, 32-slice high-speed CT scan, 3D/4D USG color doppler, 24/7 ICU ambulance, and Universal Health Cards with up to 50% flat cashless discounts.
              </p>

              {/* CTAs & Quick Triggers */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  className="w-full sm:w-auto flex items-center justify-center gap-2 font-black text-sm px-8 py-4 rounded-2xl text-white transition-all hover:scale-[1.03] shadow-xl"
                  style={{background:'linear-gradient(135deg,#15803d,#16a34a)',boxShadow:'0 0 30px rgba(21,128,61,0.4)',border:'1px solid rgba(74,222,128,0.3)'}}
                  onClick={() => {
                    setSelectedTierForApp('Gold');
                    setIsCardAppModalOpen(true);
                  }}
                >
                  Apply for Digital Health Card
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-slate-200 hover:text-white text-sm px-6 py-4 rounded-2xl backdrop-blur-md transition-all font-bold"
                  style={{border:'1px solid rgba(30,58,138,0.5)',background:'rgba(30,58,138,0.10)'}}
                  onClick={() => setIsLabBookingModalOpen(true)}
                >
                  <Search className="w-4 h-4 text-blue-400" />
                  Book Outdoor OPD / Lab Test
                </button>
              </div>

              {/* Key Trust Signals Strip */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>NABL ISO 9001:2015 Certified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>50+ Senior Outdoor Consultants</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Flat 15% - 50% Health Card Savings</span>
                </div>
              </div>
            </div>

            {/* RIGHT 3D INTERACTIVE HOLOGRAPHIC CR80 HEALTH CARD */}
            <div className="lg:col-span-5 flex justify-center perspective-[1000px]">
              <div
                onMouseMove={handleCardMouseMove}
                onMouseEnter={() => setIsCardHovered(true)}
                onMouseLeave={handleCardMouseLeave}
                onTouchMove={handleCardTouchMove}
                onTouchEnd={handleCardTouchEnd}
                style={{
                  transform: isCardHovered
                    ? `rotateY(${cardMousePos.x}deg) rotateX(${cardMousePos.y}deg) scale(1.04)`
                    : 'rotateY(-12deg) rotateX(10deg)',
                  transition: isCardHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-in-out'
                }}
                className="relative w-full max-w-[390px] h-[240px] rounded-[24px] p-6 text-white shadow-2xl transition-all cursor-pointer select-none overflow-hidden border-2 border-amber-400/60 bg-gradient-to-br from-amber-600 via-yellow-700 to-amber-950 group"
              >
                {/* Holographic Sheen & Chip Visual */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
                <div className="absolute -right-20 -bottom-20 w-48 h-48 rounded-full bg-amber-400/30 blur-2xl pointer-events-none" />

                {/* Top Card Bar */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-950/80 border border-amber-400/50 flex items-center justify-center shadow-md">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <strong className="text-xs font-black tracking-wider block">LABMEDIX HEALTH SHIELD</strong>
                      <span className="text-[9px] text-amber-200 font-mono tracking-widest">GOLD EXECUTIVE TIER</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/50 text-amber-300 border border-amber-400/50">
                    NFC • 25% OFF
                  </span>
                </div>

                {/* Microchip & Contactless Waves Visual */}
                <div className="flex items-center gap-3 my-4 relative z-10">
                  <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-amber-200 to-yellow-600 border border-yellow-300 shadow-md flex items-center justify-center p-1">
                    <div className="w-full h-full border border-amber-800/40 rounded flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-900/40" />
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-amber-200/90 tracking-wider font-bold">
                    ))) CONTACTLESS DUAL-CHIP SMART CARD
                  </span>
                </div>

                {/* Cardholder Number & Name */}
                <div className="space-y-1 relative z-10">
                  <div className="text-base font-mono font-black tracking-[0.2em] text-amber-100 text-shadow">
                    LMX • 8820 • 9012 • 4401
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-white uppercase tracking-wider">DR. RAHAT HOSSAIN</span>
                    <span className="text-amber-200 font-bold">EXP: 12/2029</span>
                  </div>
                </div>

                {/* 3D Hint Pill */}
                <div className="absolute bottom-2 right-3 text-[8.5px] font-mono text-amber-300/90 flex items-center gap-1 font-bold">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>3D Tilt Interactive</span>
                </div>
              </div>
            </div>
          </div>

          {/* COUNTER STATS STRIP */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-900/90 border border-blue-900/40 shadow-2xl">
            <div className="text-center space-y-1 border-r border-slate-800 last:border-r-0">
              <strong className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono block">50+</strong>
              <span className="text-[11px] text-slate-300 font-bold block">Senior Outdoor Consultants</span>
              <span className="text-[9px] text-slate-500 font-mono block">Morning & Evening OPD</span>
            </div>
            <div className="text-center space-y-1 border-r border-slate-800 last:border-r-0">
              <strong className="text-2xl sm:text-3xl font-black text-blue-400 font-mono block">350+</strong>
              <span className="text-[11px] text-slate-300 font-bold block">NABL Lab Tests & Radiology</span>
              <span className="text-[9px] text-slate-500 font-mono block">CT, USG, Digital X-Ray, Blood</span>
            </div>
            <div className="text-center space-y-1 border-r border-slate-800 last:border-r-0">
              <strong className="text-2xl sm:text-3xl font-black text-amber-400 font-mono block">2,50,000+</strong>
              <span className="text-[11px] text-slate-300 font-bold block">Health Cardholders</span>
              <span className="text-[9px] text-slate-500 font-mono block">Cashless Discount Shield</span>
            </div>
            <div className="text-center space-y-1">
              <strong className="text-2xl sm:text-3xl font-black text-rose-400 font-mono block">30 Mins</strong>
              <span className="text-[11px] text-slate-300 font-bold block">Home Sample Collection</span>
              <span className="text-[9px] text-slate-500 font-mono block">24x7 Certified Phlebotomy</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3.1. MULTI-SPECIALITY OUTDOOR OPD CLINIC SECTION */}
      <section id="outdoor-opd" className="py-16 bg-slate-950/90 border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-blue-500/10 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 w-fit">
                <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                <span>MULTI-SPECIALITY OUTDOOR CLINIC</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Senior Visiting Consultants & Outdoor OPD
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Consult Kolkata's renowned senior professors & medical college doctors. Health cardholders get flat 20%-30% discount on OPD ticket fees.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-blue-900/40 text-xs font-mono shrink-0">
              <span className="text-amber-400 font-bold block">🕒 OPD Clinic Operating Hours:</span>
              <span className="text-slate-300 block">Morning: 8:00 AM - 2:00 PM</span>
              <span className="text-slate-300 block">Evening: 4:00 PM - 8:30 PM</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'General Medicine & Diabetology', docs: '8 Specialists', icon: '🩺', fee: '₹400 - ₹600', timing: 'Daily 8:00 AM - 8:00 PM', tests: 'HbA1c, Fasting Sugar, Lipid' },
              { title: 'Cardiology & Echocardiography', docs: '6 Consultants', icon: '🫀', fee: '₹600 - ₹900', timing: 'Mon, Wed, Fri, Sat', tests: 'ECG, 2D ECHO, TMT Stress' },
              { title: 'Orthopaedics & Spine Care', docs: '5 Surgeons', icon: '🦴', fee: '₹500 - ₹800', timing: 'Tue, Thu, Sat, Sun', tests: 'Digital X-Ray, Bone Density' },
              { title: 'Gynaecology & Obstetrics', docs: '6 Specialists', icon: '🤰', fee: '₹500 - ₹800', timing: 'Daily Morning & Evening', tests: 'USG 3D/4D, Pap Smear' },
              { title: 'Paediatrics & Child Health', docs: '4 Doctors', icon: '👶', fee: '₹400 - ₹600', timing: 'Daily Morning OPD', tests: 'Vaccination & Growth Chart' },
              { title: 'Neurology & Brain Care', docs: '3 Consultants', icon: '🧠', fee: '₹700 - ₹1000', timing: 'Wed, Sat 5:00 PM', tests: 'CT Scan Brain, NCV, EEG' },
              { title: 'Gastroenterology & Liver', docs: '4 Doctors', icon: '🧪', fee: '₹600 - ₹900', timing: 'Tue, Fri Evening', tests: 'LFT, Endoscopy, USG Abdomen' },
              { title: 'Ophthalmology & ENT Specialist', docs: '5 Doctors', icon: '👁️', fee: '₹400 - ₹600', timing: 'Daily Evening OPD', tests: 'Vision Check, Audiometry' }
            ].map((dept, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-3 group shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{dept.icon}</span>
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {dept.docs}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">
                    {dept.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                    <div>Fees: <strong className="text-emerald-400">{dept.fee}</strong></div>
                    <div>Timing: {dept.timing}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                    Key Tests: <span className="text-slate-300">{dept.tests}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-500/40 text-blue-300 hover:bg-blue-950/40 text-xs font-bold mt-2"
                  onClick={() => setIsLabBookingModalOpen(true)}
                >
                  Book Outdoor OPD Token
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.2. ADVANCED DIAGNOSTIC & RADIOLOGY CENTRE */}
      <section id="diagnostic-centre" className="py-16 border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-teal-500/10 text-teal-300 border border-teal-500/30 flex items-center gap-1.5 w-fit mx-auto">
              <Microscope className="w-3.5 h-3.5 text-teal-400" />
              <span>ADVANCED RADIOLOGY & NABL PATHOLOGY</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              High-Precision Diagnostic & Imaging Centre
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Equipped with fully automated European & Japanese analyzers for 100% accurate, certified diagnostic reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: '32-Slice High-Speed CT Scan',
                badge: 'RADIOLOGY',
                desc: 'Ultra-low radiation high resolution Brain, HRCT Chest, Abdomen, Bone & CT Angiography scans.',
                perks: ['Same-day film & digital CD', 'Radiologist official sign-off', '24/7 Emergency CT Scan']
              },
              {
                title: '3D / 4D Color Doppler USG',
                badge: 'ULTRASONOGRAPHY',
                desc: 'High frequency abdominal, anomaly, pelvic, follicular monitoring & peripheral vascular Doppler.',
                perks: ['Senior Radiologist conducted', '3D Anomaly Pregnancy scan', 'Instant color report']
              },
              {
                title: 'Automated NABL Pathology Lab',
                badge: 'PATHOLOGY',
                desc: 'Sysmex & Roche fully automated analyzers for CBC, Liver, Kidney, Thyroid, Hormones & Tumor Markers.',
                perks: ['NABL Certified Lab', 'Barcode sample tracking', '4-Hour WhatsApp report']
              },
              {
                title: 'Digital X-Ray & Mammography',
                badge: 'IMAGING',
                desc: 'High clarity CR digital radiography for chest, spine, joints, and specialized Contrast studies.',
                perks: ['Instant digital film', 'Low radiation dose', 'Contrast X-Ray facility']
              },
              {
                title: '2D ECHO, TMT & 12-Lead ECG',
                badge: 'CARDIOLOGY',
                desc: 'Complete cardiac evaluation suite with Echocardiography, Treadmill Stress Test & 24-Hour Holter.',
                perks: ['Cardiologist certified', 'TMT Stress evaluation', '24-Hour Holter monitor']
              },
              {
                title: '24/7 Home Sample Collection',
                badge: 'DOORSTEP CARE',
                desc: 'Certified phlebotomists collect blood & urine samples right from your bedroom with zero hassle.',
                perks: ['GPS Phlebotomist tracking', 'Cold-chain sample transport', 'Free with Health Card']
              }
            ].map((facility, fIdx) => (
              <div key={fIdx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition-all space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {facility.badge}
                  </span>
                  <h3 className="text-base font-black text-white">{facility.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{facility.desc}</p>

                  <ul className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                    {facility.perks.map((p, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-black text-xs shadow-md mt-2"
                  onClick={() => setIsLabBookingModalOpen(true)}
                >
                  Book {facility.badge} Test
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 🤖 AI FEATURE 1: AI DIAGNOSTIC SYMPTOM CHECKER & HEALTH RISK EVALUATOR */}
      <section id="ai-symptom-checker" className="py-16 border-t relative" style={{borderColor:'rgba(30,58,138,0.25)',background:'linear-gradient(180deg,#060d1f,#0d1527,#060d1f)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase flex items-center gap-1.5 w-fit mx-auto shadow-md" style={{background:'rgba(88,28,135,0.25)',color:'#c084fc',border:'1px solid rgba(167,139,250,0.4)'}}>
              <BrainCircuit className="w-3.5 h-3.5 animate-pulse" style={{color:'#a78bfa'}} />
              <span>AI CLINICAL PROTOCOL ENGINE</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              AI Diagnostic Symptom Checker & Test Suggester
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Select your symptoms below to get an instant clinical risk evaluation, recommended laboratory tests, and preparation guidelines.
            </p>
          </div>

          {/* Symptom Quick Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto">
            {AI_SYMPTOM_KNOWLEDGE_BASE.map((sym) => (
              <button
                key={sym.symptomKey}
                type="button"
                onClick={() => setActiveSymptomKey(sym.symptomKey)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg`}
                style={activeSymptomKey === sym.symptomKey ? {background:'linear-gradient(135deg,#15803d,#1e3a8a)',color:'#fff',boxShadow:'0 0 16px rgba(21,128,61,0.35)',border:'1px solid rgba(74,222,128,0.3)',scale:'1.05'} : {background:'rgba(10,22,40,0.8)',color:'#cbd5e1',border:'1px solid rgba(30,58,138,0.3)'}}
              >
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>{sym.label}</span>
              </button>
            ))}
          </div>

          {/* Active AI Diagnostic Evaluation Board */}
          <div className="p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6" style={{background:'linear-gradient(135deg,rgba(10,22,40,0.95),rgba(14,30,60,0.90))',border:'1px solid rgba(30,58,138,0.45)',boxShadow:'0 0 40px rgba(30,58,138,0.15)'}}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-teal-500/30 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    {currentAiSymptom.organSystem}
                  </span>
                  <span className="text-xs text-purple-300 font-mono font-bold">
                    Target Package: {currentAiSymptom.suggestedPackageName}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">
                  Clinical AI Protocol: {currentAiSymptom.label}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-4xl pt-1">
                  <strong>Clinical Rationale:</strong> {currentAiSymptom.clinicalRationale}
                </p>
              </div>

              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-white text-xs shadow-lg transition-all hover:scale-105"
                style={{background:'linear-gradient(135deg,#15803d,#16a34a)',boxShadow:'0 0 16px rgba(21,128,61,0.35)'}}
                onClick={() => setIsLabBookingModalOpen(true)}
              >
                <Sparkles className="w-4 h-4 text-green-200" />
                Book Recommended AI Package (45% OFF)
              </button>
            </div>

            {/* Recommended Tests Grid */}
            <div className="space-y-3">
              <strong className="text-sm font-black text-white flex items-center gap-2">
                <TestTube className="w-4 h-4 text-teal-400" />
                Must-Do Laboratory Investigations ({currentAiSymptom.detailedTests.length} Tests):
              </strong>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentAiSymptom.detailedTests.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-teal-500/30 flex flex-col justify-between space-y-2 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <strong className="text-xs font-black text-white">{t.name}</strong>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        t.priority === 'must_do_urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {t.priority === 'must_do_urgent' ? '🔴 STAT' : '🟡 SECONDARY'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-tight">
                      {t.indication}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                      <span>Tube: <strong className="text-teal-300">{t.sampleTube}</strong></span>
                      <span className={t.fasting ? 'text-rose-300 font-bold' : 'text-emerald-300'}>
                        {t.fasting ? '⚠️ Fasting' : '🌿 Routine'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fasting and Phlebotomy Instruction Strip */}
            <div className="p-4 rounded-2xl bg-black/60 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-amber-300 font-bold block">
                  ⚠️ Patient Preparation & Fasting Guidelines:
                </span>
                <span className="text-slate-300 text-[11px]">
                  {currentAiSymptom.fastingGuidelines}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-500/40 text-teal-300 text-xs font-bold"
                  onClick={() => setIsLabBookingModalOpen(true)}
                >
                  Book Diagnostic Tests
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 🧮 AI FEATURE 2: AI SMART HEALTH CARD SAVINGS CALCULATOR */}
      <section id="ai-savings-calculator" className="py-16 border-t relative" style={{borderColor:'rgba(21,128,61,0.20)',background:'linear-gradient(180deg,#0a1628,#060d1f)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 w-fit mx-auto shadow-md">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI ANNUAL SAVINGS CALCULATOR</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Calculate Your Family’s Annual Medical Savings
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              See how much you save on diagnostic tests, doctor visits, and medications with our 3D Health Cards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Input Sliders & Selectors */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 shadow-xl">
              {/* Slider 1: Family Members */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-300">Family Members to Cover:</label>
                  <strong className="text-teal-400 font-mono text-sm">{calcFamilyMembers} Members</strong>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={calcFamilyMembers}
                  onChange={(e) => setCalcFamilyMembers(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 (Individual)</span>
                  <span>4 (Nuclear Family)</span>
                  <span>10 (Joint Family)</span>
                </div>
              </div>

              {/* Slider 2: Monthly Spend */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-300">Estimated Monthly Diagnostic & Health Spend:</label>
                  <strong className="text-emerald-400 font-mono text-sm">₹{calcMonthlySpend.toLocaleString('en-IN')} / Month</strong>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={25000}
                  step={500}
                  value={calcMonthlySpend}
                  onChange={(e) => setCalcMonthlySpend(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>₹1,000 (Routine)</span>
                  <span>₹10,000 (Chronic/Elderly)</span>
                  <span>₹25,000 (Critical)</span>
                </div>
              </div>

              {/* Selector: Risk Profile */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 text-xs block">Family Clinical Health Profile:</label>
                <select
                  value={calcChronicRisk}
                  onChange={(e) => setCalcChronicRisk(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500 font-bold"
                >
                  <option value="routine">Routine Preventive Care & Wellness</option>
                  <option value="diabetes">Diabetes Mellitus / Thyroid / Hypertension Care</option>
                  <option value="surgery_senior">Senior Citizen Parents & Cardiac Monitoring</option>
                  <option value="high_risk">Comprehensive Critical Care & Frequent Testing</option>
                </select>
              </div>
            </div>

            {/* Live AI Recommendation Card Result */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-teal-950/80 via-slate-900 to-amber-950/60 border-2 border-teal-400/60 shadow-2xl text-center space-y-5">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-teal-500 text-slate-950 shadow-md">
                🏆 AI RECOMMENDED HEALTH CARD
              </span>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">
                  {recommendedCardCalculation.idealTier} Health Shield
                </h3>
                <span className="text-xs text-teal-300 font-mono font-bold block">
                  Flat {recommendedCardCalculation.discountPct}% Cashless Discount
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-teal-500/40 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated Net Annual Family Savings:</span>
                <strong className="text-3xl font-black text-emerald-400 font-mono block">
                  ₹{recommendedCardCalculation.netSavings.toLocaleString('en-IN')}
                </strong>
                <span className="text-[10px] text-slate-400 block font-mono">
                  (After deducting ₹{recommendedCardCalculation.annualFee} annual membership)
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-600 text-slate-950 font-black text-xs shadow-xl shadow-teal-500/30 hover:scale-105 transition-all"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => {
                  setSelectedTierForApp(recommendedCardCalculation.idealTier);
                  setIsCardAppModalOpen(true);
                }}
              >
                Apply for {recommendedCardCalculation.idealTier} Shield
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 3D HEALTH CARD TIERS SHOWCASE */}
      <section id="health-cards" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-teal-500/10 text-teal-300 border border-teal-500/30">
              💳 DUAL-CHIP CR80 SMART HEALTH CARDS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Choose Your Family Health Protection Shield
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              One smart health card unlocks massive cashless pathology discounts, home sample collection, and doctor telemedicine for your entire household.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(cmsConfig?.cardTiers || []).map((tier) => (
              <div
                key={tier.id}
                className={`p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group hover:scale-[1.02] shadow-xl ${
                  tier.popular
                    ? 'border-amber-500/60 shadow-amber-500/10 ring-2 ring-amber-500/30'
                    : 'border-slate-800 hover:border-teal-500/50'
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-slate-950 text-[9px] font-black uppercase font-mono px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-slate-950" />
                    MOST POPULAR
                  </div>
                )}

                <div className="space-y-4">
                  {/* Card Visual Pill */}
                  <div className={`h-24 rounded-2xl bg-gradient-to-br ${tier.colorTheme} p-4 border border-white/10 flex flex-col justify-between text-white shadow-lg`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase">LABMEDIX</span>
                      <span className="px-2 py-0.5 rounded text-[8.5px] font-bold bg-black/40 text-white font-mono">
                        {tier.discountPercentage}% OFF
                      </span>
                    </div>
                    <div>
                      <strong className="text-sm font-black tracking-wide block">{tier.name}</strong>
                      <span className="text-[9px] text-slate-300 font-mono">Covers {tier.familyMembersCovered} Family Members</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-0.5 font-mono">
                    <span className="text-[10px] text-slate-400 uppercase">Annual Membership:</span>
                    <div className="flex items-baseline gap-1">
                      <strong className="text-2xl font-black text-white">₹{tier.annualFee}</strong>
                      <span className="text-xs text-slate-400">/ Year</span>
                    </div>
                  </div>

                  {/* Perks List */}
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    {tier.perks.map((perk, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Apply Button */}
                <Button
                  variant="primary"
                  size="sm"
                  className={`w-full py-2.5 rounded-xl font-black text-xs shadow-lg ${
                    tier.popular
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950'
                  }`}
                  onClick={() => {
                    setSelectedTierForApp(tier.tier);
                    setIsCardAppModalOpen(true);
                  }}
                >
                  Apply for {tier.tier} Shield
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CURATED PREVENTIVE HEALTH CHECKUP PACKAGES */}
      <section id="packages" className="py-20 bg-slate-900/40 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                🧬 NABL PATHOLOGY PACKAGES
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Recommended Full-Body Diagnostic Bundles
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Comprehensive disease risk screening with up to 60% savings for LabMedix Cardholders.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:text-white"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => setIsLabBookingModalOpen(true)}
            >
              Browse All 350+ Lab Tests
            </Button>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {healthPackages.slice(0, 3).map((pkg) => {
              const discountPct = pkg.mrp > 0 ? Math.round(((pkg.mrp - pkg.offerPrice) / pkg.mrp) * 100) : 0;

              return (
                <div
                  key={pkg.id}
                  className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-900 text-teal-400 border border-slate-700">
                        {pkg.packageCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        SAVE {discountPct}%
                      </span>
                    </div>

                    <strong className="text-base font-black text-white group-hover:text-teal-400 transition-colors block">
                      {pkg.name}
                    </strong>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {pkg.description}
                    </p>

                    {/* Included Tests Preview */}
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1.5 font-mono">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Included Tests ({pkg.includedTests.length}):
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {pkg.includedTests.slice(0, 3).map((tn, idx) => (
                          <li key={idx} className="truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                            <span className="truncate">{tn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price Strip */}
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 line-through block">MRP: {formatCurrency(pkg.mrp)}</span>
                        <strong className="text-xl font-black text-emerald-400">{formatCurrency(pkg.offerPrice)}</strong>
                      </div>
                      <span className="text-[10px] text-amber-300 font-bold">
                        {pkg.fastingRequired ? '⚠️ 8-10H Fasting' : '🌿 Routine'}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-black text-xs shadow-md"
                    onClick={() => setIsLabBookingModalOpen(true)}
                  >
                    Book Diagnostic Checkup
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. DOCTOR SPECIALTIES & TELEMEDICINE HUB */}
      <section id="specialties" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-blue-500/10 text-blue-300 border border-blue-500/30">
              🩺 CERTIFIED MEDICAL SPECIALISTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Instant Video Consultations with Expert Doctors
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Consult top doctors from home, receive digital prescription slips with AI clinical notes, and order medicines directly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cmsConfig.specialties.map((spec) => (
              <div
                key={spec.id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-950 text-blue-300 border border-slate-700">
                      {spec.availableDoctorsCount} Doctors Live
                    </span>
                  </div>

                  <div>
                    <strong className="text-base font-black text-white group-hover:text-blue-400 transition-colors block">
                      {spec.name}
                    </strong>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{spec.department}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {spec.description}
                  </p>

                  <div className="flex items-center justify-between font-mono text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Consultation Fee:</span>
                    <strong className="text-emerald-400 font-black">₹{spec.consultationFee}</strong>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-500/40 text-blue-300 hover:bg-blue-950/40 text-xs font-bold"
                  onClick={() => {
                    setSelectedTierForApp('Gold');
                    setIsCardAppModalOpen(true);
                  }}
                >
                  Book Doctor Appointment
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. 24/7 EMERGENCY & AMBULANCE BANNER */}
      <section id="ambulance" className="py-16 bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border-y border-rose-500/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold border border-rose-500/40">
              <Truck className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>24/7 RAPID RESPONSE ICU AMBULANCE</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Medical Emergency? Get Ambulance at Your Doorstep in 30 Mins.
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Equipped with mobile ICU, oxygen support, and certified paramedics. Instant priority dispatch for all LabMedix Health Cardholders.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={`tel:${cmsConfig.ambulanceHelpline}`}
              className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-rose-600/30 hover:scale-105 transition-all"
            >
              <Phone className="w-4 h-4 animate-bounce" />
              <span>Call Emergency: {cmsConfig.ambulanceHelpline}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS & TRUST BADGES */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30">
              ⭐ VERIFIED PATIENT STORIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Trusted by 500,000+ Happy Families
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cmsConfig.testimonials.map((test) => (
              <div key={test.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{test.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-white block">{test.name}</strong>
                    <span className="text-[10px] text-slate-400">{test.location}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-500/20 text-teal-300">
                    {test.cardTier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500 p-1 flex items-center justify-center text-slate-950">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-base font-black text-white">LABMEDIX MULTI-SPECIALITY OUTDOOR & DIAGNOSIS CENTRE</span>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                NABL Accredited Diagnostic Centre & Senior Outdoor OPD Clinic. Delivering 350+ automated blood, urine & radiology diagnostic services with Universal Health Protection Cards.
              </p>
              <div className="text-[11px] font-mono text-slate-500 space-y-1 pt-1">
                <div>📍 Central Medical Hub: Salt Lake Sector V, Kolkata - 700091</div>
                <div>Licence No: WB/KLK/CL-2024/99120 • ISO 9001:2015 Certified</div>
              </div>
            </div>

            <div className="space-y-2">
              <strong className="text-white block uppercase tracking-wider font-mono">Quick Navigation</strong>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li>
                  <Link to="/portal" className="hover:text-teal-300 font-bold text-emerald-400 flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>CARD LOGIN / SIGN UP</span>
                  </Link>
                </li>
                <li>
                  <a href="#health-cards" onClick={handleSectionScroll('health-cards')} className="hover:text-teal-400 font-bold text-teal-300 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>3D Smart Health Cards</span>
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalDefaultTab('login');
                      setIsCardholderAuthModalOpen(true);
                    }}
                    className="hover:text-teal-400 text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Staff Portal Login</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsLabBookingModalOpen(true)}
                    className="hover:text-teal-400 text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <Package className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Book 350+ Lab Tests & Packages</span>
                  </button>
                </li>
                <li>
                  <Link to="/verify" className="hover:text-teal-400 text-slate-300 hover:text-white flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Public QR Verification</span>
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-teal-400 text-slate-400 hover:text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Staff & Operational Console</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <strong className="text-white block uppercase tracking-wider font-mono">Emergency Hotlines</strong>
              <p className="text-xs text-slate-300 font-mono">Helpline: {cmsConfig.emergencyHotline}</p>
              <p className="text-xs text-rose-400 font-mono">Ambulance: {cmsConfig.ambulanceHelpline}</p>
              <p className="text-xs text-slate-300 font-mono">Email: {cmsConfig.supportEmail}</p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono">
            <span>© {new Date().getFullYear()} LABMEDIX Auto Health Card System. All Rights Reserved.</span>
            <div className="flex items-center gap-4">
              <span>NABL ISO 9001:2015</span>
              <span>•</span>
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 12. FLOATING 24/7 AI VIRTUAL HEALTH ASSISTANT CHATBOT */}
      <AIVirtualHealthAssistantWidget
        onOpenCardApplication={(tier) => {
          setSelectedTierForApp(tier || 'Gold');
          setIsCardAppModalOpen(true);
        }}
        onOpenLabBooking={() => setIsLabBookingModalOpen(true)}
        onCallAmbulance={() => {
          window.location.href = `tel:${cmsConfig.ambulanceHelpline}`;
        }}
      />

      {/* 13. FLOATING GLOWING "GET YOUR HEALTH CARD" ACTION BADGE */}
      <div className="fixed bottom-6 left-6 z-40 hidden sm:block animate-bounce duration-1000">
        <button
          type="button"
          onClick={() => {
            setSelectedTierForApp('Gold');
            setIsCardAppModalOpen(true);
          }}
          className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-2xl shadow-amber-400/40 hover:scale-105 transition-all flex items-center gap-2.5 border-2 border-amber-200"
        >
          <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-wider block font-bold text-amber-950 font-mono">
              STEP-BY-STEP APPROVAL
            </span>
            <span className="text-xs font-black">🎁 Apply for Health Card</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 text-[8.5px] font-mono font-black uppercase">
            25% - 50% OFF
          </span>
        </button>
      </div>

      {/* MODALS */}
      {/* 1. Health Card Application Modal (Multi-Step Wizard with Step-by-Step Approval) */}
      {isCardAppModalOpen && (
        <PatientCardApplicationModal
          isOpen={isCardAppModalOpen}
          onClose={() => {
            setIsCardAppModalOpen(false);
            sessionStorage.setItem('labmedix_auto_card_popup_dismissed', 'true');
          }}
          onApplicationComplete={(app) => {
            setIsCardAppModalOpen(false);
            sessionStorage.setItem('labmedix_auto_card_popup_dismissed', 'true');
            showToast('success', 'Application Received', `Your health card application (${app.applicationNo}) has been submitted.`);
          }}
          onOpenStatusTracker={(appNo) => {
            setTrackingAppNo(appNo);
            setIsTrackStatusModalOpen(true);
          }}
        />
      )}

      {/* 2. Application Status Tracker Modal */}
      {isTrackStatusModalOpen && (
        <ApplicationStatusTrackModal
          isOpen={isTrackStatusModalOpen}
          onClose={() => {
            setIsTrackStatusModalOpen(false);
            setTrackingAppNo(undefined);
          }}
          onLoginWithApprovedCard={(patientId) => {
            setIsTrackStatusModalOpen(false);
            navigate(`/portal?login_id=${patientId}`);
          }}
        />
      )}

      {/* 3. Direct Lab Test & Package Booking Modal */}
      {isLabBookingModalOpen && (
        <DirectLabAndPackageBookingModal
          isOpen={isLabBookingModalOpen}
          onClose={() => setIsLabBookingModalOpen(false)}
          patient={guestPatient}
          membership={guestMembership}
          walletBalance={5000}
          onBookingSuccess={() => {
            setIsLabBookingModalOpen(false);
            showToast('success', 'Booking Confirmed', 'Diagnostic booking confirmed.');
          }}
        />
      )}

      {/* 4. Dedicated Cardholder Login / Sign Up Access Modal */}
      {isCardholderAuthModalOpen && (
        <CardholderAuthModal
          isOpen={isCardholderAuthModalOpen}
          onClose={() => setIsCardholderAuthModalOpen(false)}
          defaultTab={authModalDefaultTab}
          onOpenSignUpModal={(tier) => {
            setSelectedTierForApp(tier || 'Gold');
            setIsCardAppModalOpen(true);
          }}
        />
      )}
    </div>
  );
};
