import React, { useState, useEffect } from 'react';
import {
  NgoPartner,
  HealthCamp,
  CampAttendee,
  CharityGrant,
  NgoFundTransaction,
  Patient
} from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  HeartHandshake,
  Building2,
  Tent,
  Receipt,
  Plus,
  Search,
  IndianRupee,
  Users,
  Activity,
  CreditCard,
  Printer,
  Edit,
  CheckCircle2,
  Calendar,
  MapPin,
  Stethoscope,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  Download,
  AlertCircle,
  FileCheck,
  UserCheck
} from 'lucide-react';

import { NgoPartnerModal } from './ngo/NgoPartnerModal';
import { NgoDepositModal } from './ngo/NgoDepositModal';
import { HealthCampModal } from './ngo/HealthCampModal';
import { CampAttendeeModal } from './ngo/CampAttendeeModal';
import { CharityGrantModal } from './ngo/CharityGrantModal';
import { NgoReceiptPrintModal } from './ngo/NgoReceiptPrintModal';
import { CampAttendeePrintSlip } from './ngo/CampAttendeePrintSlip';

export const NgoWelfare: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'camps' | 'grants' | 'ledger'>('overview');

  // State collections
  const [partners, setPartners] = useState<NgoPartner[]>([]);
  const [camps, setCamps] = useState<HealthCamp[]>([]);
  const [attendees, setAttendees] = useState<CampAttendee[]>([]);
  const [grants, setGrants] = useState<CharityGrant[]>([]);
  const [transactions, setTransactions] = useState<NgoFundTransaction[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Selected Camp for drilldown
  const [selectedCampId, setSelectedCampId] = useState<string>('');

  // Modals
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState<NgoPartner | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositPartner, setDepositPartner] = useState<NgoPartner | null>(null);

  const [isCampModalOpen, setIsCampModalOpen] = useState(false);
  const [campToEdit, setCampToEdit] = useState<HealthCamp | null>(null);

  const [isAttendeeModalOpen, setIsAttendeeModalOpen] = useState(false);
  const [attendeeToEdit, setAttendeeToEdit] = useState<CampAttendee | null>(null);

  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

  // Print Modals
  const [printTxn, setPrintTxn] = useState<NgoFundTransaction | null>(null);
  const [printGrant, setPrintGrant] = useState<CharityGrant | null>(null);
  const [printPartner, setPrintPartner] = useState<NgoPartner | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [printAttendee, setPrintAttendee] = useState<CampAttendee | null>(null);
  const [isAttendeePrintOpen, setIsAttendeePrintOpen] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load Data
  const loadAllData = () => {
    setPartners(StorageService.getNgoPartners());
    setCamps(StorageService.getHealthCamps());
    setAttendees(StorageService.getCampAttendees());
    setGrants(StorageService.getCharityGrants());
    setTransactions(StorageService.getNgoFundTransactions());
    setPatients(StorageService.getPatients());
  };

  useEffect(() => {
    loadAllData();
    const handleSync = () => loadAllData();
    window.addEventListener('labmedix_data_synced', handleSync);
    return () => window.removeEventListener('labmedix_data_synced', handleSync);
  }, []);

  // Summary Metrics
  const totalGrantDeposited = partners.reduce((acc, p) => acc + (p.totalGrantDeposited || 0), 0);
  const totalAidDisbursed = partners.reduce((acc, p) => acc + (p.totalAidDisbursed || 0), 0);
  const totalActiveGrantPool = partners.reduce((acc, p) => acc + (p.activeBalance || 0), 0);
  const totalAttendeesScreened = attendees.length;
  const totalFreeCardsIssued = attendees.filter(a => a.healthCardIssued).length;
  const totalCampsConducted = camps.length;

  // Selected Camp object
  const selectedCamp = camps.find(c => c.id === selectedCampId) || camps[0];
  const selectedCampAttendees = attendees.filter(a => a.campId === selectedCamp?.id);

  // ---------------- Handlers ----------------
  const handleSavePartner = (partner: NgoPartner) => {
    const existing = partners.find(p => p.id === partner.id);
    let updated: NgoPartner[];
    if (existing) {
      updated = partners.map(p => (p.id === partner.id ? partner : p));
      showToast('success', 'Partner Updated', 'NGO Partner updated successfully');
    } else {
      updated = [partner, ...partners];
      showToast('success', 'Partner Registered', 'New NGO Partner registered successfully');
    }
    setPartners(updated);
    StorageService.saveNgoPartners(updated);
    setIsPartnerModalOpen(false);
    setPartnerToEdit(null);
  };

  const handleDepositSuccess = (txn: NgoFundTransaction) => {
    StorageService.depositNgoFund(txn);
    loadAllData();
    setIsDepositModalOpen(false);
    setDepositPartner(null);
    showToast('success', 'Grant Recorded', `CSR Grant deposit of ₹${txn.amount.toLocaleString('en-IN')} recorded`);

    // Prompt print
    setPrintTxn(txn);
    setPrintPartner(partners.find(p => p.id === txn.ngoPartnerId) || null);
    setIsPrintModalOpen(true);
  };

  const handleSaveCamp = (camp: HealthCamp) => {
    const existing = camps.find(c => c.id === camp.id);
    let updated: HealthCamp[];
    if (existing) {
      updated = camps.map(c => (c.id === camp.id ? camp : c));
      showToast('success', 'Camp Updated', 'Health Camp updated successfully');
    } else {
      updated = [camp, ...camps];
      showToast('success', 'Camp Scheduled', 'New Rural Health Camp scheduled successfully');
    }
    setCamps(updated);
    StorageService.saveHealthCamps(updated);
    setIsCampModalOpen(false);
    setCampToEdit(null);
  };

  const handleSaveAttendee = (attendee: CampAttendee, shouldCreateCard: boolean) => {
    StorageService.saveOrUpdateCampAttendee(attendee);

    // If co-branded card should be issued, also create a patient & card in main storage
    if (shouldCreateCard && selectedCamp) {
      const newPatient: Patient = {
        id: `pat_ngo_${Date.now()}`,
        fullName: attendee.fullName,
        dob: '1985-01-01',
        age: attendee.age,
        gender: attendee.gender,
        mobile: attendee.phone || '9999999999',
        whatsapp: attendee.phone || '9999999999',
        email: `${attendee.phone || Date.now()}@labmedix.ngo`,
        bloodGroup: 'O+',
        photoUrl: '/logo.jpg',
        address: {
          villageArea: attendee.villageOrLocality || selectedCamp.villageOrPanchayat || '',
          postOffice: '',
          policeStation: '',
          district: selectedCamp.district || 'South 24 Parganas',
          state: 'West Bengal',
          pinCode: '',
          fullAddress: `${attendee.villageOrLocality || ''}, ${selectedCamp.district || ''}`
        },
        emergencyContact: { name: 'Family', relationship: 'Relative', mobile: attendee.phone || '' },
        medicalInfo: { bloodGroup: 'O+', chronicConditions: '', allergies: '' },
        walletId: `wal_${Date.now()}`,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser?.fullName || 'Health Camp Staff'
      };

      const existingPatients = StorageService.getPatients();
      StorageService.savePatients([newPatient, ...existingPatients]);
    }

    loadAllData();
    setIsAttendeeModalOpen(false);
    setAttendeeToEdit(null);
    showToast('success', 'Attendee Registered', `Beneficiary ${attendee.fullName} registered for camp`);

    // Open print token slip
    setPrintAttendee(attendee);
    setIsAttendeePrintOpen(true);
  };

  const handleSaveGrant = (grant: CharityGrant) => {
    const res = StorageService.createAndDisburseCharityGrant(grant);
    if (res.success) {
      loadAllData();
      setIsGrantModalOpen(false);
      showToast('success', 'Grant Approved & Disbursed', `Charity Grant of ₹${grant.approvedGrantAmount.toLocaleString('en-IN')} approved & disbursed`);

      // Prompt print voucher
      setPrintGrant(grant);
      setPrintTxn(null);
      setPrintPartner(partners.find(p => p.id === grant.ngoPartnerId) || null);
      setIsPrintModalOpen(true);
    } else {
      showToast('error', 'Disbursement Failed', res.error || 'Failed to disburse grant.');
    }
  };

  // Filtered partners
  const filteredPartners = partners.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ngoCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
            <HeartHandshake className="w-9 h-9 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">NGO & CSR Welfare Hub</h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/30 border border-emerald-400/40 rounded-full text-xs font-semibold text-emerald-200">
                80G & Rural Outreach
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl">
              Institutional CSR Partnerships, Free Rural Health Camps, BPL Patient Subsidies & Co-Branded Welfare Health Cards
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setPartnerToEdit(null);
              setIsPartnerModalOpen(true);
            }}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Building2 className="w-4 h-4 text-emerald-300" />
            + Register NGO
          </button>
          <button
            onClick={() => {
              setCampToEdit(null);
              setIsCampModalOpen(true);
            }}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Tent className="w-4 h-4 text-teal-300" />
            + Schedule Camp
          </button>
          <button
            onClick={() => setIsGrantModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <HeartHandshake className="w-4 h-4 text-slate-950" />
            + Disburse Grant
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          Overview & Impact
        </button>

        <button
          onClick={() => setActiveTab('partners')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
            activeTab === 'partners'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          NGO & CSR Partners ({partners.length})
        </button>

        <button
          onClick={() => setActiveTab('camps')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
            activeTab === 'camps'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Tent className="w-4 h-4" />
          Rural Health Camps ({camps.length})
        </button>

        <button
          onClick={() => setActiveTab('grants')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
            activeTab === 'grants'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Charity Grants & Relief ({grants.length})
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          80G Tax Receipts & Ledger ({transactions.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & IMPACT METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Grant Pool</p>
                <h3 className="text-2xl font-black text-emerald-800 font-mono mt-1">
                  ₹{totalActiveGrantPool.toLocaleString('en-IN')}
                </h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                  Available Across {partners.length} NGO Partners
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Aid Disbursed</p>
                <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
                  ₹{totalAidDisbursed.toLocaleString('en-IN')}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ₹{totalGrantDeposited.toLocaleString('en-IN')} Lifetime CSR Fund
                </p>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl text-teal-700">
                <HeartHandshake className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Patients Screened</p>
                <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {totalAttendeesScreened.toLocaleString('en-IN')}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Across {totalCampsConducted} Outreach Camps
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Free Health Cards</p>
                <h3 className="text-2xl font-black text-emerald-800 font-mono mt-1">
                  {totalFreeCardsIssued.toLocaleString('en-IN')}
                </h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                  Co-Branded (Rotary, Lions, Seva)
                </p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Two-Column Overview Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Partner Pool Balances */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Institutional Grant Pools</h3>
                  <p className="text-xs text-slate-500">Live active balance per partner for subsidizing medical tests</p>
                </div>
                <button
                  onClick={() => setActiveTab('partners')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {partners.slice(0, 4).map(p => (
                  <div
                    key={p.id}
                    className="p-4 bg-slate-50 hover:bg-emerald-50/40 rounded-xl border border-slate-200 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold font-mono">
                          {p.coBrandCardPrefix}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Reg: {p.registrationNumber} | Contact: {p.contactPerson} ({p.phone})
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Grant Balance</p>
                        <p className="text-base font-black text-emerald-800 font-mono">
                          ₹{p.activeBalance.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setDepositPartner(p);
                          setIsDepositModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow transition"
                      >
                        + Deposit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Recent Grants */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Charity Grants</h3>
                <p className="text-xs text-slate-500">Direct patient subsidies approved</p>
              </div>

              <div className="space-y-2.5">
                {grants.slice(0, 4).map(g => (
                  <div key={g.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900">{g.patientName}</span>
                      <span className="font-mono font-bold text-emerald-800">
                        ₹{g.approvedGrantAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{g.medicalCaseTitle}</p>
                    <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400">
                      <span>{g.ngoPartnerName}</span>
                      <span className="text-emerald-700 font-bold">{g.subsidyPercent}% Subsidized</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsGrantModalOpen(true)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition text-center"
              >
                + New Patient Charity Grant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NGO & CSR PARTNER DIRECTORY */}
      {activeTab === 'partners' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search NGO partner, code, contact..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="rotary_lions">Rotary & Lions Clubs</option>
                <option value="corporate_csr">Corporate CSR Trusts</option>
                <option value="charity_trust">Charitable Health Trusts</option>
                <option value="religious_mission">Ramakrishna / Missions</option>
              </select>

              <button
                onClick={() => {
                  setPartnerToEdit(null);
                  setIsPartnerModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Register NGO
              </button>
            </div>
          </div>

          {/* Partner Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPartners.map(partner => (
              <div
                key={partner.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-emerald-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono font-bold">
                        {partner.ngoCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                        {partner.name}
                      </h3>
                      <p className="text-[11px] text-emerald-800 font-medium capitalize mt-0.5">
                        {partner.category.replace('_', ' ')}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        partner.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {partner.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Financial snapshot */}
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 mb-4 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-medium block">Active Grant Balance</span>
                      <span className="text-base font-black text-emerald-950 font-mono">
                        ₹{partner.activeBalance.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block">Total Disbursed</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">
                        ₹{partner.totalAidDisbursed.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Meta details */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">80G Reg:</span>
                      <span className="font-mono font-medium">{partner.taxExemption80G || 'Registered'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contact Person:</span>
                      <span className="font-medium">{partner.contactPerson} ({partner.phone})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Card Prefix:</span>
                      <span className="font-mono font-bold text-emerald-800">{partner.coBrandCardPrefix}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">MoU Valid Till:</span>
                      <span>{partner.mouValidTill}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setPartnerToEdit(partner);
                      setIsPartnerModalOpen(true);
                    }}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    title="Edit Partner"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setDepositPartner(partner);
                      setIsDepositModalOpen(true);
                    }}
                    className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow transition text-center flex items-center justify-center gap-1"
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    Deposit Grant
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RURAL HEALTH CAMPS */}
      {activeTab === 'camps' && (
        <div className="space-y-6">
          {/* Camp Selector & Top Stats */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Select Active Camp:</label>
              <select
                value={selectedCamp?.id || ''}
                onChange={e => setSelectedCampId(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {camps.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} — {c.campDate} ({c.venueName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCampToEdit(null);
                  setIsCampModalOpen(true);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                + Schedule Camp
              </button>
              {selectedCamp && (
                <button
                  onClick={() => {
                    setAttendeeToEdit(null);
                    setIsAttendeeModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  + Register Beneficiary
                </button>
              )}
            </div>
          </div>

          {/* Selected Camp Header & Details */}
          {selectedCamp && (
            <div className="bg-gradient-to-r from-teal-900 to-emerald-900 text-white rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/20 rounded font-mono text-xs font-bold">
                      {selectedCamp.campCode}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-400/30 text-emerald-200 rounded text-xs font-medium">
                      {selectedCamp.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-black mt-1">{selectedCamp.title}</h2>
                  <p className="text-xs text-teal-200 mt-0.5">
                    Sponsoring Partner:{' '}
                    <span className="font-bold text-white">{selectedCamp.ngoPartnerName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-teal-200">Camp Date & Timings</p>
                    <p className="text-xs font-bold font-mono">
                      {selectedCamp.campDate} ({selectedCamp.startTime} - {selectedCamp.endTime})
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCampToEdit(selectedCamp);
                      setIsCampModalOpen(true);
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition"
                    title="Edit Camp Info"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Camp Venue & Doctors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-white/10 p-3.5 rounded-xl border border-white/10">
                <div>
                  <span className="text-teal-300 block">Venue & Location:</span>
                  <span className="font-medium text-white">{selectedCamp.venueName}, {selectedCamp.locationAddress}</span>
                </div>
                <div>
                  <span className="text-teal-300 block">Assigned Medical Officers:</span>
                  <span className="font-medium text-white">{selectedCamp.assignedDoctorNames?.join(', ') || 'Chief Consultant'}</span>
                </div>
                <div>
                  <span className="text-teal-300 block">Coordinator & Helpline:</span>
                  <span className="font-medium text-white">{selectedCamp.coordinatorName} ({selectedCamp.coordinatorPhone})</span>
                </div>
              </div>

              {/* Live Count Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-black/20 p-3 rounded-xl">
                  <span className="text-[10px] text-teal-200 block">Target Patients</span>
                  <span className="text-lg font-black font-mono">{selectedCamp.targetBeneficiaries}</span>
                </div>
                <div className="bg-black/20 p-3 rounded-xl">
                  <span className="text-[10px] text-teal-200 block">Registered on Desk</span>
                  <span className="text-lg font-black font-mono text-emerald-300">{selectedCampAttendees.length}</span>
                </div>
                <div className="bg-black/20 p-3 rounded-xl">
                  <span className="text-[10px] text-teal-200 block">Screened & Investigated</span>
                  <span className="text-lg font-black font-mono text-amber-300">
                    {selectedCampAttendees.filter(a => a.status === 'investigated' || a.status === 'prescribed').length}
                  </span>
                </div>
                <div className="bg-black/20 p-3 rounded-xl">
                  <span className="text-[10px] text-teal-200 block">Co-Branded Cards Issued</span>
                  <span className="text-lg font-black font-mono text-teal-200">
                    {selectedCampAttendees.filter(a => a.healthCardIssued).length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Attendees List & Registration Desk */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Beneficiaries Registered at Camp Desk ({selectedCampAttendees.length})
                </h3>
                <p className="text-xs text-slate-500">
                  On-the-spot screening vitals, prescribed free investigations, and medicine logs
                </p>
              </div>

              {selectedCamp && (
                <button
                  onClick={() => {
                    setAttendeeToEdit(null);
                    setIsAttendeeModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  + Register Beneficiary
                </button>
              )}
            </div>

            {selectedCampAttendees.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No beneficiaries registered yet for this camp.</p>
                <button
                  onClick={() => {
                    setAttendeeToEdit(null);
                    setIsAttendeeModalOpen(true);
                  }}
                  className="mt-3 px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg shadow"
                >
                  Register First Patient
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-semibold">Token</th>
                      <th className="py-2.5 px-3 font-semibold">Beneficiary Name</th>
                      <th className="py-2.5 px-3 font-semibold">Age/Gender</th>
                      <th className="py-2.5 px-3 font-semibold">Vitals (BP/Sugar)</th>
                      <th className="py-2.5 px-3 font-semibold">Prescribed Tests</th>
                      <th className="py-2.5 px-3 font-semibold">Co-Branded Card</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedCampAttendees.map(att => (
                      <tr key={att.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-mono font-bold text-emerald-800">
                          {att.tokenNumber}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{att.fullName}</span>
                          <span className="text-[11px] text-slate-400">{att.villageOrLocality || 'Local'}</span>
                        </td>
                        <td className="py-3 px-3">
                          {att.age} Y / {att.gender.charAt(0).toUpperCase()}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className="block text-slate-800">
                            BP: {att.vitals?.bpSystolic || '--'}/{att.vitals?.bpDiastolic || '--'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            RBS: {att.vitals?.bloodSugar ? `${att.vitals.bloodSugar} mg/dL` : '--'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {att.prescribedTests?.slice(0, 2).map((t, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px] font-medium">
                                {t}
                              </span>
                            ))}
                            {(att.prescribedTests?.length || 0) > 2 && (
                              <span className="text-[10px] text-slate-400">
                                +{(att.prescribedTests?.length || 0) - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {att.cardNumber ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-mono text-[10px] font-bold">
                              {att.cardNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">None</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold capitalize">
                            {att.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setPrintAttendee(att);
                                setIsAttendeePrintOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                              title="Print Token & Prescription Slip"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setAttendeeToEdit(att);
                                setIsAttendeeModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                              title="Edit Attendee"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CHARITY GRANTS & BPL RELIEF */}
      {activeTab === 'grants' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Patient Charity Grant Approvals</h3>
              <p className="text-xs text-slate-500">
                Direct financial relief subsidies funded by partner grant pools
              </p>
            </div>

            <button
              onClick={() => setIsGrantModalOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + Request / Disburse Grant
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold">Grant No</th>
                  <th className="py-3 px-4 font-semibold">Patient Name</th>
                  <th className="py-3 px-4 font-semibold">Medical Case / Diagnosis</th>
                  <th className="py-3 px-4 font-semibold">Sponsoring NGO</th>
                  <th className="py-3 px-4 font-semibold">Estimated Bill</th>
                  <th className="py-3 px-4 font-semibold">Disbursed Aid</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grants.map(grant => (
                  <tr key={grant.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {grant.grantNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{grant.patientName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {grant.bplOrAadhaar || grant.patientPhone || 'BPL Verified'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <span className="font-medium text-slate-800 block truncate">{grant.medicalCaseTitle}</span>
                      <span className="text-[10px] text-emerald-700 capitalize">
                        {grant.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {grant.ngoPartnerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      ₹{grant.estimatedTotalBill.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      ₹{grant.approvedGrantAmount.toLocaleString('en-IN')} ({grant.subsidyPercent}%)
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                        {grant.approvalStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setPrintGrant(grant);
                          setPrintTxn(null);
                          setPrintPartner(partners.find(p => p.id === grant.ngoPartnerId) || null);
                          setIsPrintModalOpen(true);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> Voucher
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: 80G TAX RECEIPTS & AUDIT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">80G Donation Receipts & CSR Audit Ledger</h3>
              <p className="text-xs text-slate-500">
                Complete financial transaction log compliant with Section 80G of Income Tax Act
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold">Receipt / Txn ID</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">NGO / Trust Name</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Mode / UTR Ref</th>
                  <th className="py-3 px-4 font-semibold">80G Issued</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {txn.receiptNumber || txn.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {txn.date}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {txn.ngoPartnerName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          txn.type === 'deposit'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {txn.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹{txn.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <span className="block uppercase text-[10px] text-slate-400">{txn.paymentMethod}</span>
                      <span>{txn.referenceNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {txn.taxExemption80GIssued ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                          ✓ 80G Certified
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {txn.type === 'deposit' && (
                        <button
                          onClick={() => {
                            setPrintTxn(txn);
                            setPrintGrant(null);
                            setPrintPartner(partners.find(p => p.id === txn.ngoPartnerId) || null);
                            setIsPrintModalOpen(true);
                          }}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> 80G Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      <NgoPartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => {
          setIsPartnerModalOpen(false);
          setPartnerToEdit(null);
        }}
        onSave={handleSavePartner}
        partnerToEdit={partnerToEdit}
      />

      <NgoDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setDepositPartner(null);
        }}
        partner={depositPartner}
        onSuccess={handleDepositSuccess}
        currentUserFullName={currentUser?.fullName || 'Super Administrator'}
      />

      <HealthCampModal
        isOpen={isCampModalOpen}
        onClose={() => {
          setIsCampModalOpen(false);
          setCampToEdit(null);
        }}
        onSave={handleSaveCamp}
        campToEdit={campToEdit}
        ngoPartners={partners}
      />

      {selectedCamp && (
        <CampAttendeeModal
          isOpen={isAttendeeModalOpen}
          onClose={() => {
            setIsAttendeeModalOpen(false);
            setAttendeeToEdit(null);
          }}
          onSave={handleSaveAttendee}
          camp={selectedCamp}
          partner={partners.find(p => p.id === selectedCamp.ngoPartnerId)}
          attendeeToEdit={attendeeToEdit}
          existingCount={selectedCampAttendees.length}
        />
      )}

      <CharityGrantModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        onSave={handleSaveGrant}
        ngoPartners={partners}
        patients={patients}
        currentUserFullName={currentUser?.fullName || 'Super Administrator'}
      />

      {/* Print Modals */}
      <NgoReceiptPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setPrintTxn(null);
          setPrintGrant(null);
          setPrintPartner(null);
        }}
        transaction={printTxn}
        grant={printGrant}
        partner={printPartner}
      />

      <CampAttendeePrintSlip
        isOpen={isAttendeePrintOpen}
        onClose={() => {
          setIsAttendeePrintOpen(false);
          setPrintAttendee(null);
        }}
        attendee={printAttendee}
        camp={selectedCamp}
        partner={partners.find(p => p.id === selectedCamp?.ngoPartnerId)}
      />
    </div>
  );
};
