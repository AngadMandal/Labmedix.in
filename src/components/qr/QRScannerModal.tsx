import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Camera, Upload, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const handleDetectedCode = useCallback((code: string) => {
    setScannedCode(code);
    stopCamera();

    // If it's a URL like /verify/VER-XXXX or full URL
    let targetCode = code;
    if (code.includes('/verify/')) {
      const parts = code.split('/verify/');
      if (parts[1]) targetCode = parts[1].trim();
    }

    setTimeout(() => {
      onClose();
      navigate(`/verify/${encodeURIComponent(targetCode)}`);
    }, 800);
  }, [navigate, onClose]);

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qr = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      });

      if (qr && qr.data) {
        handleDetectedCode(qr.data);
        return;
      }
    }

    animRef.current = requestAnimationFrame(scanFrame);
  }, [handleDetectedCode]);

  const startCamera = async () => {
    try {
      setScanError(null);
      setScannedCode(null);
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        animRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setScanError('Unable to access device camera. Please grant camera permissions or upload an image.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedCode(null);
      setScanError(null);
    }
    return () => stopCamera();
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        img.src = event.target.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, img.width, img.height);
            const qr = jsQR(imgData.data, imgData.width, imgData.height);
            if (qr && qr.data) {
              handleDetectedCode(qr.data);
            } else {
              setScanError('No valid QR code detected in the uploaded image.');
            }
          }
        };
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Health Card Scanner" maxWidth="md">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-full aspect-square max-w-[320px] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700 flex items-center justify-center shadow-inner">
          {cameraActive && (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Target Overlay */}
              <div className="absolute inset-0 border-2 border-blue-500/40 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-dashed border-emerald-400 rounded-2xl animate-pulse" />
              </div>
            </>
          )}

          {scannedCode && (
            <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center text-white p-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
              <h4 className="font-bold text-base">QR Code Detected!</h4>
              <p className="text-xs font-mono text-emerald-200 mt-1">{scannedCode}</p>
              <p className="text-xs text-slate-300 mt-2">Opening verification details...</p>
            </div>
          )}

          {!cameraActive && !scannedCode && (
            <div className="p-6 text-center text-slate-400">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs">{scanError || 'Camera inactive. Click Start Camera or Upload an image.'}</p>
            </div>
          )}
        </div>

        {scanError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{scanError}</span>
          </div>
        )}

        <div className="flex items-center gap-3 w-full justify-center">
          {!cameraActive ? (
            <Button size="sm" variant="primary" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={startCamera}>
              Start Camera
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={stopCamera}>
              Pause Camera
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload QR Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </Modal>
  );
};