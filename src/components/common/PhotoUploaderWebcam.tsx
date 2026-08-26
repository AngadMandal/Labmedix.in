import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Trash2, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface PhotoUploaderWebcamProps {
  photoUrl: string;
  onPhotoChange: (url: string) => void;
}

export const PhotoUploaderWebcam: React.FC<PhotoUploaderWebcamProps> = ({
  photoUrl,
  onPhotoChange
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access camera. Please check camera permissions or upload an image.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onPhotoChange(dataUrl);
    }
    stopCamera();
  }, [onPhotoChange]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onPhotoChange(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-inner flex items-center justify-center group">
        {isCameraActive ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        ) : photoUrl ? (
          <img
            src={photoUrl}
            alt="Patient Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-2 text-slate-400">
            <Camera className="w-8 h-8 mx-auto mb-1 opacity-60" />
            <span className="text-[11px] font-medium">No Photo</span>
          </div>
        )}

        {photoUrl && !isCameraActive && (
          <button
            type="button"
            onClick={() => onPhotoChange('')}
            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            title="Remove Photo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {isCameraActive ? (
          <>
            <Button type="button" size="sm" variant="success" onClick={capturePhoto}>
              Capture
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<Camera className="w-3.5 h-3.5" />}
              onClick={startCamera}
            >
              Webcam
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload
            </Button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};