import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient, VitalsRecord } from '../../types';
import { StorageService } from '../../services/storage';
import { VitalsService, VitalsSummary } from '../../services/vitalsService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend
} from 'recharts';
import {
  Activity,
  Heart,
  Droplet,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Trash2,
  Sparkles,
  Search,
  User,
  ChevronDown,
  ArrowUpRight,
  ShieldAlert,
  Gauge,
  Thermometer,
  Scale,
  Stethoscope,
  Filter,
  Layers,
  HeartPulse,
  Info
} from 'lucide-react';

interface PatientVitalsDashboardWidgetProps {
  className?: string;
}

export const PatientVitalsDashboardWidget: React.FC<PatientVitalsDashboardWidgetProps> = ({
  className = ''
}) => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // All patients for selector
  const [patients, setPatients] = useState<Patient[]>(() =>
    StorageService.getPatients().filter(p => !p.isDeleted)
  );

  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    const list = StorageService.getPatients().filter(p => !p.isDeleted);
    return list[0]?.id || '';
  });

  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  // Active views
  const [activeMetricView, setActiveMetricView] = useState<'combined' | 'bp' | 'heart_rate' | 'glucose'>('combined');
  const [timeRangeFilter, setTimeRangeFilter] = useState<'7d' | '14d' | '30d' | 'all'>('30d');
  const [showHistoryTable, setShowHistoryTable] = useState(false);

  // Vitals data for selected patient
  const [vitalsList, setVitalsList] = useState<VitalsRecord[]>([]);

  // Modal State for New Reading
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [modalBpSystolic, setModalBpSystolic] = useState<number | ''>(120);
  const [modalBpDiastolic, setModalBpDiastolic] = useState<number | ''>(80);
  const [modalPulseRate, setModalPulseRate] = useState<number | ''>(72);
  const [modalBloodSugar, setModalBloodSugar] = useState<number | ''>(100);
  const [modalSugarType, setModalSugarType] = useState<'fasting' | 'post_prandial' | 'random'>('fasting');
  const [modalSpo2, setModalSpo2] = useState<number | ''>(99);
  const [modalTemperature, setModalTemperature] = useState<number | ''>(98.4);
  const [modalWeightKg, setModalWeightKg] = useState<number | ''>(70);
  const [modalHeightCm, setModalHeightCm] = useState<number | ''>(170);
  const [modalNotes, setModalNotes] = useState('');
  const [modalRecordedBy, setModalRecordedBy] = useState('OPD Clinical Triage');

  // Selected Patient Object
  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || patients[0] || null;
  }, [patients, selectedPatientId]);

  // Load vitals when selected patient changes
  const loadVitalsForPatient = (patientId: string) => {
    if (!patientId) return;
    const records = VitalsService.getPatientVitals(patientId);
    setVitalsList(records);
  };

  useEffect(() => {
    if (selectedPatient?.id) {
      loadVitalsForPatient(selectedPatient.id);
    }
  }, [selectedPatient?.id]);

  // Listen to external vitals update events or storage sync
  useEffect(() => {
    const handleVitalsUpdate = (e: any) => {
      const updatedPatientId = e?.detail?.patientId;
      if (updatedPatientId && updatedPatientId === selectedPatient?.id) {
        loadVitalsForPatient(updatedPatientId);
      }
    };

    const handleDataSync = () => {
      const refreshedPatients = StorageService.getPatients().filter(p => !p.isDeleted);
      setPatients(refreshedPatients);
      if (selectedPatient?.id) {
        loadVitalsForPatient(selectedPatient.id);
      }
    };

    window.addEventListener('labmedix_vitals_updated', handleVitalsUpdate);
    window.addEventListener('labmedix_data_synced', handleDataSync);

    return () => {
      window.removeEventListener('labmedix_vitals_updated', handleVitalsUpdate);
      window.removeEventListener('labmedix_data_synced', handleDataSync);
    };
  }, [selectedPatient?.id]);

  // Filtered patients for dropdown search
  const filteredPatients = useMemo(() => {
    if (!patientSearchQuery.trim()) return patients.slice(0, 10);
    const q = patientSearchQuery.toLowerCase();
    return patients.filter(
      p =>
        p.fullName.toLowerCase().includes(q) ||
        p.mobile.includes(q) ||
        p.id.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [patients, patientSearchQuery]);

  // Compute Time Range Filtered Vitals
  const filteredVitals = useMemo(() => {
    if (vitalsList.length === 0) return [];
    const now = new Date().getTime();

    let cutoffDays = 0;
    if (timeRangeFilter === '7d') cutoffDays = 7;
    else if (timeRangeFilter === '14d') cutoffDays = 14;
    else if (timeRangeFilter === '30d') cutoffDays = 30;

    if (cutoffDays === 0) return vitalsList;

    const cutoffTime = now - cutoffDays * 24 * 3600 * 1000;
    const filtered = vitalsList.filter(
      r => new Date(r.recordedAt).getTime() >= cutoffTime
    );

    // If filtering results in too few points for graphing, fallback to the last 5 records
    return filtered.length >= 2 ? filtered : vitalsList.slice(-6);
  }, [vitalsList, timeRangeFilter]);

  // Compute Comprehensive Summary
  const summary: VitalsSummary = useMemo(() => {
    return VitalsService.calculateVitalsSummary(vitalsList);
  }, [vitalsList]);

  // Chart Formatted Data
  const chartData = useMemo(() => {
    return filteredVitals.map(v => {
      const dateObj = new Date(v.recordedAt);
      const displayDate = isNaN(dateObj.getTime())
        ? v.recordedAt
        : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const displayTime = isNaN(dateObj.getTime())
        ? ''
        : dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      return {
        id: v.id,
        rawDate: v.recordedAt,
        date: displayDate,
        time: displayTime,
        fullLabel: `${displayDate} ${displayTime}`,
        bpSystolic: v.bpSystolic,
        bpDiastolic: v.bpDiastolic,
        pulseRate: v.pulseRate,
        bloodSugar: v.bloodSugar,
        sugarType: v.sugarType || 'random',
        spo2: v.spo2 || 99,
        temperature: v.temperature || 98.4,
        notes: v.notes || '',
        recordedBy: v.recordedBy || 'Clinical Staff'
      };
    });
  }, [filteredVitals]);

  // Save new vitals record
  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const sys = Number(modalBpSystolic) || 120;
    const dia = Number(modalBpDiastolic) || 80;
    const pulse = Number(modalPulseRate) || 72;
    const glu = Number(modalBloodSugar) || 100;
    const ox = Number(modalSpo2) || 99;
    const temp = Number(modalTemperature) || 98.4;
    const wt = Number(modalWeightKg) || 70;
    const ht = Number(modalHeightCm) || 170;

    let calcBmi = '24.2';
    if (wt > 0 && ht > 0) {
      const hm = ht / 100;
      calcBmi = (wt / (hm * hm)).toFixed(1);
    }

    const newRecord = VitalsService.addVitalsRecord(selectedPatient.id, {
      recordedAt: new Date().toISOString(),
      bpSystolic: sys,
      bpDiastolic: dia,
      pulseRate: pulse,
      bloodSugar: glu,
      sugarType: modalSugarType,
      spo2: ox,
      temperature: temp,
      respiratoryRate: 16,
      weightKg: wt,
      heightCm: ht,
      bmi: calcBmi,
      notes: modalNotes.trim() || 'Dashboard routine vitals check',
      recordedBy: modalRecordedBy.trim() || 'Super Administrator'
    });

    loadVitalsForPatient(selectedPatient.id);
    setIsRecordModalOpen(false);
    showToast(
      'success',
      'Vitals Recorded',
      `BP ${sys}/${dia} mmHg, Pulse ${pulse} BPM, Sugar ${glu} mg/dL logged for ${selectedPatient.fullName}.`
    );

    // Reset notes
    setModalNotes('');
  };

  // Delete vitals record
  const handleDeleteVitals = (recordId: string) => {
    if (!selectedPatient) return;
    VitalsService.deleteVitalsRecord(selectedPatient.id, recordId);
    loadVitalsForPatient(selectedPatient.id);
    showToast('info', 'Record Deleted', 'Vitals entry removed from timeline.');
  };

  // Custom Chart Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/60 backdrop-blur-md min-w-[220px] text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-mono">
          <span className="font-bold text-slate-300">{data.fullLabel}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
            {data.recordedBy}
          </span>
        </div>

        {/* Blood Pressure */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-rose-400">
            <Activity className="w-3.5 h-3.5" />
            <span>Blood Pressure:</span>
          </div>
          <strong className="text-white font-mono">
            {data.bpSystolic} / {data.bpDiastolic} <span className="text-[10px] text-slate-400">mmHg</span>
          </strong>
        </div>

        {/* Heart Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-teal-400">
            <Heart className="w-3.5 h-3.5" />
            <span>Heart Rate:</span>
          </div>
          <strong className="text-white font-mono">
            {data.pulseRate} <span className="text-[10px] text-slate-400">BPM</span>
          </strong>
        </div>

        {/* Blood Glucose */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Droplet className="w-3.5 h-3.5" />
            <span>Glucose ({data.sugarType}):</span>
          </div>
          <strong className="text-white font-mono">
            {data.bloodSugar} <span className="text-[10px] text-slate-400">mg/dL</span>
          </strong>
        </div>

        {/* SpO2 / Temp if present */}
        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>SpO2: <strong className="text-emerald-300 font-mono">{data.spo2}%</strong></span>
          <span>Temp: <strong className="text-amber-300 font-mono">{data.temperature}°F</strong></span>
        </div>

        {data.notes && (
          <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/80">
            "{data.notes}"
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-6 ${className}`}
    >
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Patient Switcher Bar */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-800 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Patient Vitals & Clinical Trends
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 flex items-center gap-1">
                <Activity className="w-3 h-3 text-rose-500" />
                Live Bio-Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuous monitoring and Recharts trend visualization for Blood Pressure, Heart Rate & Blood Glucose
            </p>
          </div>
        </div>

        {/* Right Side: Patient Selector & Record Vitals Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Patient Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors shadow-xs"
            >
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div className="text-left max-w-[150px] sm:max-w-[180px] truncate">
                <span className="block font-bold truncate">
                  {selectedPatient ? selectedPatient.fullName : 'Select Patient'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                  {selectedPatient ? `${selectedPatient.id} • ${selectedPatient.bloodGroup || 'O+'}` : 'No patient'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {isPatientDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-2 space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Search patient by name / mobile..."
                    value={patientSearchQuery}
                    onChange={e => setPatientSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
                    autoFocus
                  />
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 rounded-xl">
                  {filteredPatients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setIsPatientDropdownOpen(false);
                        setPatientSearchQuery('');
                      }}
                      className={`w-full text-left p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                        p.id === selectedPatient?.id
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={p.photoUrl || '/logo.jpg'}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{p.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {p.id} • {p.mobile}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold shrink-0">
                        {p.bloodGroup || 'O+'}
                      </span>
                    </button>
                  ))}
                  {filteredPatients.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No matching patients found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Record Vitals Button */}
          <Button
            variant="success"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsRecordModalOpen(true)}
          >
            + Record Vitals
          </Button>

          {/* Full Patient Profile Link */}
          {selectedPatient && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<User className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/patients/${selectedPatient.id}`)}
              title="Open full clinical chart"
            >
              Full Profile
            </Button>
          )}
        </div>
      </div>

      {/* Selected Patient Bio-Strip Banner */}
      {selectedPatient && (
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Active Patient: <span className="text-blue-600 dark:text-blue-400 font-black">{selectedPatient.fullName}</span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-300">
              Age: <strong className="text-slate-900 dark:text-white">{selectedPatient.age} Yrs</strong> ({selectedPatient.gender.toUpperCase()})
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-300">
              Blood Group: <strong className="text-rose-600 dark:text-rose-400">{selectedPatient.bloodGroup || 'O+'}</strong>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-300 font-mono">
              Total Logged Entries: <strong className="text-slate-900 dark:text-white">{summary.totalCount}</strong>
            </span>
          </div>

          {summary.lastUpdated && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last Checked: {formatDateTime(summary.lastUpdated)}</span>
            </div>
          )}
        </div>
      )}

      {/* 4 Vitals Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blood Pressure Card */}
        <div
          onClick={() => setActiveMetricView('bp')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeMetricView === 'bp'
              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-400 dark:border-rose-700 shadow-md ring-2 ring-rose-400/20'
              : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Blood Pressure
              </span>
            </div>
            {summary.bp.trend === 'down' ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                <TrendingDown className="w-3 h-3" /> {Math.abs(summary.bp.deltaSystolic)} mmHg
              </span>
            ) : summary.bp.trend === 'up' ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3" /> +{summary.bp.deltaSystolic} mmHg
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                <Minus className="w-3 h-3" /> Stable
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                {summary.bp.systolic} / {summary.bp.diastolic}
              </span>
              <span className="text-xs text-slate-400 font-bold">mmHg</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${summary.bp.badgeColor}`}>
                {summary.bp.label}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span>MAP: <strong className="text-slate-800 dark:text-slate-200">{summary.bp.map} mmHg</strong></span>
            <span>Pulse Pres: <strong className="text-slate-800 dark:text-slate-200">{summary.bp.pulsePressure} mmHg</strong></span>
          </div>
        </div>

        {/* Heart Rate / Pulse Card */}
        <div
          onClick={() => setActiveMetricView('heart_rate')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeMetricView === 'heart_rate'
              ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-400 dark:border-teal-700 shadow-md ring-2 ring-teal-400/20'
              : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Heart Rate (Pulse)
              </span>
            </div>
            {summary.heartRate.trend === 'down' ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded">
                <TrendingDown className="w-3 h-3" /> {Math.abs(summary.heartRate.delta)} bpm
              </span>
            ) : summary.heartRate.trend === 'up' ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3" /> +{summary.heartRate.delta} bpm
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                <Minus className="w-3 h-3" /> Stable
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                {summary.heartRate.value}
              </span>
              <span className="text-xs text-slate-400 font-bold">BPM</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${summary.heartRate.badgeColor}`}>
                {summary.heartRate.label}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span>Resting Target: <strong className="text-slate-800 dark:text-slate-200">60-100</strong></span>
            <span>Rhythm: <strong className="text-teal-600 dark:text-teal-400">Regular Sinus</strong></span>
          </div>
        </div>

        {/* Blood Glucose / Sugar Card */}
        <div
          onClick={() => setActiveMetricView('glucose')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeMetricView === 'glucose'
              ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-700 shadow-md ring-2 ring-indigo-400/20'
              : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Droplet className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Blood Glucose
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
              {summary.glucose.type.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                {summary.glucose.value}
              </span>
              <span className="text-xs text-slate-400 font-bold">mg/dL</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${summary.glucose.badgeColor}`}>
                {summary.glucose.label}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span>HbA1c Approx: <strong className="text-slate-800 dark:text-slate-200">~{((summary.glucose.value + 46.7) / 28.7).toFixed(1)}%</strong></span>
            <span>Target: <strong className="text-indigo-600 dark:text-indigo-400">&lt;140 mg/dL</strong></span>
          </div>
        </div>

        {/* Secondary Parameters (Oxygen, Temp, BMI) */}
        <div
          onClick={() => setActiveMetricView('combined')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            activeMetricView === 'combined'
              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-400 dark:border-blue-700 shadow-md ring-2 ring-blue-400/20'
              : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Oxygen & Body Temp
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              {summary.overallRisk.toUpperCase()} RISK
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">SpO2 Oxygen</span>
              <div className="flex items-baseline gap-1">
                <strong className="text-xl font-black text-slate-900 dark:text-white font-display">
                  {summary.secondary.spo2 || 99}
                </strong>
                <span className="text-[10px] text-slate-400">%</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Temperature</span>
              <div className="flex items-baseline gap-1">
                <strong className="text-xl font-black text-slate-900 dark:text-white font-display">
                  {summary.secondary.temperature || 98.4}
                </strong>
                <span className="text-[10px] text-slate-400">°F</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span>BMI: <strong className="text-slate-800 dark:text-slate-200">{summary.secondary.bmi || '24.2'}</strong></span>
            <span>Weight: <strong className="text-slate-800 dark:text-slate-200">{summary.secondary.weightKg || '70'} kg</strong></span>
          </div>
        </div>
      </div>

      {/* Chart Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Metric View Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-xs">
          <button
            onClick={() => setActiveMetricView('combined')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeMetricView === 'combined'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All Vitals Combined
          </button>
          <button
            onClick={() => setActiveMetricView('bp')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeMetricView === 'bp'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Blood Pressure (mmHg)
          </button>
          <button
            onClick={() => setActiveMetricView('heart_rate')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeMetricView === 'heart_rate'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Heart Rate (BPM)
          </button>
          <button
            onClick={() => setActiveMetricView('glucose')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeMetricView === 'glucose'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            Glucose (mg/dL)
          </button>
        </div>

        {/* Time Range Filters & Table Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[11px] font-bold">
            {(['7d', '14d', '30d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRangeFilter(range)}
                className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                  timeRangeFilter === range
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowHistoryTable(!showHistoryTable)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5" />
            {showHistoryTable ? 'Hide Table' : 'Log History'}
          </button>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/90 relative">
        <div className="h-72 sm:h-80 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 animate-pulse" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No vitals data recorded in this range.
              </p>
              <Button size="sm" variant="success" onClick={() => setIsRecordModalOpen(true)}>
                Record First Reading
              </Button>
            </div>
          ) : activeMetricView === 'combined' ? (
            /* All Vitals Combined Multi-Line Chart */
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="sysGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gluGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.15} />
                <XAxis dataKey="date" fontSize={11} stroke="#94A3B8" tickLine={false} />
                <YAxis domain={['auto', 'auto']} fontSize={11} stroke="#94A3B8" tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 600 }}
                  iconType="circle"
                />

                {/* Reference Baseline Lines */}
                <ReferenceLine y={120} stroke="#E11D48" strokeDasharray="4 4" opacity={0.4} label={{ value: '120 mmHg (Normal Sys)', position: 'insideTopRight', fill: '#E11D48', fontSize: 9 }} />
                <ReferenceLine y={80} stroke="#F59E0B" strokeDasharray="4 4" opacity={0.4} label={{ value: '80 mmHg (Normal Dia)', position: 'insideTopRight', fill: '#F59E0B', fontSize: 9 }} />
                <ReferenceLine y={100} stroke="#6366F1" strokeDasharray="4 4" opacity={0.4} label={{ value: '100 mg/dL (Fasting Sugar)', position: 'insideBottomRight', fill: '#6366F1', fontSize: 9 }} />

                <Area type="monotone" dataKey="bpSystolic" name="BP Systolic (mmHg)" stroke="#E11D48" fillOpacity={1} fill="url(#sysGradient)" strokeWidth={2.5} dot={{ r: 4, fill: '#E11D48' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="bpDiastolic" name="BP Diastolic (mmHg)" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3.5, fill: '#F59E0B' }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="pulseRate" name="Heart Rate (BPM)" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 4, fill: '#0D9488' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="bloodSugar" name="Blood Glucose (mg/dL)" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366F1' }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : activeMetricView === 'bp' ? (
            /* Dedicated Blood Pressure Chart */
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="bpAreaSys" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="bpAreaDia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.15} />
                <XAxis dataKey="date" fontSize={11} stroke="#94A3B8" tickLine={false} />
                <YAxis domain={[50, 180]} fontSize={11} stroke="#94A3B8" tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 600 }} iconType="circle" />

                <ReferenceLine y={120} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Optimal Systolic (<120)', position: 'insideTopLeft', fill: '#10B981', fontSize: 10 }} />
                <ReferenceLine y={140} stroke="#E11D48" strokeDasharray="3 3" label={{ value: 'Hypertension Stage 2 (≥140)', position: 'insideTopLeft', fill: '#E11D48', fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Optimal Diastolic (<80)', position: 'insideBottomLeft', fill: '#10B981', fontSize: 10 }} />

                <Area type="monotone" dataKey="bpSystolic" name="Systolic BP (mmHg)" stroke="#E11D48" fill="url(#bpAreaSys)" strokeWidth={3} dot={{ r: 4.5, fill: '#E11D48' }} activeDot={{ r: 6.5 }} />
                <Area type="monotone" dataKey="bpDiastolic" name="Diastolic BP (mmHg)" stroke="#F59E0B" fill="url(#bpAreaDia)" strokeWidth={2.5} dot={{ r: 4, fill: '#F59E0B' }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : activeMetricView === 'heart_rate' ? (
            /* Dedicated Heart Rate / Pulse Chart */
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="hrAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.15} />
                <XAxis dataKey="date" fontSize={11} stroke="#94A3B8" tickLine={false} />
                <YAxis domain={[40, 140]} fontSize={11} stroke="#94A3B8" tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 600 }} iconType="circle" />

                <ReferenceLine y={60} stroke="#0D9488" strokeDasharray="4 4" label={{ value: 'Resting Lower Limit (60 BPM)', position: 'insideBottomLeft', fill: '#0D9488', fontSize: 10 }} />
                <ReferenceLine y={100} stroke="#E11D48" strokeDasharray="4 4" label={{ value: 'Tachycardia Threshold (100 BPM)', position: 'insideTopLeft', fill: '#E11D48', fontSize: 10 }} />

                <Area type="monotone" dataKey="pulseRate" name="Heart Rate (BPM)" stroke="#0D9488" fill="url(#hrAreaGradient)" strokeWidth={3} dot={{ r: 5, fill: '#0D9488' }} activeDot={{ r: 7 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            /* Dedicated Blood Glucose Chart */
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="gluAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.15} />
                <XAxis dataKey="date" fontSize={11} stroke="#94A3B8" tickLine={false} />
                <YAxis domain={[50, 240]} fontSize={11} stroke="#94A3B8" tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 600 }} iconType="circle" />

                <ReferenceLine y={100} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Normal Fasting Target (<100 mg/dL)', position: 'insideBottomLeft', fill: '#10B981', fontSize: 10 }} />
                <ReferenceLine y={140} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Normal Post-Meal Target (<140 mg/dL)', position: 'insideTopLeft', fill: '#F59E0B', fontSize: 10 }} />
                <ReferenceLine y={199} stroke="#E11D48" strokeDasharray="4 4" label={{ value: 'Elevated Threshold (≥200 mg/dL)', position: 'insideTopLeft', fill: '#E11D48', fontSize: 10 }} />

                <Area type="monotone" dataKey="bloodSugar" name="Blood Glucose (mg/dL)" stroke="#6366F1" fill="url(#gluAreaGradient)" strokeWidth={3} dot={{ r: 5, fill: '#6366F1' }} activeDot={{ r: 7 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Clinical Notes & Insights Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 dark:text-white block">
              AI Clinical Vitals Assessment (AHA & ADA Guidelines)
            </span>
            <p className="text-slate-600 dark:text-slate-300">
              {summary.clinicalInsights[0] || 'Vital parameters evaluated within expected physiological boundaries.'}
            </p>
          </div>
        </div>

        {selectedPatient && (
          <button
            onClick={() => navigate(`/patients/${selectedPatient.id}`)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 self-end sm:self-center"
          >
            Doctor EMR Chart <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Historical Log Entries Table (Collapsible) */}
      {showHistoryTable && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Historical Vitals Log Stream ({filteredVitals.length} entries)
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              Patient ID: {selectedPatient?.id}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Blood Pressure</th>
                  <th className="py-2.5 px-3">Heart Rate</th>
                  <th className="py-2.5 px-3">Blood Sugar</th>
                  <th className="py-2.5 px-3">SpO2 / Temp</th>
                  <th className="py-2.5 px-3">BMI / Wt</th>
                  <th className="py-2.5 px-3">Clinical Notes</th>
                  <th className="py-2.5 px-3">Staff</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {filteredVitals.slice().reverse().map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {formatDateTime(v.recordedAt)}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-bold text-rose-600 dark:text-rose-400">
                      {v.bpSystolic} / {v.bpDiastolic} <span className="text-[10px] font-normal text-slate-400">mmHg</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-bold text-teal-600 dark:text-teal-400">
                      {v.pulseRate} <span className="text-[10px] font-normal text-slate-400">BPM</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-bold text-indigo-600 dark:text-indigo-400">
                      {v.bloodSugar} <span className="text-[10px] font-normal text-slate-400">mg/dL</span>
                      <span className="text-[10px] ml-1 px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-sans">
                        {v.sugarType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {v.spo2 || 99}% • {v.temperature || 98.4}°F
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {v.bmi || '24.2'} ({v.weightKg || 70}kg)
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate font-sans">
                      {v.notes || 'Routine check'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-sans">
                      {v.recordedBy || 'OPD Nurse'}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-sans">
                      <button
                        onClick={() => handleDeleteVitals(v.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record New Vitals Modal */}
      {selectedPatient && (
        <Modal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          title={`Record Vitals: ${selectedPatient.fullName}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveVitals} className="space-y-4 text-xs">
            {/* Patient Header Strip */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedPatient.photoUrl || '/logo.jpg'}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                    {selectedPatient.fullName}
                  </strong>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ID: {selectedPatient.id} • {selectedPatient.age} Yrs • {selectedPatient.gender.toUpperCase()}
                  </span>
                </div>
              </div>
              <span className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                {selectedPatient.bloodGroup || 'O+'} Blood Group
              </span>
            </div>

            {/* Core Trio: Blood Pressure, Heart Rate, Blood Sugar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BP Systolic & Diastolic */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-2.5">
                <label className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-600" />
                  Blood Pressure (mmHg)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Systolic (mmHg)"
                    type="number"
                    value={modalBpSystolic}
                    onChange={e => setModalBpSystolic(e.target.value === '' ? '' : Number(e.target.value))}
                    min={60}
                    max={260}
                    required
                  />
                  <Input
                    label="Diastolic (mmHg)"
                    type="number"
                    value={modalBpDiastolic}
                    onChange={e => setModalBpDiastolic(e.target.value === '' ? '' : Number(e.target.value))}
                    min={40}
                    max={160}
                    required
                  />
                </div>
                <div className="text-[11px] text-rose-700 dark:text-rose-300 font-mono flex items-center justify-between pt-1">
                  <span>Pulse Pressure: {Number(modalBpSystolic || 120) - Number(modalBpDiastolic || 80)} mmHg</span>
                  <span>MAP: {Math.round(Number(modalBpDiastolic || 80) + (Number(modalBpSystolic || 120) - Number(modalBpDiastolic || 80)) / 3)} mmHg</span>
                </div>
              </div>

              {/* Heart Rate / Pulse */}
              <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 space-y-2.5">
                <label className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-teal-600" />
                  Heart Rate / Pulse Rate
                </label>
                <Input
                  label="Pulse (BPM)"
                  type="number"
                  value={modalPulseRate}
                  onChange={e => setModalPulseRate(e.target.value === '' ? '' : Number(e.target.value))}
                  min={30}
                  max={220}
                  required
                />
                <p className="text-[11px] text-teal-700 dark:text-teal-300">
                  Target resting threshold: 60 - 100 BPM (Normal Sinus Rhythm)
                </p>
              </div>
            </div>

            {/* Blood Glucose & Test Type */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 space-y-2.5">
              <label className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-indigo-600" />
                Blood Glucose / Sugar Level (mg/dL)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Glucose Level (mg/dL)"
                  type="number"
                  value={modalBloodSugar}
                  onChange={e => setModalBloodSugar(e.target.value === '' ? '' : Number(e.target.value))}
                  min={30}
                  max={600}
                  required
                />

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Sugar Test Condition</label>
                  <select
                    value={modalSugarType}
                    onChange={e => setModalSugarType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="fasting">Fasting Blood Sugar (FBS - 8+ hrs fast)</option>
                    <option value="post_prandial">Post-Prandial (PPBS - 2 hrs post-meal)</option>
                    <option value="random">Random Blood Sugar (RBS)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Secondary Parameters: SpO2, Temperature, Weight, Height */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="SpO2 (%)"
                type="number"
                value={modalSpo2}
                onChange={e => setModalSpo2(e.target.value === '' ? '' : Number(e.target.value))}
                min={70}
                max={100}
              />
              <Input
                label="Temp (°F)"
                type="number"
                step="0.1"
                value={modalTemperature}
                onChange={e => setModalTemperature(e.target.value === '' ? '' : Number(e.target.value))}
                min={90}
                max={108}
              />
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                value={modalWeightKg}
                onChange={e => setModalWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                min={2}
                max={250}
              />
              <Input
                label="Height (cm)"
                type="number"
                value={modalHeightCm}
                onChange={e => setModalHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
                min={30}
                max={250}
              />
            </div>

            {/* Notes & Recorded By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Clinical Observations / Notes"
                placeholder="e.g. Pre-meal baseline, relaxed posture..."
                value={modalNotes}
                onChange={e => setModalNotes(e.target.value)}
              />
              <Input
                label="Recorded By (Staff / Doctor)"
                placeholder="e.g. Dr. Roy / OPD Nurse Triage"
                value={modalRecordedBy}
                onChange={e => setModalRecordedBy(e.target.value)}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsRecordModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="success" leftIcon={<Plus className="w-4 h-4" />}>
                Save & Update Vitals Chart
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
