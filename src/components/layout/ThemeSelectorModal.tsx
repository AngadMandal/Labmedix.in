import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ThemeMode } from '../../types';
import { Sun, Moon, Laptop, Clock, Check, Sparkles, Sunset, Sunrise } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const {
    theme,
    resolvedTheme,
    systemTheme,
    timeBasedTheme,
    isDark,
    isDaytime,
    currentTimeString,
    setThemeMode,
    updateAutoSchedule
  } = useTheme();

  const dayStartHour = theme.autoSchedule?.dayStartHour ?? 7;
  const nightStartHour = theme.autoSchedule?.nightStartHour ?? 19;

  const modeOptions: Array<{
    id: ThemeMode;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'auto_schedule',
      title: 'Auto Schedule (Time-Based)',
      description: 'Automatically switches based on your local time schedule (Daytime light, Nighttime dark).',
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      badge: `Now: ${timeBasedTheme === 'dark' ? '🌙 Night Dark' : '☀️ Day Light'}`
    },
    {
      id: 'system',
      title: 'System OS Preference',
      description: 'Syncs automatically with your operating system dark/light preferences.',
      icon: <Laptop className="w-5 h-5 text-blue-500" />,
      badge: `OS: ${systemTheme === 'dark' ? 'Dark' : 'Light'}`
    },
    {
      id: 'light',
      title: 'Light Mode',
      description: 'High-contrast bright daylight theme for well-lit medical environments.',
      icon: <Sun className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'dark',
      title: 'Dark Mode',
      description: 'Reduced glare dark theme ideal for night shifts and radiology views.',
      icon: <Moon className="w-5 h-5 text-indigo-400" />
    }
  ];

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${h12.toString().padStart(2, '0')}:00 ${period}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Theme & Display Preferences" maxWidth="md">
      <div className="space-y-5 text-slate-800 dark:text-slate-100">
        {/* Status Header */}
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 block font-bold">
                Active Theme State
              </span>
              <strong className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                {isDark ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}
              </strong>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Local Time</span>
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
              {currentTimeString} ({isDaytime ? 'Day' : 'Night'})
            </span>
          </div>
        </div>

        {/* Theme Options */}
        <div className="space-y-2.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Select Color Scheme Mode
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {modeOptions.map(opt => {
              const isSelected = theme.mode === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setThemeMode(opt.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                    isSelected
                      ? 'bg-teal-500/10 border-teal-500 shadow-md ring-1 ring-teal-500/30'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 mt-0.5">{opt.icon}</div>
                  <div className="flex-1 pr-6">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">{opt.title}</h4>
                      {opt.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {opt.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Auto Schedule Custom Time Range Settings */}
        {theme.mode === 'auto_schedule' && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" /> Auto-Schedule Hours
              </span>
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 font-bold">
                Custom Local Hours
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase block mb-1 flex items-center gap-1">
                  <Sunrise className="w-3.5 h-3.5 text-amber-500" /> Day Light Start
                </label>
                <select
                  value={dayStartHour}
                  onChange={e => updateAutoSchedule(parseInt(e.target.value, 10), nightStartHour)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {formatHour(i)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase block mb-1 flex items-center gap-1">
                  <Sunset className="w-3.5 h-3.5 text-indigo-400" /> Night Dark Start
                </label>
                <select
                  value={nightStartHour}
                  onChange={e => updateAutoSchedule(dayStartHour, parseInt(e.target.value, 10))}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {formatHour(i)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1">
              ☀️ Light mode runs from <strong>{formatHour(dayStartHour)}</strong> to <strong>{formatHour(nightStartHour)}</strong>. 🌙 Dark mode runs overnight.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
