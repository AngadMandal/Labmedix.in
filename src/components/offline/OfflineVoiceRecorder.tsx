import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';

interface OfflineVoiceRecorderProps {
  audioBase64?: string;
  onAudioChange: (base64Audio?: string) => void;
  lang?: 'en' | 'bn';
}

export const OfflineVoiceRecorder: React.FC<OfflineVoiceRecorderProps> = ({
  audioBase64,
  onAudioChange,
  lang = 'en'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Stop recording when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(lang === 'bn' ? 'মাইক্রোফোন ব্রাউজারে সাপোর্টেড নয়।' : 'Audio recording is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onAudioChange(base64data);
        };

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            // Max 60 seconds limit for camp memo
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setError(err?.message || (lang === 'bn' ? 'মাইক্রোফোন চালু করা যায়নি' : 'Unable to access microphone. Please check permissions.'));
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioBase64) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const deleteRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPlaybackSeconds(0);
    onAudioChange(undefined);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-indigo-500" />
          <span>
            {lang === 'bn'
              ? 'রোগীর কণ্ঠস্বর / উপসর্গ মেমো (ঐচ্ছিক)'
              : 'Patient Voice Briefing / Symptom Audio Memo (Optional)'}
          </span>
        </label>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            REC ({formatTime(recordingSeconds)})
          </span>
        )}
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!audioBase64 ? (
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startRecording}
              leftIcon={<Mic className="w-4 h-4 text-rose-500" />}
              className="bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-800 dark:text-slate-200 text-xs font-bold"
            >
              {lang === 'bn' ? 'অডিও রেকর্ড শুরু করুন' : 'Record Voice Note (15-60s)'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={stopRecording}
              leftIcon={<Square className="w-4 h-4 fill-white" />}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md animate-pulse"
            >
              {lang === 'bn' ? 'রেকর্ড সম্পন্ন করুন' : 'Stop Recording'}
            </Button>
          )}

          <p className="text-[11px] text-slate-400">
            {lang === 'bn'
              ? 'বয়স্ক বা নিরক্ষর রোগীদের জন্য কণ্ঠস্বর বিবরণ রেকর্ড করুন।'
              : 'Ideal for rural & elderly patients who struggle to articulate written complaints.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <audio
            ref={audioPlayerRef}
            src={audioBase64}
            onTimeUpdate={(e) => setPlaybackSeconds(Math.floor(e.currentTarget.currentTime))}
            onLoadedMetadata={(e) => setDuration(Math.floor(e.currentTarget.duration) || 0)}
            onEnded={() => {
              setIsPlaying(false);
              setPlaybackSeconds(0);
            }}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayback}
              className={`p-2.5 rounded-full text-white font-bold transition-all shadow-md ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
              title={isPlaying ? 'Pause' : 'Play Audio'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span>{lang === 'bn' ? 'অডিও নোট সংরক্ষিত' : 'Voice Memo Attached'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono">
                  {formatTime(playbackSeconds)} / {formatTime(duration || recordingSeconds)}
                </span>
              </p>
              <p className="text-[10px] text-slate-400">
                {lang === 'bn' ? 'অফলাইনে ডিভাইসে সেভ করা হয়েছে।' : 'Saved offline with patient record.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={deleteRecording}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Voice Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
