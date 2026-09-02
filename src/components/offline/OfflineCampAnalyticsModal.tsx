import React from 'react';
import { OfflineSubmission } from '../../services/offlineFormService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  X,
  BarChart3,
  Activity,
  Users,
  Pill,
  HeartHandshake,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface OfflineCampAnalyticsModalProps {
  submissions: OfflineSubmission[];
  onClose: () => void;
  lang?: 'en' | 'bn';
}

export const OfflineCampAnalyticsModal: React.FC<OfflineCampAnalyticsModalProps> = ({
  submissions,
  onClose,
  lang = 'en'
}) => {
  // Compute analytics
  const total = submissions.length;

  const triageCounts = {
    emergency: submissions.filter((s) => s.data.triageLevel === 'emergency').length,
    high_risk: submissions.filter((s) => s.data.triageLevel === 'high_risk').length,
    moderate: submissions.filter((s) => s.data.triageLevel === 'moderate').length,
    normal: submissions.filter((s) => !s.data.triageLevel || s.data.triageLevel === 'normal').length
  };

  const paymentBreakdown = {
    cash: submissions.filter((s) => s.data.paymentMode === 'cash').length,
    upi: submissions.filter((s) => s.data.paymentMode === 'upi').length,
    ngo_free_grant: submissions.filter((s) => s.data.paymentMode === 'ngo_free_grant').length,
    card: submissions.filter((s) => s.data.paymentMode === 'card').length
  };

  const totalFeeCollected = submissions.reduce((acc, s) => acc + (s.data.feeCollected || 0), 0);

  const chronicCounts = {
    diabetic: submissions.filter((s) => s.data.isDiabetic).length,
    hypertensive: submissions.filter((s) => s.data.isHypertensive).length,
    heartDisease: submissions.filter((s) => s.data.hasHeartDisease).length,
    asthma: submissions.filter((s) => s.data.hasAsthma).length
  };

  // Medicine dispensing aggregations
  const medicineTotals: Record<string, number> = {};
  submissions.forEach((s) => {
    if (s.data.dispensedMedicines) {
      s.data.dispensedMedicines.forEach((m) => {
        medicineTotals[m.name] = (medicineTotals[m.name] || 0) + (m.quantity || 1);
      });
    }
  });

  const topMedicines = Object.entries(medicineTotals).sort((a, b) => b[1] - a[1]);

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>{lang === 'bn' ? 'ফিল্ড হেলথ ক্যাম্প অ্যানালিটিক্স ও অডিট রিপোর্ট' : 'Field Health Camp Live Analytics & Audit'}</span>
              </h3>
              <p className="text-xs text-indigo-200">
                {lang === 'bn'
                  ? 'ক্যাম্প রেজিস্ট্রেশন, ট্রায়াজ রিক্স অ্যালার্ট এবং ওষুধ বিতরণের সারসংক্ষেপ'
                  : 'Real-time epidemiological risk analysis, triage levels, and medicine dispensary log'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintSummary}
              leftIcon={<Printer className="w-4 h-4 text-white" />}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs font-bold"
            >
              Print Audit
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Analytics Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50 dark:bg-slate-950">
          
          {/* TOP STATS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Total Enrolled</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                {total}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Field Camp Patients</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-sm">
              <div className="flex items-center justify-between text-rose-500 text-xs font-bold">
                <span>Critical / Emergency</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
                {triageCounts.emergency + triageCounts.high_risk}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {triageCounts.emergency} Emergency • {triageCounts.high_risk} High Risk
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
              <div className="flex items-center justify-between text-emerald-500 text-xs font-bold">
                <span>Free NGO Grants</span>
                <HeartHandshake className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {paymentBreakdown.ngo_free_grant}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">100% Free Sponsored</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 shadow-sm">
              <div className="flex items-center justify-between text-indigo-500 text-xs font-bold">
                <span>Camp Collection</span>
                <DollarSign className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                {formatCurrency(totalFeeCollected)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Cash & UPI Box</p>
            </div>
          </div>

          {/* TWO COLUMN GRID: TRIAGE & CHRONIC PREVALENCE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Triage Stratification */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                <span>WHO / Clinical Triage Stratification</span>
              </h4>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-rose-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      Emergency / Hypertensive Crisis
                    </span>
                    <span>{triageCounts.emergency} ({total > 0 ? Math.round((triageCounts.emergency / total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${total > 0 ? (triageCounts.emergency / total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-amber-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      High Risk / Stage 2
                    </span>
                    <span>{triageCounts.high_risk} ({total > 0 ? Math.round((triageCounts.high_risk / total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${total > 0 ? (triageCounts.high_risk / total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-yellow-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                      Moderate Risk / Stage 1
                    </span>
                    <span>{triageCounts.moderate} ({total > 0 ? Math.round((triageCounts.moderate / total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${total > 0 ? (triageCounts.moderate / total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      Optimal / Normal Vitals
                    </span>
                    <span>{triageCounts.normal} ({total > 0 ? Math.round((triageCounts.normal / total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${total > 0 ? (triageCounts.normal / total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chronic Disease Burden */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Prevalent Chronic Disease Burden</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500">Diabetes Mellitus</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {chronicCounts.diabetic} <span className="text-xs font-normal text-slate-400">patients</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500">Hypertension</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {chronicCounts.hypertensive} <span className="text-xs font-normal text-slate-400">patients</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500">Cardiac Disease</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {chronicCounts.heartDisease} <span className="text-xs font-normal text-slate-400">patients</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500">Asthma / COPD</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {chronicCounts.asthma} <span className="text-xs font-normal text-slate-400">patients</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DISPENSED MEDICINES AUDIT */}
          {topMedicines.length > 0 && (
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-500" />
                <span>Field Dispensary Log (বিনামূল্যে ওষুধ বিতরণ তালিকা)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {topMedicines.map(([name, qty]) => (
                  <div
                    key={name}
                    className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex justify-between items-center text-xs"
                  >
                    <span className="font-bold text-slate-900 dark:text-slate-100">{name}</span>
                    <span className="font-black font-mono text-emerald-700 dark:text-emerald-300">
                      {qty} Units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-bold">
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </Button>
        </div>
      </div>
    </div>
  );
};
