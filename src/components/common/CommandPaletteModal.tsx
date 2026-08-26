import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storage';
import { Search, User, CreditCard, Award, FileText, ArrowRight, X, Command, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const patients = StorageService.getPatients().filter(p => !p.isDeleted);
  const cards = StorageService.getCards();
  const memberships = StorageService.getMemberships();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // handled in parent or toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search Results
  const matchedPatients = q ? patients.filter(p => p.fullName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.mobile.includes(q)).slice(0, 4) : [];
  const matchedCards = q ? cards.filter(c => c.cardNumber.toLowerCase().includes(q) || c.verificationCode.toLowerCase().includes(q)).slice(0, 3) : [];
  const matchedMemberships = q ? memberships.filter(m => m.name.toLowerCase().includes(q)).slice(0, 2) : [];

  const quickActions = [
    { title: 'Register New Patient', path: '/patients/new', icon: User, shortcut: 'P' },
    { title: 'Open CR80 Card Studio', path: '/card-studio', icon: CreditCard, shortcut: 'S' },
    { title: 'Print Multi-Card A4 Sheet', path: '/cards/print-sheet', icon: FileText, shortcut: 'A' },
    { title: 'View Branch Financial Report', path: '/reports', icon: Zap, shortcut: 'R' }
  ].filter(a => !q || a.title.toLowerCase().includes(q));

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -20 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-brand-blue dark:text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a patient name, Patient ID, Card number (LHC-...), or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700">ESC</kbd>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">Quick Actions</span>
              <div className="space-y-1">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelect(action.path)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-brand-blue dark:text-blue-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{action.title}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Patients */}
          {matchedPatients.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">Patients ({matchedPatients.length})</span>
              <div className="space-y-1">
                {matchedPatients.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(`/patients/${p.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.photoUrl || '/logo.jpg'} alt="" className="w-7 h-7 rounded-lg object-cover" />
                      <div>
                        <strong className="text-slate-900 dark:text-white block">{p.fullName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{p.id} • {p.mobile}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      View Profile →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Cards */}
          {matchedCards.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">Health Cards</span>
              <div className="space-y-1">
                {matchedCards.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(`/card-studio?patientId=${c.patientId}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-xs"
                  >
                    <div>
                      <strong className="font-mono text-brand-blue dark:text-blue-400 block">{c.cardNumber}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">Key: {c.verificationCode} • Valid thru: {c.expiryDate}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                      Studio →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {q && matchedPatients.length === 0 && matchedCards.length === 0 && quickActions.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching patients, cards, or actions found for "{query}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Tip: Press <strong>Ctrl + K</strong> from any page to open Spotlight Search.</span>
          </div>
          <span>LABMEDIX Auto System</span>
        </div>
      </motion.div>
    </div>
  );
};