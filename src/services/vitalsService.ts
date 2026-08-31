import { VitalsRecord, Patient } from '../types';
import { StorageService } from './storage';
import { EMRService } from './emrService';

export interface VitalsMetricAssessment {
  value: number;
  label: string;
  status: 'optimal' | 'normal' | 'elevated' | 'warning' | 'critical';
  badgeColor: string;
  description: string;
}

export interface VitalsSummary {
  latestRecord: VitalsRecord | null;
  previousRecord: VitalsRecord | null;
  bp: {
    systolic: number;
    diastolic: number;
    pulsePressure: number;
    map: number; // Mean Arterial Pressure = Diastolic + 1/3(Systolic - Diastolic)
    status: 'optimal' | 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis' | 'low';
    label: string;
    badgeColor: string;
    deltaSystolic: number;
    trend: 'up' | 'down' | 'stable';
  };
  heartRate: {
    value: number;
    status: 'optimal' | 'normal' | 'tachycardia' | 'bradycardia';
    label: string;
    badgeColor: string;
    delta: number;
    trend: 'up' | 'down' | 'stable';
  };
  glucose: {
    value: number;
    type: 'fasting' | 'post_prandial' | 'random';
    status: 'optimal' | 'normal' | 'pre_diabetes' | 'diabetic' | 'low';
    label: string;
    badgeColor: string;
    delta: number;
    trend: 'up' | 'down' | 'stable';
  };
  secondary: {
    spo2?: number;
    temperature?: number;
    weightKg?: number;
    bmi?: string;
  };
  totalCount: number;
  lastUpdated: string | null;
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  clinicalInsights: string[];
}

export class VitalsService {
  private static getStorageKey(patientId: string): string {
    return `labmedix_patient_vitals_${patientId}`;
  }

  /**
   * Retrieves vitals for a given patient.
   * If no records exist, checks EMR encounters or creates initial realistic timeline samples.
   */
  public static getPatientVitals(patientId: string): VitalsRecord[] {
    const key = this.getStorageKey(patientId);
    const saved = StorageService.getItem<VitalsRecord[] | null>(key, null);

    if (saved && Array.isArray(saved) && saved.length > 0) {
      return [...saved].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    }

    // Attempt seed from EMR encounters
    const encounters = EMRService.getEncountersByPatient(patientId);
    const initialRecords: VitalsRecord[] = [];

    encounters.forEach((enc) => {
      if (enc.vitals && (enc.vitals.bpSystolic || enc.vitals.pulseRate || enc.vitals.bloodSugar)) {
        initialRecords.push({
          id: `vit_${enc.id}`,
          patientId,
          recordedAt: enc.date || enc.createdAt,
          bpSystolic: enc.vitals.bpSystolic || 120,
          bpDiastolic: enc.vitals.bpDiastolic || 80,
          pulseRate: enc.vitals.pulseRate || 75,
          bloodSugar: enc.vitals.bloodSugar || 110,
          sugarType: 'random',
          temperature: enc.vitals.temperature || 98.4,
          spo2: enc.vitals.spo2 || 99,
          respiratoryRate: enc.vitals.respiratoryRate || 16,
          weightKg: enc.vitals.weightKg || 70,
          heightCm: enc.vitals.heightCm || 170,
          bmi: enc.vitals.bmi || '24.2',
          notes: `Routine consultation check by ${enc.doctorName}`,
          recordedBy: enc.doctorName
        });
      }
    });

    if (initialRecords.length > 0) {
      this.savePatientVitals(patientId, initialRecords);
      return initialRecords.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    }

    // Default sample timeline for rich interactive visualization
    const now = new Date();
    const sampleDates = [
      new Date(now.getTime() - 28 * 24 * 3600 * 1000).toISOString(),
      new Date(now.getTime() - 21 * 24 * 3600 * 1000).toISOString(),
      new Date(now.getTime() - 14 * 24 * 3600 * 1000).toISOString(),
      new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString(),
      new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString(),
      now.toISOString()
    ];

    const defaultSamples: VitalsRecord[] = [
      {
        id: `vit_init_1_${patientId}`,
        patientId,
        recordedAt: sampleDates[0],
        bpSystolic: 134,
        bpDiastolic: 86,
        pulseRate: 82,
        bloodSugar: 138,
        sugarType: 'post_prandial',
        temperature: 98.6,
        spo2: 98,
        respiratoryRate: 18,
        weightKg: 73,
        heightCm: 170,
        bmi: '25.3',
        notes: 'Initial triage baseline reading',
        recordedBy: 'Clinical Nurse Triage'
      },
      {
        id: `vit_init_2_${patientId}`,
        patientId,
        recordedAt: sampleDates[1],
        bpSystolic: 128,
        bpDiastolic: 84,
        pulseRate: 78,
        bloodSugar: 116,
        sugarType: 'fasting',
        temperature: 98.4,
        spo2: 99,
        respiratoryRate: 16,
        weightKg: 72.4,
        heightCm: 170,
        bmi: '25.0',
        notes: 'Post-lifestyle modification follow-up',
        recordedBy: 'Dr. Subhashish Roy'
      },
      {
        id: `vit_init_3_${patientId}`,
        patientId,
        recordedAt: sampleDates[2],
        bpSystolic: 124,
        bpDiastolic: 82,
        pulseRate: 76,
        bloodSugar: 110,
        sugarType: 'random',
        temperature: 98.4,
        spo2: 99,
        respiratoryRate: 16,
        weightKg: 71.8,
        heightCm: 170,
        bmi: '24.8',
        notes: 'Mid-month routine checkup',
        recordedBy: 'Clinical Nurse Triage'
      },
      {
        id: `vit_init_4_${patientId}`,
        patientId,
        recordedAt: sampleDates[3],
        bpSystolic: 122,
        bpDiastolic: 80,
        pulseRate: 74,
        bloodSugar: 104,
        sugarType: 'fasting',
        temperature: 98.2,
        spo2: 99,
        respiratoryRate: 16,
        weightKg: 71.2,
        heightCm: 170,
        bmi: '24.6',
        notes: 'Cardiology outpatient review',
        recordedBy: 'Dr. Anita Sen'
      },
      {
        id: `vit_init_5_${patientId}`,
        patientId,
        recordedAt: sampleDates[4],
        bpSystolic: 118,
        bpDiastolic: 78,
        pulseRate: 72,
        bloodSugar: 98,
        sugarType: 'fasting',
        temperature: 98.4,
        spo2: 100,
        respiratoryRate: 15,
        weightKg: 70.8,
        heightCm: 170,
        bmi: '24.5',
        notes: 'Pre-checkup wellness evaluation',
        recordedBy: 'Clinical Nurse Triage'
      },
      {
        id: `vit_init_6_${patientId}`,
        patientId,
        recordedAt: sampleDates[5],
        bpSystolic: 116,
        bpDiastolic: 76,
        pulseRate: 70,
        bloodSugar: 96,
        sugarType: 'fasting',
        temperature: 98.4,
        spo2: 99,
        respiratoryRate: 15,
        weightKg: 70.4,
        heightCm: 170,
        bmi: '24.4',
        notes: 'Optimal healthy recovery trend',
        recordedBy: 'Dr. Subhashish Roy'
      }
    ];

    this.savePatientVitals(patientId, defaultSamples);
    return defaultSamples;
  }

  /**
   * Persists vitals list for a patient and broadcasts event for real-time reactivity
   */
  public static savePatientVitals(patientId: string, records: VitalsRecord[]): void {
    const key = this.getStorageKey(patientId);
    StorageService.setItem(key, records);

    try {
      window.dispatchEvent(
        new CustomEvent('labmedix_vitals_updated', {
          detail: { patientId, count: records.length }
        })
      );
    } catch {}
  }

  /**
   * Appends a new vitals record for a patient
   */
  public static addVitalsRecord(
    patientId: string,
    recordData: Omit<VitalsRecord, 'id' | 'patientId'>
  ): VitalsRecord {
    const existing = this.getPatientVitals(patientId);
    const newRecord: VitalsRecord = {
      id: `vit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      patientId,
      ...recordData
    };

    const updated = [...existing, newRecord];
    this.savePatientVitals(patientId, updated);
    return newRecord;
  }

  /**
   * Deletes a vitals record
   */
  public static deleteVitalsRecord(patientId: string, recordId: string): void {
    const existing = this.getPatientVitals(patientId);
    const updated = existing.filter((r) => r.id !== recordId);
    this.savePatientVitals(patientId, updated);
  }

  /**
   * Evaluates comprehensive clinical summary, AHA/ADA classifications, and trends
   */
  public static calculateVitalsSummary(records: VitalsRecord[]): VitalsSummary {
    if (!records || records.length === 0) {
      return {
        latestRecord: null,
        previousRecord: null,
        bp: {
          systolic: 120,
          diastolic: 80,
          pulsePressure: 40,
          map: 93,
          status: 'normal',
          label: 'Normal (<120/80)',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          deltaSystolic: 0,
          trend: 'stable'
        },
        heartRate: {
          value: 72,
          status: 'normal',
          label: 'Normal Resting',
          badgeColor: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
          delta: 0,
          trend: 'stable'
        },
        glucose: {
          value: 100,
          type: 'random',
          status: 'normal',
          label: 'Normal Glycemia',
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
          delta: 0,
          trend: 'stable'
        },
        secondary: {},
        totalCount: 0,
        lastUpdated: null,
        overallRisk: 'low',
        clinicalInsights: ['No vitals recorded yet. Record baseline parameters.']
      };
    }

    const sorted = [...records].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );

    const latest = sorted[sorted.length - 1];
    const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

    // 1. Blood Pressure Analysis (AHA Guidelines)
    const sys = latest.bpSystolic;
    const dia = latest.bpDiastolic;
    const pulsePressure = sys - dia;
    const map = Math.round(dia + (sys - dia) / 3);

    let bpStatus: VitalsSummary['bp']['status'] = 'normal';
    let bpLabel = 'Normal (<120/80)';
    let bpBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';

    if (sys < 90 || dia < 60) {
      bpStatus = 'low';
      bpLabel = 'Hypotension (<90/60)';
      bpBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    } else if (sys < 120 && dia < 80) {
      bpStatus = 'optimal';
      bpLabel = 'Optimal (<120/80)';
      bpBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    } else if (sys <= 129 && dia < 80) {
      bpStatus = 'elevated';
      bpLabel = 'Elevated (120-129/<80)';
      bpBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    } else if (sys <= 139 || dia <= 89) {
      bpStatus = 'stage1';
      bpLabel = 'Hypertension Stage 1 (130-139/80-89)';
      bpBadgeColor = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800';
    } else if (sys >= 180 || dia >= 120) {
      bpStatus = 'crisis';
      bpLabel = 'Hypertensive Crisis (≥180/≥120)';
      bpBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800';
    } else {
      bpStatus = 'stage2';
      bpLabel = 'Hypertension Stage 2 (≥140/≥90)';
      bpBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    }

    const deltaSys = previous ? sys - previous.bpSystolic : 0;
    const bpTrend: 'up' | 'down' | 'stable' =
      deltaSys > 2 ? 'up' : deltaSys < -2 ? 'down' : 'stable';

    // 2. Heart Rate / Pulse Analysis
    const hr = latest.pulseRate;
    let hrStatus: VitalsSummary['heartRate']['status'] = 'normal';
    let hrLabel = 'Normal Resting (60-100 BPM)';
    let hrBadgeColor = 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800';

    if (hr < 60) {
      hrStatus = 'bradycardia';
      hrLabel = 'Bradycardia (<60 BPM)';
      hrBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    } else if (hr > 100) {
      hrStatus = 'tachycardia';
      hrLabel = 'Tachycardia (>100 BPM)';
      hrBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    } else if (hr >= 60 && hr <= 78) {
      hrStatus = 'optimal';
      hrLabel = 'Optimal Rhythm (60-78 BPM)';
      hrBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    }

    const deltaHr = previous ? hr - previous.pulseRate : 0;
    const hrTrend: 'up' | 'down' | 'stable' =
      deltaHr > 2 ? 'up' : deltaHr < -2 ? 'down' : 'stable';

    // 3. Glucose / Blood Sugar Analysis (ADA Guidelines)
    const glu = latest.bloodSugar;
    const sugarType = latest.sugarType || 'random';
    let gluStatus: VitalsSummary['glucose']['status'] = 'normal';
    let gluLabel = 'Normal Glycemia';
    let gluBadgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';

    if (sugarType === 'fasting') {
      if (glu < 70) {
        gluStatus = 'low';
        gluLabel = 'Hypoglycemia (<70 mg/dL)';
        gluBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      } else if (glu <= 99) {
        gluStatus = 'optimal';
        gluLabel = 'Normal Fasting (70-99 mg/dL)';
        gluBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      } else if (glu <= 125) {
        gluStatus = 'pre_diabetes';
        gluLabel = 'Impaired Fasting / Pre-Diabetes (100-125 mg/dL)';
        gluBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      } else {
        gluStatus = 'diabetic';
        gluLabel = 'Diabetic Range (≥126 mg/dL)';
        gluBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      }
    } else if (sugarType === 'post_prandial') {
      if (glu < 140) {
        gluStatus = 'optimal';
        gluLabel = 'Normal Post-Prandial (<140 mg/dL)';
        gluBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      } else if (glu <= 199) {
        gluStatus = 'pre_diabetes';
        gluLabel = 'Impaired Glucose Tolerance (140-199 mg/dL)';
        gluBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      } else {
        gluStatus = 'diabetic';
        gluLabel = 'Elevated Post-Meal (≥200 mg/dL)';
        gluBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      }
    } else {
      // Random
      if (glu < 70) {
        gluStatus = 'low';
        gluLabel = 'Hypoglycemia Alert (<70 mg/dL)';
        gluBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      } else if (glu < 140) {
        gluStatus = 'optimal';
        gluLabel = 'Normal Random Glucose (<140 mg/dL)';
        gluBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      } else if (glu < 200) {
        gluStatus = 'pre_diabetes';
        gluLabel = 'Elevated Random Glucose (140-199 mg/dL)';
        gluBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      } else {
        gluStatus = 'diabetic';
        gluLabel = 'Diabetic Range (≥200 mg/dL)';
        gluBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      }
    }

    const deltaGlu = previous ? glu - previous.bloodSugar : 0;
    const gluTrend: 'up' | 'down' | 'stable' =
      deltaGlu > 3 ? 'up' : deltaGlu < -3 ? 'down' : 'stable';

    // 4. Clinical Insights & Risk Stratification
    const insights: string[] = [];
    let riskLevel: VitalsSummary['overallRisk'] = 'low';

    if (bpStatus === 'crisis') {
      riskLevel = 'critical';
      insights.push('URGENT: Blood pressure in Hypertensive Crisis zone (>180/120 mmHg). Immediate clinical evaluation advised.');
    } else if (bpStatus === 'stage2' || gluStatus === 'diabetic' || hrStatus === 'tachycardia') {
      riskLevel = 'high';
      if (bpStatus === 'stage2') insights.push(`Stage 2 Hypertension detected (${sys}/${dia} mmHg). Pharmacotherapy review recommended.`);
      if (gluStatus === 'diabetic') insights.push(`Glycemic control outside target (${glu} mg/dL, ${sugarType}). HbA1c screening indicated.`);
      if (hrStatus === 'tachycardia') insights.push(`Elevated resting heart rate (${hr} BPM). Assess for stress, dehydration, or arrhythmia.`);
    } else if (bpStatus === 'stage1' || bpStatus === 'elevated' || gluStatus === 'pre_diabetes') {
      riskLevel = 'moderate';
      if (bpStatus === 'stage1' || bpStatus === 'elevated') insights.push(`Pre-hypertensive / Stage 1 BP trend observed (${sys}/${dia} mmHg). Dietary & lifestyle counseling recommended.`);
      if (gluStatus === 'pre_diabetes') insights.push(`Borderline elevated blood sugar (${glu} mg/dL). Lifestyle modifications and dietary monitoring suggested.`);
    } else {
      riskLevel = 'low';
      insights.push('All core vital signs (Blood Pressure, Heart Rate, Glucose) are currently within optimal reference thresholds.');
    }

    // Trend assessment
    if (deltaSys < -4 && deltaGlu < -5) {
      insights.push('Positive longitudinal trajectory: Both systolic BP and blood sugar levels show steady clinical improvement.');
    }

    return {
      latestRecord: latest,
      previousRecord: previous,
      bp: {
        systolic: sys,
        diastolic: dia,
        pulsePressure,
        map,
        status: bpStatus,
        label: bpLabel,
        badgeColor: bpBadgeColor,
        deltaSystolic: deltaSys,
        trend: bpTrend
      },
      heartRate: {
        value: hr,
        status: hrStatus,
        label: hrLabel,
        badgeColor: hrBadgeColor,
        delta: deltaHr,
        trend: hrTrend
      },
      glucose: {
        value: glu,
        type: sugarType,
        status: gluStatus,
        label: gluLabel,
        badgeColor: gluBadgeColor,
        delta: deltaGlu,
        trend: gluTrend
      },
      secondary: {
        spo2: latest.spo2,
        temperature: latest.temperature,
        weightKg: latest.weightKg,
        bmi: latest.bmi
      },
      totalCount: records.length,
      lastUpdated: latest.recordedAt,
      overallRisk: riskLevel,
      clinicalInsights: insights
    };
  }
}
