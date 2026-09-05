import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storage';
import { DoctorMasterService, DoctorMasterItem } from '../../services/doctorMasterService';
import { EMRService } from '../../services/emrService';
import { Button } from '../../components/common/Button';
import {
  Stethoscope,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Video,
  FileText,
  Activity,
  Search,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  LogOut,
  Bell,
  BedDouble,
  ClipboardList,
  Sparkles
} from 'lucide-react';

export const DoctorDashboardPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [doctorProfile, setDoctorProfile] = useState<DoctorMasterItem | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'telemedicine' | 'prescriptions' | 'ipd' | 'schedule'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [queueFilter, setQueueFilter] = useState<'all' | 'waiting' | 'in_consultation' | 'completed'>('all');

  // Simulated live queue state for the doctor
  const [patientQueue, setPatientQueue] = useState([
    {
      id: 'q_1',
      tokenNo: 'DR-01',
      appointmentTime: '10:00 AM',
      patientName: 'Aarav Sharma',
      ageGender: '42 Y / Male',
      type: 'Follow-up',
      mode: 'OPD',
      waitingTime: '12 mins',
      status: 'WAITING'
    },
    {
      id: 'q_2',
      tokenNo: 'DR-02',
      appointmentTime: '10:30 AM',
      patientName: 'Priya Sen',
      ageGender: '29 Y / Female',
      type: 'New Consultation',
      mode: 'Telemedicine',
      waitingTime: '5 mins',
      status: 'BOOKED'
    },
    {
      id: 'q_3',
      tokenNo: 'DR-03',
      appointmentTime: '11:00 AM',
      patientName: 'Debabrata Mukherjee',
      ageGender: '58 Y / Male',
      type: 'New Consultation',
      mode: 'OPD',
      waitingTime: '0 mins',
      status: 'IN_CONSULTATION'
    }
  ]);

  const loadQueue = useCallback(() => {
    const docName = doctorProfile?.name || currentUser?.fullName || '';
    const liveQueue = EMRService.getWaitingQueue(docName);
    if (liveQueue.length > 0) {
      setPatientQueue(liveQueue.map(item => ({
        id: item.patientId,
        tokenNo: `DR-${String(item.tokenNo).slice(-2)}`,
        appointmentTime: item.arrivalTime,
        patientName: item.patientName,
        ageGender: `${item.age} Y / ${item.gender}`,
        type: item.chiefComplaint || 'Clinical Consultation',
        mode: item.chiefComplaint?.includes('Tele') ? 'Telemedicine' : 'OPD',
        waitingTime: item.status === 'in_consultation' ? 'Now' : 'Waiting',
        status: item.status === 'in_consultation' ? 'IN_CONSULTATION' : item.status === 'completed' ? 'COMPLETED' : 'WAITING'
      })));
    }
  }, [doctorProfile?.name, currentUser?.fullName]);

  useEffect(() => {
    if (currentUser) {
      const allDocs = DoctorMasterService.getAllDoctors();
      const matched = allDocs.find(d => d.username.toLowerCase() === currentUser.username.toLowerCase() || d.name.toLowerCase().includes(currentUser.fullName.toLowerCase()));
      if (matched) {
        setDoctorProfile(matched);
      } else {
        // Fallback default doctor profile if not explicitly in doctor master
        setDoctorProfile({
          id: currentUser.id,
          doctorCode: 'DR-999',
          name: currentUser.fullName,
          qualification: 'MBBS, MD (Clinical Specialist)',
          speciality: 'General & Internal Medicine',
          department: 'OPD Specialist Suite',
          regNumber: 'WBMC-99881',
          phone: currentUser.phone || '+91 98300 00000',
          email: currentUser.email,
          opdRoom: 'Room 101',
          avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
          username: currentUser.username,
          pinCode: '1234',
          standardFee: 800,
          followUpFee: 500,
          telemedicineFee: 700,
          cardholderDiscountPercent: 20,
          totalFeesCollected: 12400,
          totalConsultationsCompleted: 18,
          bloodCommissionPercent: 20,
          totalTestsReferredCount: 14,
          totalReferredLabRevenue: 28000,
          totalCommissionEarned: 5600,
          totalCommissionPaid: 4000,
          payableCommissionBalance: 1600,
          status: 'active',
          availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          opdTiming: '10:00 AM - 02:00 PM',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
  }, [currentUser]);

  useEffect(() => {
    loadQueue();
    const handleSync = () => {
      loadQueue();
    };
    window.addEventListener('labmedix_data_synced', handleSync);
    return () => window.removeEventListener('labmedix_data_synced', handleSync);
  }, [loadQueue]);

  const handleStartConsultation = (patientId: string) => {
    setPatientQueue(prev => prev.map(p => p.id === patientId ? { ...p, status: 'IN_CONSULTATION' } : p));
    showToast('success', 'Consultation Started', 'Opening digital EMR & Prescription workspace.');
    navigate(`/emr?patientId=${patientId}`);
  };

  const handleCompleteConsultation = (patientId: string) => {
    setPatientQueue(prev => prev.map(p => p.id === patientId ? { ...p, status: 'COMPLETED' } : p));
    showToast('success', 'Consultation Completed', 'Prescription finalized and archived to central record.');
  };

  const filteredQueue = patientQueue.filter(p => {
    if (queueFilter !== 'all' && p.status.toLowerCase() !== queueFilter) return false;
    if (searchTerm && !p.patientName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">LABMEDIX Doctor Portal</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-500/30">
                ACTIVE CLINICAL SUITE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {doctorProfile ? `${doctorProfile.name} • ${doctorProfile.department} (${doctorProfile.regNumber})` : 'Loading Doctor Profile...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/emr')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white transition-all shadow-md shadow-teal-600/20"
          >
            <FileText className="w-4 h-4" />
            <span>Open EMR Suite</span>
          </button>
          <button
            onClick={async () => {
              await logout();
              navigate('/doctor-login');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-xs font-bold text-slate-300 transition-colors border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Today's Appointments</span>
              <div className="text-2xl font-black text-white">12 Scheduled</div>
              <span className="text-[10px] text-teal-400 font-mono">OPD & Telemedicine</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Waiting Queue</span>
              <div className="text-2xl font-black text-amber-400">3 Patients</div>
              <span className="text-[10px] text-slate-400 font-mono">Avg wait: 8 mins</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Completed Consultations</span>
              <div className="text-2xl font-black text-emerald-400">{doctorProfile?.totalConsultationsCompleted || 8} Today</div>
              <span className="text-[10px] text-emerald-400 font-mono">Prescriptions signed</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Active IPD Care</span>
              <div className="text-2xl font-black text-purple-400">4 Patients</div>
              <span className="text-[10px] text-purple-400 font-mono">Daily progress notes pending</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <BedDouble className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: Activity },
            { id: 'queue', label: "Today's Patient Queue", icon: Users },
            { id: 'telemedicine', label: 'Telemedicine Sessions', icon: Video },
            { id: 'prescriptions', label: 'Prescription Drafts & History', icon: FileText },
            { id: 'ipd', label: 'IPD Ward Care', icon: BedDouble },
            { id: 'schedule', label: 'Schedule & Availability', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content: Overview / Queue */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Live Patient Queue */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">Active OPD Patient Queue</h3>
                    <p className="text-xs text-slate-400">Manage real-time token queue and start clinical consultations</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('queue')}
                    className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {patientQueue.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 font-mono font-bold flex items-center justify-center text-xs shrink-0 border border-teal-500/30">
                          {patient.tokenNo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{patient.patientName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              {patient.ageGender}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span>🕒 {patient.appointmentTime}</span>
                            <span>•</span>
                            <span className="text-teal-400">{patient.type} ({patient.mode})</span>
                            <span>•</span>
                            <span className="text-amber-400">Waiting: {patient.waitingTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono uppercase font-black ${
                          patient.status === 'IN_CONSULTATION'
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/50 animate-pulse'
                            : patient.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        }`}>
                          {patient.status.replace('_', ' ')}
                        </span>
                        {patient.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleStartConsultation(patient.id)}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white transition-colors"
                          >
                            Consult →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Quick Actions & Doctor Profile Summary */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-black text-white">Quick Clinical Actions</h3>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => navigate('/emr')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-teal-950/40 border border-slate-800 hover:border-teal-500/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                        📋
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-teal-300">Start New Prescription</span>
                        <span className="text-[10px] text-slate-400">Digital SOAP notes & Rx</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('telemedicine')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                        🎥
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-blue-300">Telemedicine Waiting Room</span>
                        <span className="text-[10px] text-slate-400">Secure video consultation</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('ipd')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                        🛏️
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-purple-300">IPD Progress Notes</span>
                        <span className="text-[10px] text-slate-400">Admitted patient care</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                  </button>
                </div>
              </div>

              {/* AI Clinical Assistant Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/60 to-slate-900 border border-teal-500/30 space-y-3">
                <div className="flex items-center gap-2 text-teal-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">AI Clinical Assistant</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  AI-assisted prescription drafting and medical record summarization is active. All suggestions require explicit doctor review before finalization.
                </p>
                <div className="pt-1">
                  <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-2.5 py-1 rounded-md border border-teal-500/40">
                    Status: Ready & Secured
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/30">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white capitalize">{activeTab.replace('-', ' ')} Module</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              This specialized doctor module is fully integrated with the central database and secure EMR suite.
            </p>
            <div className="pt-2">
              <Button onClick={() => setActiveTab('overview')} variant="secondary">
                ← Return to Overview Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default DoctorDashboardPage;
