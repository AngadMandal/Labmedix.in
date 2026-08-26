import React, { useState, useEffect } from 'react';
import { generateQrDataUrl } from '../../utils/qr';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Smartphone,
  ExternalLink,
  Sparkles,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export interface GooglePayMerchantQRProps {
  amount: number;
  referenceNo: string;
  note?: string;
  merchantVpa?: string;
  merchantName?: string;
  merchantMcc?: string;
  onPaymentSuccess?: (utr: string) => void;
  className?: string;
}

export const GooglePayMerchantQR: React.FC<GooglePayMerchantQRProps> = ({
  amount,
  referenceNo,
  note = 'LABMEDIX Health Card Payment',
  merchantVpa = '7047108226@okbizaxis',
  merchantName = 'LABMEDIX MULTI-SPECIALITY CENTRE',
  merchantMcc = '8099',
  onPaymentSuccess,
  className = ''
}) => {
  const { showToast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedUpiUrl, setCopiedUpiUrl] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Standard NPCI UPI URI Specification
  const upiPayload = `upi://pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`${note} Ref ${referenceNo}`)}&tr=${referenceNo}&mc=${merchantMcc}`;

  // Generate real high-resolution Level-H scannable QR Code
  useEffect(() => {
    let isMounted = true;
    generateQrDataUrl(upiPayload, 420)
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
        }
      })
      .catch((err) => {
        console.error('Error generating UPI QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiPayload]);

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(merchantVpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
    showToast('info', 'UPI ID Copied', `${merchantVpa} copied to clipboard.`);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(upiPayload);
    setCopiedUpiUrl(true);
    setTimeout(() => setCopiedUpiUrl(false), 2200);
    showToast('info', 'Payment Link Copied', 'Direct UPI payment URI copied.');
  };

  const handleOpenAppIntent = (appName: string, customScheme?: string) => {
    const targetUri = customScheme || upiPayload;
    window.location.href = targetUri;
    showToast('info', `Opening ${appName}`, `Redirecting to ${appName} with pre-filled ₹${amount.toFixed(2)}.`);
  };

  return (
    <div className={`p-5 rounded-3xl bg-slate-950 border-2 border-teal-500/50 shadow-2xl text-center space-y-4 ${className}`}>
      {/* Header: Verified Google Pay & NPCI Merchant Trust Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {/* GPay Logo Style Pill */}
          <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-1.5 shadow-sm">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 flex items-center justify-center text-[9px] font-black text-white">
              G
            </div>
            <span className="font-black text-xs text-white tracking-wide">Google Pay</span>
          </div>
          <span className="text-[10.5px] font-bold text-teal-400 font-mono">
            VERIFIED MERCHANT
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/40">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>NPCI Bharat QR Standard</span>
        </div>
      </div>

      {/* Main Real Dynamic QR Code Container */}
      <div className="relative inline-block mx-auto group">
        <div className="w-52 h-52 bg-white rounded-3xl p-3.5 shadow-2xl border-4 border-teal-400 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-[1.02]">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`UPI QR Code for ${merchantName}`}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-700">
              <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
              <span className="text-[11px] font-bold font-mono">Generating Live QR...</span>
            </div>
          )}

          {/* Center Brand Overlay Icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-11 h-11 bg-white rounded-2xl p-1 shadow-xl border-2 border-slate-300 flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-teal-600 via-emerald-600 to-blue-600 flex items-center justify-center text-white font-black text-[11px] font-mono tracking-tighter">
                UPI
              </div>
            </div>
          </div>
        </div>

        {/* Scan Instruction Floating Pill */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/90 text-teal-300 border border-teal-500/50 text-[11px] font-bold shadow-md">
          <Smartphone className="w-3.5 h-3.5 text-teal-400" />
          <span>Scan with Google Pay, PhonePe, Paytm, BHIM</span>
        </div>
      </div>

      {/* Real-time Amount & Merchant VPA Display */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 max-w-md mx-auto text-left">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <span className="text-[9.5px] uppercase font-bold text-slate-400 block font-mono">
              Payable Net Amount:
            </span>
            <strong className="text-lg font-black text-emerald-400 font-mono">
              {formatCurrency(amount)}
            </strong>
          </div>
          <div className="text-right">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 block font-mono">
              Transaction Ref:
            </span>
            <span className="text-xs font-mono font-bold text-teal-300">
              {referenceNo}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono pt-1">
          <div className="space-y-0.5">
            <span className="text-[9.5px] text-slate-400 uppercase block font-sans">
              Merchant Name & VPA:
            </span>
            <strong className="text-white text-xs block truncate max-w-[230px]">
              {merchantName}
            </strong>
            <span className="text-teal-400 font-bold block">{merchantVpa}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyVpa}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
              title="Copy UPI ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-Tap Direct UPI Apps Instant Launch Buttons */}
      <div className="space-y-2 max-w-md mx-auto">
        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
          Or Tap to Pay Directly in UPI App:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* 1. Google Pay */}
          <button
            type="button"
            onClick={() => handleOpenAppIntent('Google Pay')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-black">
              G
            </div>
            <span>GPay</span>
          </button>

          {/* 2. PhonePe */}
          <button
            type="button"
            onClick={() => handleOpenAppIntent('PhonePe', `phonepe://pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-purple-500 flex items-center justify-center text-[8px] font-black">
              Pe
            </div>
            <span>PhonePe</span>
          </button>

          {/* 3. Paytm */}
          <button
            type="button"
            onClick={() => handleOpenAppIntent('Paytm', `paytmmp://pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-sky-950/60 border border-slate-800 hover:border-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-sky-500 flex items-center justify-center text-[8px] font-black">
              P
            </div>
            <span>Paytm</span>
          </button>

          {/* 4. BHIM / Other */}
          <button
            type="button"
            onClick={() => handleOpenAppIntent('BHIM UPI')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>BHIM</span>
          </button>
        </div>
      </div>
    </div>
  );
};
