import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { OfflinePatientData, OfflineSubmission } from '../../services/offlineFormService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Printer,
  X,
  CreditCard,
  Receipt,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Heart,
  Activity,
  Shield,
  Calendar,
  MapPin,
  Stethoscope,
  Sparkles,
  Pill
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface OfflineCampPassModalProps {
  submission: OfflineSubmission;
  onClose: () => void;
  lang?: 'en' | 'bn';
}

export const OfflineCampPassModal: React.FC<OfflineCampPassModalProps> = ({
  submission,
  onClose,
  lang = 'en'
}) => {
  const [printFormat, setPrintFormat] = useState<'thermal' | 'badge'>('thermal');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  const { data, offlineToken, createdAt } = submission;

  useEffect(() => {
    // Generate high resolution QR code payload
    const qrPayload = JSON.stringify({
      t: offlineToken,
      n: data.fullName,
      m: data.mobile,
      bg: data.bloodGroup,
      a: data.age,
      g: data.gender,
      tl: data.triageLevel || 'normal',
      em: `${data.emergencyContactName} (${data.emergencyContactMobile})`,
      c: data.campName || 'Field Camp',
      d: createdAt
    });

    QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [data, offlineToken, createdAt]);

  const handlePrint = () => {
    window.print();
  };

  const getTriageBadge = () => {
    const level = data.triageLevel || 'normal';
    if (level === 'emergency') {
      return {
        bg: 'bg-rose-600 text-white',
        border: 'border-rose-300',
        label: lang === 'bn' ? 'জরুরি ট্রায়াজ (EMERGENCY)' : 'EMERGENCY / CRITICAL'
      };
    }
    if (level === 'high_risk') {
      return {
        bg: 'bg-amber-500 text-slate-950 font-black',
        border: 'border-amber-400',
        label: lang === 'bn' ? 'উচ্চ ঝুঁকি (HIGH RISK)' : 'HIGH RISK / PRIORITY'
      };
    }
    if (level === 'moderate') {
      return {
        bg: 'bg-yellow-400 text-slate-900 font-bold',
        border: 'border-yellow-300',
        label: lang === 'bn' ? 'মাঝারি ঝুঁকি (MODERATE)' : 'MODERATE RISK'
      };
    }
    return {
      bg: 'bg-emerald-600 text-white',
      border: 'border-emerald-300',
      label: lang === 'bn' ? 'স্বাভাবিক (NORMAL)' : 'OPTIMAL / NORMAL'
    };
  };

  const triageInfo = getTriageBadge();

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fade-in print:static print:bg-transparent print:backdrop-blur-none print:p-0 print:m-0 print:overflow-visible">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh] print:max-w-none print:max-h-none print:border-none print:shadow-none print:bg-transparent print:rounded-none">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between border-b border-white/10 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>{lang === 'bn' ? 'অফলাইন ক্যাম্প পাস ও প্রিন্ট স্লিপ' : 'Field Camp Patient Pass & Slip'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {offlineToken}
                </span>
              </h3>
              <p className="text-xs text-indigo-200">
                {lang === 'bn'
                  ? 'রোগীর জন্য তাৎক্ষণিক থার্মাল স্লিপ বা কার্ড প্রিন্ট করুন'
                  : 'Instant offline printable token, QR pass & thermal dispensary slip'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Format Selector Bar */}
        <div className="p-3 bg-slate-100 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setPrintFormat('thermal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                printFormat === 'thermal'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? '২-ইঞ্চি থার্মাল স্লিপ' : '2-Inch POS Thermal Slip'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPrintFormat('badge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                printFormat === 'badge'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'অফলাইন ডিজিটাল কার্ড' : 'CR80 Temporary Badge'}</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
          >
            {lang === 'bn' ? 'প্রিন্ট করুন' : 'Print Now'}
          </Button>
        </div>

        {/* Printable & Preview Content */}
        <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-slate-50 dark:bg-slate-950 print:bg-white print:p-0 print:m-0 print:overflow-visible" ref={printRef}>
          {printFormat === 'thermal' ? (
            /* ---------------------------------------------------- */
            /* 2-INCH / 80mm POS THERMAL RECEIPT SLIP               */
            /* ---------------------------------------------------- */
            <div className="w-[300px] bg-white text-black p-4 font-mono text-xs border border-dashed border-slate-400 shadow-xl rounded-xl printable-thermal-slip print:border-none print:shadow-none print:p-0 print:m-0">
              {/* Slip Header */}
              <div className="text-center space-y-1 pb-3 border-b-2 border-black border-dashed">
                <p className="font-black text-sm tracking-wider uppercase">LABMEDIX HEALTH</p>
                <p className="text-[10px] uppercase font-bold text-slate-700">
                  {data.campName || 'RURAL MEDICAL OUTREACH CAMP'}
                </p>
                <p className="text-[9px] text-slate-600">
                  {data.campLocation || 'Mobile Healthcare Outreach'}
                </p>
                <div className="my-1.5 py-1 px-2 bg-black text-white font-black text-xs inline-block rounded">
                  TOKEN: {offlineToken}
                </div>
                <p className="text-[9px]">
                  DATE: {new Date(createdAt).toLocaleString()}
                </p>
              </div>

              {/* Patient Basic Info */}
              <div className="py-2.5 space-y-1 border-b border-black border-dashed text-[11px]">
                <div className="flex justify-between">
                  <span className="font-bold">PATIENT:</span>
                  <span className="font-black uppercase">{data.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">AGE / GENDER:</span>
                  <span>{data.age} Y / {data.gender.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">BLOOD GRP:</span>
                  <span className="font-black">{data.bloodGroup || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">MOBILE:</span>
                  <span>{data.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">AREA / PIN:</span>
                  <span className="truncate max-w-[150px]">{data.villageArea || data.district} ({data.pinCode})</span>
                </div>
              </div>

              {/* Triage Banner */}
              <div className="py-2 border-b border-black border-dashed text-center">
                <div className="text-[10px] font-black uppercase py-0.5 border border-black rounded">
                  TRIAGE: {data.triageLevel ? data.triageLevel.toUpperCase() : 'OPTIMAL'}
                </div>
                {data.triageReasons && data.triageReasons.length > 0 && (
                  <p className="text-[9px] mt-1 text-slate-700 font-sans">
                    {data.triageReasons.join(', ')}
                  </p>
                )}
              </div>

              {/* Baseline Vitals recorded */}
              {data.vitals && (
                <div className="py-2 border-b border-black border-dashed space-y-0.5 text-[10px]">
                  <p className="font-bold uppercase text-[9px] text-slate-600">RECORDED VITALS:</p>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div>BP: {data.vitals.bpSystolic || '--'}/{data.vitals.bpDiastolic || '--'} mmHg</div>
                    <div>Sugar: {data.vitals.bloodSugar || '--'} mg/dL</div>
                    <div>SpO2: {data.vitals.spo2 || '--'}%</div>
                    <div>Pulse: {data.vitals.pulseRate || '--'} bpm</div>
                    <div>Temp: {data.vitals.temperature || '--'}°F</div>
                    <div>Weight: {data.vitals.weightKg || '--'} kg</div>
                  </div>
                </div>
              )}

              {/* Dispensed Medicines at Camp */}
              {data.dispensedMedicines && data.dispensedMedicines.length > 0 && (
                <div className="py-2 border-b border-black border-dashed space-y-1">
                  <p className="font-black text-[10px] uppercase flex items-center gap-1">
                    <span>💊 DISPENSED MEDICINES (বিনামূল্যে):</span>
                  </p>
                  <div className="space-y-1 text-[10px]">
                    {data.dispensedMedicines.map((m, idx) => (
                      <div key={idx} className="flex justify-between border-b border-dotted pb-0.5">
                        <div>
                          <span className="font-bold">{m.name}</span>
                          <span className="text-[9px] block text-slate-600">{m.dosage} - {m.instructions}</span>
                        </div>
                        <span className="font-black text-right">Qty: {m.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fee & Payment */}
              <div className="py-2 border-b border-black border-dashed flex justify-between text-[11px] font-black">
                <span>CAMP REGISTRATION:</span>
                <span>
                  {data.paymentMode === 'ngo_free_grant'
                    ? '100% FREE (GRANT)'
                    : formatCurrency(data.feeCollected)}
                </span>
              </div>

              {/* QR Code */}
              {qrDataUrl && (
                <div className="py-3 text-center flex flex-col items-center">
                  <img src={qrDataUrl} alt="Offline Token QR" className="w-28 h-28 border border-black p-1" />
                  <p className="text-[8px] mt-1 text-slate-600 uppercase tracking-tighter">
                    Scan for Live Sync & Diagnostic Discount
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center pt-2 text-[8px] text-slate-600 space-y-0.5 border-t border-black border-dashed">
                <p>Present this slip at LabMedix counters for diagnostic investigations.</p>
                <p>Emergency Contact: {data.emergencyContactName} ({data.emergencyContactMobile})</p>
                <p>Helpline: +91 98765 43210</p>
              </div>
            </div>
          ) : (
            /* ---------------------------------------------------- */
            /* CR80 TEMPORARY BADGE / PASS                          */
            /* ---------------------------------------------------- */
            <div className="w-full max-w-md bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 shadow-2xl border border-indigo-500/40 relative overflow-hidden space-y-4 printable-card-target print:shadow-none print:m-0">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* Top Header */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-sm shadow-md">
                    LM
                  </div>
                  <div>
                    <h4 className="font-black text-sm tracking-wide">LABMEDIX HEALTH</h4>
                    <p className="text-[10px] text-indigo-300">
                      {data.campName || 'Field Health Outreach Camp'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                    {offlineToken}
                  </span>
                  <p className="text-[9px] text-slate-400 mt-0.5">OFFLINE PASS</p>
                </div>
              </div>

              {/* Main Card Body */}
              <div className="flex items-center gap-4 relative z-10 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-sm">
                {data.photoBase64 ? (
                  <img
                    src={data.photoBase64}
                    alt={data.fullName}
                    className="w-16 h-20 rounded-xl object-cover border border-white/20 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-16 h-20 rounded-xl bg-white/10 flex items-center justify-center text-slate-400 font-bold text-xs border border-white/20 shrink-0">
                    PHOTO
                  </div>
                )}

                <div className="space-y-1 flex-1 min-w-0">
                  <h5 className="font-black text-base truncate text-white uppercase">
                    {data.fullName}
                  </h5>
                  <p className="text-xs text-indigo-200">
                    {data.age} Yrs • {data.gender.toUpperCase()} • Blood: <span className="font-bold text-white">{data.bloodGroup || 'N/A'}</span>
                  </p>
                  <p className="text-[11px] text-slate-300 truncate">
                    📱 {data.mobile}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    📍 {data.villageArea || data.district}, {data.state}
                  </p>
                </div>

                {qrDataUrl && (
                  <div className="bg-white p-1 rounded-xl shadow-md shrink-0">
                    <img src={qrDataUrl} alt="Token QR" className="w-16 h-16" />
                  </div>
                )}
              </div>

              {/* Triage Alert Pill */}
              <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between relative z-10 ${triageInfo.bg} ${triageInfo.border}`}>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="font-black tracking-wide">{triageInfo.label}</span>
                </div>
                <span className="text-[10px] opacity-90">
                  BP: {data.vitals?.bpSystolic || '--'}/{data.vitals?.bpDiastolic || '--'} • Sugar: {data.vitals?.bloodSugar || '--'}
                </span>
              </div>

              {/* Emergency Contact & Card footer */}
              <div className="flex items-center justify-between text-[10px] text-indigo-200 pt-1 border-t border-white/10 relative z-10">
                <span>
                  Emergency: <strong>{data.emergencyContactName}</strong> ({data.emergencyContactMobile})
                </span>
                <span className="font-mono text-slate-400">
                  Issued: {new Date(createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'bn'
              ? '💡 যেকোনো থার্মাল বা স্ট্যান্ডার্ড প্রিন্টারে প্রিন্ট করতে পারেন।'
              : 'Compatible with standard 80mm ESC/POS thermal printers & A4 desktop laser printers.'}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-bold"
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md"
            >
              {lang === 'bn' ? 'সরাসরি প্রিন্ট' : 'Print Pass'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
