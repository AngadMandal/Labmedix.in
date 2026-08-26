import React, { useState, useEffect } from 'react';
import { Patient, ClinicalVitals } from '../../types';
import { StorageService } from '../../services/storage';
import { EMRService } from '../../services/emrService';
import { AuditService } from '../../services/auditService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  Activity,
  Heart,
  Droplet,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Trash2,
  Sparkles,
  Scale,
  Gauge,
  Thermometer
} from 'lucide-react';
import {
  ResponsiveContainer,
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

export interface VitalsRecord {
  id: string;
  patientId: string;
  recordedAt: string;
  bpSystolic: number;
  bpDiastolic: number;
  pulseRate: number;
  bloodSugar: number;
  sugarType: 'fasting' | 'post_prandial' | 'random';
  temperature?: number;
  spo2?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: string;
  notes?: string;
  recordedBy?: string;
}

interface PatientVitalsModuleProps {
  patient: Patient;
  className?: string;
}

export const PatientVitalsModule: React.FC<PatientVitalsModuleProps> = ({ patient, className = '' }) => {
  const { showToast } = useToast();
  const [vitalsList, setVitalsList] = useState<VitalsRecord[]>([]);
  const [activeChart, setActiveChart] = useState<'all' | 'bp' | 'pulse' | 'glucose' | 'bmi'>('all');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form State
  const [bpSystolic, setBpSystolic] = useState<number | ''>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number | ''>(80);
  const [pulseRate, setPulseRate] = useState<number | ''>(74);
  const [bloodSugar, setBloodSugar] = useState<number | ''>(105);
  const [sugarType, setSugarType] = useState<'fasting' | 'post_prandial' | 'random'>('random');
  const [temperature, setTemperature] = useState<number | ''>(98.4);
  const [spo2, setSpo2] = useState<number | ''>(99);
  const [weightKg, setWeightKg] = useState<number | ''>(68);
  const [heightCm, setHeightCm] = useState<number | ''>(168);
  const [notes, setNotes] = useState('');

  // Storage Key
  const storageKey = `labmedix_patient_vitals_${patient.id}`;

  // Initial Load with Fallback / Seed from EMR Encounters
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setVitalsList(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Error parsing vitals:', e);
      }
    }

    // Seed from existing EMR encounters if available
    const encounters = EMRService.getEncountersByPatient(patient.id);
    const initialRecords: VitalsRecord[] = [];

    encounters.forEach((enc) => {
      if (enc.vitals) {
        initialRecords.push({
          id: `vit_${enc.id}`,
          patientId: patient.id,
          recordedAt: enc.date || enc.createdAt,
          bpSystolic: enc.vitals.bpSystolic || 120,
          bpDiastolic: enc.vitals.bpDiastolic || 80,
          pulseRate: enc.vitals.pulseRate || 75,
          bloodSugar: enc.vitals.bloodSugar || 110,
          sugarType: 'random',
          temperature: enc.vitals.temperature || 98.4,
          spo2: enc.vitals.spo2 || 99,
          weightKg: enc.vitals.weightKg || 70,
          heightCm: enc.vitals.heightCm || 170,
          bmi: enc.vitals.bmi || '24.2',
          notes: `Routine consultation vitals check by ${enc.doctorName}`,
          recordedBy: enc.doctorName
        });
      }
    });

    // If still empty, create realistic historical timeline records for rich trend analysis
    if (initialRecords.length === 0) {
      const now = new Date();
      const sampleDates = [
        new Date(now.getTime() - 45 * 24 * 3600 * 1000).toISOString(),
        new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(),
        new Date(now.getTime() - 15 * 24 * 3600 * 1000).toISOString(),
        new Date(now.getTime() - 3 * 24 * 3600 * 1000).toISOString(),
        now.toISOString()
      ];

      const samples: VitalsRecord[] = [
        {
          id: 'vit_sample_1',
          patientId: patient.id,
          recordedAt: sampleDates[0],
          bpSystolic: 136,
          bpDiastolic: 88,
          pulseRate: 84,
          bloodSugar: 142,
          sugarType: 'post_prandial',
          temperature: 98.6,
          spo2: 98,
          weightKg: 73,
          heightCm: 170,
          bmi: '25.3',
          notes: 'Initial OPD baseline assessment',
          recordedBy: 'Clinical Nurse Triage'
        },
        {
          id: 'vit_sample_2',
          patientId: patient.id,
          recordedAt: sampleDates[1],
          bpSystolic: 130,
          bpDiastolic: 84,
          pulseRate: 78,
          bloodSugar: 118,
          sugarType: 'fasting',
          temperature: 98.4,
          spo2: 99,
          weightKg: 72,
          heightCm: 170,
          bmi: '24.9',
          notes: 'Post-medication review',
          recordedBy: 'Dr. Subhashish Roy'
        },
        {
          id: 'vit_sample_3',
          patientId: patient.id,
          recordedAt: sampleDates[2],
          bpSystolic: 124,
          bpDiastolic: 82,
          pulseRate: 76,
          bloodSugar: 110,
          sugarType: 'random',
          temperature: 98.2,
          spo2: 99,
          weightKg: 71.5,
          heightCm: 170,
          bmi: '24.7',
          notes: 'Routine follow-up check',
          recordedBy: 'Clinical Nurse Triage'
        },
        {
          id: 'vit_sample_4',
          patientId: patient.id,
          recordedAt: sampleDates[3],
          bpSystolic: 122,
          bpDiastolic: 80,
          pulseRate: 72,
          bloodSugar: 104,
          sugarType: 'fasting',
          temperature: 98.4,
          spo2: 100,
          weightKg: 71,
          heightCm: 170,
          bmi: '24.6',
          notes: 'Pre-procedure vitals clearance',
          recordedBy: 'Dr. Anita Sen'
        },
        {
          id: 'vit_sample_5',
          patientId: patient.id,
          recordedAt: sampleDates[4],
          bpSystolic: 118,
          bpDiastolic: 78,
          pulseRate: 70,
          bloodSugar: 98,
          sugarType: 'fasting',
          temperature: 98.4,
          spo2: 99,
          weightKg: 70.5,
          heightCm: 170,
          bmi: '24.4',
          notes: 'Optimal healthy response & normal vitals',
          recordedBy: 'Clinical Nurse Triage'
        }
      ];

      setVitalsList(samples);
      localStorage.setItem(storageKey, JSON.stringify(samples));
      return;
    }

    setVitalsList(initialRecords);
    localStorage.setItem(storageKey, JSON.stringify(initialRecords));
  }, [patient.id]);

  const saveVitalsList = (newList: VitalsRecord[]) => {
    setVitalsList(newList);
    localStorage.setItem(storageKey, JSON.stringify(newList));
  };

  const handleAddVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const sys = Number(bpSystolic) || 120;
    const dia = Number(bpDiastolic) || 80;
    const pulse = Number(pulseRate) || 72;
    const sugar = Number(bloodSugar) || 100;
    const temp = Number(temperature) || 98.4;
    const ox = Number(spo2) || 99;
    const wt = Number(weightKg) || 70;
    const ht = Number(heightCm) || 170;

    let calcBmi = '24.0';
    if (wt > 0 && ht > 0) {
      const heightInMeters = ht / 100;
      calcBmi = (wt / (heightInMeters * heightInMeters)).toFixed(1);
    }

    const newRecord: VitalsRecord = {
      id: `vit_${Date.now()}`,
      patientId: patient.id,
      recordedAt: new Date().toISOString(),
      bpSystolic: sys,
      bpDiastolic: dia,
      pulseRate: pulse,
      bloodSugar: sugar,
      sugarType: sugarType,
      temperature: temp,
      spo2: ox,
      weightKg: wt,
      heightCm: ht,
      bmi: calcBmi,
      notes: notes.trim() || 'Direct vitals logging',
      recordedBy: 'Clinical Staff'
    };

    const updated = [...vitalsList, newRecord].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );

    saveVitalsList(updated);
    setIsLogModalOpen(false);
    setNotes('');
    AuditService.log('PATIENT_VITALS_RECORDED', 'patient', `Logged new vitals for ${patient.fullName}: BP ${sys}/${dia}, Pulse ${pulse}, Glucose ${sugar} mg/dL`);
    showToast('success', 'Vitals Recorded', `BP ${sys}/${dia} mmHg, Pulse ${pulse} bpm, Glucose ${sugar} mg/dL.`);
  };

  const handleDeleteRecord = (id: string) => {
    const filtered = vitalsList.filter(v => v.id !== id);
    saveVitalsList(filtered);
    showToast('info', 'Record Deleted', 'Vitals entry removed from timeline.');
  };

  // Latest Vitals Assessment
  const latest = vitalsList[vitalsList.length - 1];

  // Clinical Status Evaluation
  const getBpStatus = (sys?: number, dia?: number) => {
    if (!sys || !dia) return { label: 'Unknown', color: 'text-slate-400', bg: 'bg-slate-800' };
    if (sys < 120 && dia < 80) return { label: 'Normal / Optimal', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-500/40' };
    if (sys <= 129 && dia < 80) return { label: 'Elevated BP', color: 'text-yellow-400', bg: 'bg-yellow-950/60 border-yellow-500/40' };
    if (sys <= 139 || dia <= 89) return { label: 'Stage 1 Hypertension', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-500/40' };
    return { label: 'Stage 2 Hypertension', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-500/40' };
  };

  const getGlucoseStatus = (sugar?: number, type?: string) => {
    if (!sugar) return { label: 'Unknown', color: 'text-slate-400', bg: 'bg-slate-800' };
    if (type === 'fasting') {
      if (sugar < 100) return { label: 'Normal Fasting', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-500/40' };
      if (sugar <= 125) return { label: 'Pre-diabetes (Impaired Fasting)', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-500/40' };
      return { label: 'Elevated / Diabetic Range', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-500/40' };
    }
    if (sugar < 140) return { label: 'Normal Euglycemic', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-500/40' };
    if (sugar <= 199) return { label: 'Pre-diabetic Range', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-500/40' };
    return { label: 'Hyperglycemia (>200 mg/dL)', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-500/40' };
  };

  const getPulseStatus = (pulse?: number) => {
    if (!pulse) return { label: 'Unknown', color: 'text-slate-400' };
    if (pulse < 60) return { label: 'Bradycardia (<60 bpm)', color: 'text-blue-400' };
    if (pulse <= 100) return { label: 'Normal Resting (60-100)', color: 'text-emerald-400' };
    return { label: 'Tachycardia (>100 bpm)', color: 'text-rose-400' };
  };

  const bpStatus = getBpStatus(latest?.bpSystolic, latest?.bpDiastolic);
  const glucoseStatus = getGlucoseStatus(latest?.bloodSugar, latest?.sugarType);
  const pulseStatus = getPulseStatus(latest?.pulseRate);

  // Format Recharts data with friendly date labels
  const chartData = vitalsList.map((v) => ({
    date: formatDate(v.recordedAt),
    rawDate: v.recordedAt,
    bpSystolic: v.bpSystolic,
    bpDiastolic: v.bpDiastolic,
    pulseRate: v.pulseRate,
    bloodSugar: v.bloodSugar,
    spo2: v.spo2 || 99,
    weightKg: v.weightKg || 70,
    bmi: parseFloat(v.bmi || '24.0')
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Header & Fast Log Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500" />
            Patient Clinical Vitals & Real-Time Trend Analysis
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous hemodynamic tracking for Blood Pressure, Pulse, Glucose, BMI & Oxygenation.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsLogModalOpen(true)}
          className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md font-bold"
        >
          + Log New Vitals
        </Button>
      </div>

      {/* 4 Live Vitals Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Blood Pressure */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] uppercase font-bold text-slate-400 flex items-center gap-1 font-mono">
              <Gauge className="w-3.5 h-3.5 text-rose-500" />
              Blood Pressure (BP)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">mmHg</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <strong className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {latest ? `${latest.bpSystolic}/${latest.bpDiastolic}` : '--/--'}
            </strong>
          </div>

          <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border inline-block ${bpStatus.bg} ${bpStatus.color}`}>
            {bpStatus.label}
          </div>
        </div>

        {/* Card 2: Pulse / Heart Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] uppercase font-bold text-slate-400 flex items-center gap-1 font-mono">
              <Heart className="w-3.5 h-3.5 text-red-500" />
              Pulse / Heart Rate
            </span>
            <span className="text-[10px] text-slate-400 font-mono">BPM</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <strong className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {latest?.pulseRate || '--'}
            </strong>
            <span className="text-xs text-slate-400 font-mono">bpm</span>
          </div>

          <div className={`text-[10.5px] font-bold ${pulseStatus.color}`}>
            {pulseStatus.label}
          </div>
        </div>

        {/* Card 3: Blood Glucose */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] uppercase font-bold text-slate-400 flex items-center gap-1 font-mono">
              <Droplet className="w-3.5 h-3.5 text-amber-500" />
              Blood Glucose Level
            </span>
            <span className="text-[10px] text-slate-400 font-mono">mg/dL</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <strong className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {latest?.bloodSugar || '--'}
            </strong>
            <span className="text-xs text-slate-400 font-mono uppercase">({latest?.sugarType || 'Random'})</span>
          </div>

          <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border inline-block ${glucoseStatus.bg} ${glucoseStatus.color}`}>
            {glucoseStatus.label}
          </div>
        </div>

        {/* Card 4: BMI & Weight */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] uppercase font-bold text-slate-400 flex items-center gap-1 font-mono">
              <Scale className="w-3.5 h-3.5 text-teal-500" />
              Weight & BMI Index
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{latest?.weightKg || '--'} kg</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <strong className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {latest?.bmi || '24.0'}
            </strong>
            <span className="text-xs text-slate-400 font-mono">kg/m²</span>
          </div>

          <div className="text-[10.5px] font-bold text-teal-400">
            SpO2: {latest?.spo2 || 99}% • Temp: {latest?.temperature || 98.4}°F
          </div>
        </div>
      </div>

      {/* Interactive Trend Chart Switcher */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-blue" />
              Longitudinal Clinical Trend Visualization
            </h4>
            <span className="text-xs text-slate-400">Plotted across {chartData.length} timeline milestones</span>
          </div>

          {/* Chart Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold font-mono">
            <button
              onClick={() => setActiveChart('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeChart === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              All Metrics
            </button>
            <button
              onClick={() => setActiveChart('bp')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeChart === 'bp' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              Blood Pressure
            </button>
            <button
              onClick={() => setActiveChart('pulse')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeChart === 'pulse' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              Pulse (BPM)
            </button>
            <button
              onClick={() => setActiveChart('glucose')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeChart === 'glucose' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              Glucose
            </button>
            <button
              onClick={() => setActiveChart('bmi')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeChart === 'bmi' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              Weight & BMI
            </button>
          </div>
        </div>

        {/* Dynamic Recharts Canvas */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === 'all' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" fontSize={11} stroke="#94A3B8" />
                <YAxis fontSize={11} stroke="#94A3B8" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="bpSystolic" name="BP Systolic (mmHg)" stroke="#F43F5E" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="bpDiastolic" name="BP Diastolic (mmHg)" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="pulseRate" name="Pulse Rate (BPM)" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="bloodSugar" name="Blood Glucose (mg/dL)" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
              </LineChart>
            ) : activeChart === 'bp' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" fontSize={11} stroke="#94A3B8" />
                <YAxis fontSize={11} stroke="#94A3B8" domain={[50, 180]} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine y={120} label="Target Systolic (120)" stroke="#10B981" strokeDasharray="3 3" />
                <ReferenceLine y={80} label="Target Diastolic (80)" stroke="#3B82F6" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="bpSystolic" name="Systolic (mmHg)" stroke="#F43F5E" strokeWidth={3} dot={{ r: 5, fill: '#F43F5E' }} />
                <Line type="monotone" dataKey="bpDiastolic" name="Diastolic (mmHg)" stroke="#0284C7" strokeWidth={3} dot={{ r: 5, fill: '#0284C7' }} />
              </LineChart>
            ) : activeChart === 'pulse' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" fontSize={11} stroke="#94A3B8" />
                <YAxis fontSize={11} stroke="#94A3B8" domain={[50, 130]} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none' }} />
                <ReferenceLine y={100} label="Tachycardia (>100)" stroke="#F87171" strokeDasharray="3 3" />
                <ReferenceLine y={60} label="Bradycardia (<60)" stroke="#60A5FA" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="pulseRate" name="Pulse (BPM)" stroke="#EF4444" strokeWidth={3} fill="url(#pulseGradient)" dot={{ r: 4 }} />
              </AreaChart>
            ) : activeChart === 'glucose' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" fontSize={11} stroke="#94A3B8" />
                <YAxis fontSize={11} stroke="#94A3B8" domain={[60, 220]} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine y={100} label="Normal Fasting (100)" stroke="#10B981" strokeDasharray="3 3" />
                <ReferenceLine y={140} label="Pre-diabetes (140)" stroke="#F59E0B" strokeDasharray="3 3" />
                <ReferenceLine y={200} label="Diabetes Threshold (200)" stroke="#EF4444" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="bloodSugar" name="Blood Glucose (mg/dL)" stroke="#F59E0B" strokeWidth={3} dot={{ r: 5, fill: '#F59E0B' }} />
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" fontSize={11} stroke="#94A3B8" />
                <YAxis fontSize={11} stroke="#94A3B8" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none' }} />
                <Area type="monotone" dataKey="weightKg" name="Weight (kg)" stroke="#14B8A6" strokeWidth={3} fill="url(#weightGradient)" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="bmi" name="BMI Index" stroke="#6366F1" strokeWidth={2} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Vitals Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Detailed Vitals History Log
          </h4>
          <span className="text-xs text-slate-400 font-mono">{vitalsList.length} Total Logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] font-bold text-slate-500 font-mono">
              <tr>
                <th className="px-4 py-3">Recorded Date</th>
                <th className="px-4 py-3">Blood Pressure</th>
                <th className="px-4 py-3">Pulse</th>
                <th className="px-4 py-3">Glucose Level</th>
                <th className="px-4 py-3">SpO2 / Temp</th>
                <th className="px-4 py-3">Weight / BMI</th>
                <th className="px-4 py-3">Notes & Staff</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...vitalsList].reverse().map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono">
                    <span className="block font-bold text-slate-900 dark:text-white">{formatDate(v.recordedAt)}</span>
                    <span className="text-[10px] text-slate-400">{new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-rose-500">
                    {v.bpSystolic}/{v.bpDiastolic} <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-red-500">
                    {v.pulseRate} <span className="text-[10px] text-slate-400 font-normal">bpm</span>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <strong className="text-amber-500">{v.bloodSugar}</strong> <span className="text-[10px] text-slate-400">mg/dL ({v.sugarType})</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                    {v.spo2 || 99}% • {v.temperature || 98.4}°F
                  </td>
                  <td className="px-4 py-3 font-mono text-teal-600 dark:text-teal-400 font-bold">
                    {v.weightKg || '--'} kg <span className="text-[10px] text-slate-400 font-normal">(BMI {v.bmi})</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="block truncate text-slate-700 dark:text-slate-300 font-medium">{v.notes || '--'}</span>
                    <span className="text-[10px] text-slate-400 block">{v.recordedBy || 'Clinical Staff'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteRecord(v.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log New Vitals Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Patient Clinical Vitals"
      >
        <form onSubmit={handleAddVitals} className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200">
            <strong>{patient.fullName}</strong> • UHID: {patient.id} • Age: {patient.age} Y ({patient.gender.toUpperCase()})
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="BP Systolic (mmHg)"
              type="number"
              value={bpSystolic}
              onChange={(e) => setBpSystolic(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 120"
              required
            />
            <Input
              label="BP Diastolic (mmHg)"
              type="number"
              value={bpDiastolic}
              onChange={(e) => setBpDiastolic(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 80"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Pulse Rate (BPM)"
              type="number"
              value={pulseRate}
              onChange={(e) => setPulseRate(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 72"
              required
            />
            <div className="space-y-1">
              <Input
                label="Blood Sugar (mg/dL)"
                type="number"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 110"
                required
              />
              <div className="flex gap-2 pt-1 text-[10px] font-mono">
                {(['fasting', 'post_prandial', 'random'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSugarType(type)}
                    className={`px-2 py-0.5 rounded-lg font-bold capitalize ${
                      sugarType === type ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="SpO2 (%)"
              type="number"
              value={spo2}
              onChange={(e) => setSpo2(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="99"
            />
            <Input
              label="Temp (°F)"
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="98.4"
            />
            <Input
              label="Weight (kg)"
              type="number"
              step="0.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="70"
            />
            <Input
              label="Height (cm)"
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="170"
            />
          </div>

          <Input
            label="Clinical Examination Notes / Context"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Patient rested 10 mins prior to measurement, sitting posture"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsLogModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-rose-600 hover:bg-rose-500 font-bold">
              Save Vitals Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
