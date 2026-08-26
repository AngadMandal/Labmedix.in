import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storage';
import { EMRService } from '../../services/emrService';
import { PatientService } from '../../services/patientService';
import { ClinicalEncounter, Patient } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { PrescriptionPrintModal } from '../emr/PrescriptionPrintModal';
import {
  UserPlus,
  Stethoscope,
  Pill,
  Users,
  Activity,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Eye,
  FileText,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Printer
} from 'lucide-react';

interface TodayClinicalSummaryWidgetProps {
  className?: string;
  onRefresh?: () => void;
}

export const TodayClinicalSummaryWidget: React.FC<TodayClinicalSummaryWidgetProps> = ({
  className = ''
}) => {
  const navigate = useNavigate();

  const [selectedEncounterForPrint, setSelectedEncounterForPrint] = useState<ClinicalEncounter | null>(null);
  const [showTodayPatientsModal, setShowTodayPatientsModal] = useState(false);
  const [showActiveRxModal, setShowActiveRxModal] = useState(false);

  const now = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => now.toDateString(), [now]);

  // Load live data safely
  const allPatients = useMemo(() => StorageService.getPatients().filter(p => !p.isDeleted), []);
  const allEncounters = useMemo(() => EMRService.getAllEncounters(), []);
  const waitingQueue = useMemo(() => EMRService.getWaitingQueue(), []);
  const allAppointments = useMemo(() => EMRService.getAllAppointments(), []);

  // Filter Today's Patients
  const todayPatients = useMemo(() => {
    return allPatients.filter(p => {
      if (!p.createdAt) return false;
      const createdDate = new Date(p.createdAt);
      return createdDate.toDateString() === todayStr;
    });
  }, [allPatients, todayStr]);

  // Filter Active Prescriptions & Today's Encounters
  const activeEncounters = useMemo(() => {
    return allEncounters.filter(e => {
      const hasMeds = e.medications && e.medications.length > 0;
      const isNotCancelled = e.status !== 'draft';
      return hasMeds && isNotCancelled;
    });
  }, [allEncounters]);

  const todayEncounters = useMemo(() => {
    return allEncounters.filter(e => {
      const dateVal = e.createdAt || e.date;
      if (!dateVal) return false;
      return new Date(dateVal).toDateString() === todayStr;
    });
  }, [allEncounters, todayStr]);

  // Consultation queue stats
  const queueInConsultation = waitingQueue.filter(q => q.status === 'in_consultation').length;
  const queueWaiting = waitingQueue.filter(q => q.status === 'waiting' || q.status === 'next_up').length;
  const queueCompleted = waitingQueue.filter(q => q.status === 'completed').length;

  const todayDateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className={`bg-gradient-to-br from-white via-slate-50 to-blue-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/20 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden ${className}`}>
      {/* Decorative subtle ambient backdrop */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-xs">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight font-display">
                Today's Clinical & Registration Activity
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{todayDateFormatted}</span>
              <span>•</span>
              <span>Real-time daily operations monitor</span>
            </p>
          </div>
        </div>

        {/* Action shortcut buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            onClick={() => navigate('/patients/new')}
          >
            New Patient
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Stethoscope className="w-3.5 h-3.5" />}
            onClick={() => navigate('/emr')}
          >
            Open EMR Suite
          </Button>
        </div>
      </div>

      {/* Main Dual-Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-5 relative z-10">
        {/* Metric 1: Today's New Patient Registrations */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                New Patients Today
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                {allPatients.length} Total Registered
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                {todayPatients.length}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                {todayPatients.length > 0 ? `${todayPatients.length} registered today` : 'Ready for walk-ins'}
              </span>
            </div>

            {/* Quick mini-list of today's newly added patients */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
              {todayPatients.length > 0 ? (
                todayPatients.slice(0, 2).map(p => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 border border-slate-100 dark:border-slate-800 cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={p.photoUrl || '/logo.jpg'}
                        alt={p.fullName}
                        className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {p.fullName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {p.id}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-1">
                  No new walk-in patients registered yet today.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTodayPatientsModal(true)}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Registrations Log ({todayPatients.length})</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Metric 2: Active Prescriptions & Issued Rx */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Active Prescriptions
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                {todayEncounters.length} Today's Rx
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                {activeEncounters.length}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active clinical regimens
              </span>
            </div>

            {/* Quick mini-list of active prescriptions */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
              {activeEncounters.slice(0, 2).map(e => (
                <div
                  key={e.id}
                  onClick={() => setSelectedEncounterForPrint(e)}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 border border-slate-100 dark:border-slate-800 cursor-pointer transition-colors text-xs"
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {e.patientName}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                      {e.doctorName} • {e.medications.length} Meds
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                    {e.encounterNo}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowActiveRxModal(true)}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Inspect Active Rx Queue ({activeEncounters.length})</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Metric 3: Live OPD Token & Clinical Flow */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 shadow-xs hover:shadow-md transition-all flex flex-col justify-between md:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Live OPD Token Status
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                {waitingQueue.length} In Queue
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60">
                <span className="text-xl font-black text-blue-700 dark:text-blue-300 block font-display">
                  {queueInConsultation}
                </span>
                <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                  In Doctor OPD
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60">
                <span className="text-xl font-black text-amber-700 dark:text-amber-300 block font-display">
                  {queueWaiting}
                </span>
                <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                  Waiting
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 block font-display">
                  {queueCompleted}
                </span>
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Completed
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Booked Appointments:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{allAppointments.length} total</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/emr')}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span>Manage Consultation Flow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MODAL 1: Today's Registered Patients Full Inspector */}
      {showTodayPatientsModal && (
        <Modal
          isOpen={showTodayPatientsModal}
          onClose={() => setShowTodayPatientsModal(false)}
          title={`Today's New Patient Registrations (${todayPatients.length})`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
              <span>Patients registered on {todayDateFormatted}</span>
              <Button size="sm" variant="primary" onClick={() => { setShowTodayPatientsModal(false); navigate('/patients/new'); }}>
                + Add Walk-In Patient
              </Button>
            </div>

            {todayPatients.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold">No patients have registered yet today.</p>
                <p className="text-xs text-slate-400 mt-1">Walk-in or online registrations will appear here automatically.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
                {todayPatients.map(p => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.photoUrl || '/logo.jpg'}
                        alt={p.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                          {p.fullName}
                        </strong>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                          <span>{p.id}</span>
                          <span>•</span>
                          <span>{p.mobile}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold">{p.bloodGroup}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowTodayPatientsModal(false);
                          navigate(`/patients/${p.id}`);
                        }}
                      >
                        Open Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL 2: Active Prescriptions Queue Inspector */}
      {showActiveRxModal && (
        <Modal
          isOpen={showActiveRxModal}
          onClose={() => setShowActiveRxModal(false)}
          title={`Active Prescriptions & Clinical Encounters (${activeEncounters.length})`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
              <span>Verified prescriptions issued with active medical courses</span>
              <Button size="sm" variant="success" onClick={() => { setShowActiveRxModal(false); navigate('/emr'); }}>
                Go to EMR Prescriptions
              </Button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
              {activeEncounters.map(e => (
                <div key={e.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-slate-900 dark:text-white">
                        {e.patientName}
                      </strong>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                        {e.encounterNo}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                      <span>Doctor: <strong className="text-slate-700 dark:text-slate-300">{e.doctorName}</strong></span>
                      <span>•</span>
                      <span>Diagnosis: <span className="italic">{e.diagnoses.join(', ') || 'Clinical Evaluation'}</span></span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {e.medications.map((m, idx) => (
                        <span key={idx} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          💊 {m.name} ({m.dosage}) - {m.duration}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedEncounterForPrint(e)}
                    >
                      Print Rx
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Dedicated Printable Prescription Modal */}
      {selectedEncounterForPrint && (
        <PrescriptionPrintModal
          isOpen={!!selectedEncounterForPrint}
          onClose={() => setSelectedEncounterForPrint(null)}
          encounter={selectedEncounterForPrint}
          patient={PatientService.getById(selectedEncounterForPrint.patientId)}
        />
      )}
    </div>
  );
};
