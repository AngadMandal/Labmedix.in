import React, { useState } from 'react';
import { Plus, UserPlus, FileText, ScanLine, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Action Menu */}
      {isOpen && (
        <div className="mb-3 flex flex-col gap-2.5 items-end animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={() => handleAction('/patients')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-xs group"
          >
            <span>New Patient Registration</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => handleAction('/billing')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-xs group"
          >
            <span>Create New Bill</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => handleAction('/scanner')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-xs group"
          >
            <span>Quick QR / Barcode Scan</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ScanLine className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Main FAB Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer ${
          isOpen ? 'rotate-45 bg-slate-800 from-slate-800 to-slate-700' : ''
        }`}
        title="Quick Actions Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7" />}
      </button>
    </div>
  );
};
