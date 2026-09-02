import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { OfflineFormService, OfflineSubmission } from '../../services/offlineFormService';
import { StorageService } from '../../services/storage';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import {
  Camera,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Users,
  QrCode,
  CreditCard,
  Phone,
  Clock,
  ArrowRight
} from 'lucide-react';

interface OfflineDuplicateScannerModalProps {
  onClose: () => void;
  onSelectExisting?: (data: any) => void;
  lang?: 'en' | 'bn';
}

export const OfflineDuplicateScannerModal: React.FC<OfflineDuplicateScannerModalProps> = ({
  onClose,
  onSelectExisting,
  lang = 'en'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stop camera when closing
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this device/browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err: any) {
      console.error('Camera start error:', err);
      setCameraError(err?.message || 'Could not access device camera.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleDetectedCode(code.data);
          return;
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tickScan);
  };

  const handleDetectedCode = (scannedText: string) => {
    stopCamera();
    setScanResult(scannedText);

    // Try parsing as JSON QR token or standard token string
    try {
      const parsed = JSON.parse(scannedText);
      if (parsed.t) {
        setSearchTerm(parsed.t);
        return;
      }
      if (parsed.m) {
        setSearchTerm(parsed.m);
        return;
      }
    } catch (e) {
      // Raw string token like OFF-XXXX-XX or mobile
      setSearchTerm(scannedText.trim());
    }
  };

  // Search through both Offline Queue and Local Patients Database
  const searchResults = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return { offlineMatches: [], liveMatches: [] };

    const allOffline = OfflineFormService.getAllSubmissions();
    const allPatients = StorageService.getPatients();

    const offlineMatches = allOffline.filter((sub) => {
      const d = sub.data;
      return (
        sub.offlineToken.toLowerCase().includes(term) ||
        d.fullName.toLowerCase().includes(term) ||
        d.mobile.includes(term) ||
        (d.governmentIdNumber && d.governmentIdNumber.toLowerCase().includes(term))
      );
    });

    const liveMatches = allPatients.filter((p) => {
      return (
        p.id.toLowerCase().includes(term) ||
        p.fullName.toLowerCase().includes(term) ||
        p.mobile.includes(term) ||
        (p.governmentIdNumber && p.governmentIdNumber.toLowerCase().includes(term))
      );
    });

    return { offlineMatches, liveMatches };
  }, [searchTerm]);

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>{lang === 'bn' ? 'ডুপ্লিকেট রোগী যাচাই ও কিউআর স্ক্যানার' : 'Camp Duplicate Check & QR Scanner'}</span>
              </h3>
              <p className="text-xs text-indigo-200">
                {lang === 'bn'
                  ? 'পূর্ববর্তী ক্যাম্প রেজিস্ট্রেশন বা কার্ড স্ক্যান করে পরীক্ষা করুন'
                  : 'Instantly check prior registrations by QR, Token, Mobile or Govt ID'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Camera Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder={lang === 'bn' ? 'মোবাইল নম্বর, টোকেন বা নাম দিয়ে খুঁজুন...' : 'Search by Mobile, Token (OFF-...), or Govt ID...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                autoFocus
              />
            </div>

            <Button
              type="button"
              variant={isCameraActive ? 'danger' : 'outline'}
              onClick={isCameraActive ? stopCamera : startCamera}
              leftIcon={<Camera className="w-4 h-4" />}
              className="font-bold text-xs shrink-0"
            >
              {isCameraActive ? (lang === 'bn' ? 'ক্যামেরা বন্ধ' : 'Stop Camera') : (lang === 'bn' ? 'QR স্ক্যান করুন' : 'Scan QR Code')}
            </Button>
          </div>

          {/* Camera Viewport */}
          {isCameraActive && (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-indigo-500 shadow-inner">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline />
              <div className="absolute inset-0 border-2 border-indigo-400/60 rounded-xl m-8 pointer-events-none animate-pulse flex items-center justify-center">
                <div className="w-12 h-1 bg-rose-500/80"></div>
              </div>
              <p className="absolute bottom-2 bg-black/70 px-3 py-1 rounded-full text-[11px] text-white font-mono">
                Point camera at Patient Pass or QR Code
              </p>
            </div>
          )}

          {cameraError && (
            <p className="text-xs text-rose-500 font-bold">{cameraError}</p>
          )}
        </div>

        {/* Results Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* OFFLINE QUEUE MATCHES */}
          {searchResults.offlineMatches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Found in Local Offline Queue ({searchResults.offlineMatches.length})</span>
              </h4>

              <div className="space-y-2">
                {searchResults.offlineMatches.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                          {sub.offlineToken}
                        </span>
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                          {sub.data.fullName}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        📱 {sub.data.mobile} • {sub.data.age} Yrs • Blood: {sub.data.bloodGroup || 'N/A'} • {sub.data.campName || 'Field Camp'}
                      </p>
                    </div>

                    {onSelectExisting && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onSelectExisting(sub.data);
                          onClose();
                        }}
                        leftIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        className="text-xs font-bold shrink-0 bg-white dark:bg-slate-900"
                      >
                        Load Form
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIVE SYSTEM MATCHES */}
          {searchResults.liveMatches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Found in Main Patient Master DB ({searchResults.liveMatches.length})</span>
              </h4>

              <div className="space-y-2">
                {searchResults.liveMatches.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200">
                          {p.id}
                        </span>
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                          {p.fullName}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        📱 {p.mobile} • Blood: {p.bloodGroup || 'N/A'} • Govt ID: {p.governmentIdNumber || 'N/A'}
                      </p>
                    </div>

                    {onSelectExisting && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onSelectExisting({
                            fullName: p.fullName,
                            dob: p.dob,
                            age: p.age,
                            gender: p.gender,
                            maritalStatus: p.maritalStatus,
                            occupation: p.occupation,
                            bloodGroup: p.bloodGroup,
                            mobile: p.mobile,
                            whatsapp: p.whatsapp,
                            email: p.email,
                            governmentIdType: p.governmentIdType,
                            governmentIdNumber: p.governmentIdNumber,
                            villageArea: p.address?.villageArea || '',
                            postOffice: p.address?.postOffice || '',
                            policeStation: p.address?.policeStation || '',
                            district: p.address?.district || '',
                            state: p.address?.state || 'West Bengal',
                            pinCode: p.address?.pinCode || '',
                            fullAddress: p.address?.fullAddress || '',
                            emergencyContactName: p.emergencyContact?.name || '',
                            emergencyContactRelationship: p.emergencyContact?.relationship || '',
                            emergencyContactMobile: p.emergencyContact?.mobile || '',
                            allergies: p.medicalInfo?.allergies || '',
                            chronicConditions: p.medicalInfo?.chronicConditions || ''
                          });
                          onClose();
                        }}
                        leftIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        className="text-xs font-bold shrink-0 bg-white dark:bg-slate-900"
                      >
                        Auto-Fill
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchTerm && searchResults.offlineMatches.length === 0 && searchResults.liveMatches.length === 0 && (
            <div className="text-center py-8 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200">
                {lang === 'bn' ? 'কোনো পূর্ববর্তী ডুপ্লিকেট রেকর্ড পাওয়া যায়নি' : 'No Prior Duplicate Records Found'}
              </h4>
              <p className="text-xs text-slate-500">
                {lang === 'bn' ? `"${searchTerm}" দিয়ে নতুন রোগী নিশ্চিন্তে রেজিস্টার করতে পারেন।` : `You can proceed with a fresh registration for "${searchTerm}".`}
              </p>
            </div>
          )}

          {!searchTerm && (
            <div className="text-center py-8 space-y-2 text-slate-400">
              <QrCode className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs">
                {lang === 'bn'
                  ? 'রোগীর ফোন নম্বর, টোকেন বা QR কোড স্ক্যান করে আগে থেকেই নিবন্ধিত কিনা চেক করুন।'
                  : 'Enter patient mobile, token, or scan their temporary card QR code to prevent duplicate submissions.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-bold">
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </Button>
        </div>
      </div>
    </div>
  );
};
