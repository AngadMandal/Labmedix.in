import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storage';
import { PortalService, BloodTestBooking } from '../../services/portalService';
import { formatDateTime, formatDate, formatCurrency } from '../../utils/formatters';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Clock,
  X,
  ArrowRight,
  CreditCard,
  Activity,
  TestTube,
  CalendarCheck,
  Pill,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const cards = StorageService.getCards();
  const wallets = StorageService.getWallets();
  const auditLogs = StorageService.getAuditLogs().slice(0, 5);

  // Live Cardholder Portal Requests
  const [labBookings, setLabBookings] = useState<BloodTestBooking[]>(() =>
    PortalService.getLabBookings()
  );

  const appointments: any[] = StorageService.getItem<any[]>('labmedix_emr_appointments', []);

  const expiredCards = cards.filter(c => c.status === 'expired' || new Date(c.expiryDate) < new Date());
  const pendingLabBookings = labBookings.filter(b => b.status === 'confirmed' || b.status === 'phlebotomist_assigned');
  const pendingAppointments = appointments.filter(a => a.status === 'doctor_confirmed' || a.status === 'pending_doctor_approval' || a.status === 'in_consultation');

  const handleConfirmSample = (bookingId: string, patientName: string) => {
    PortalService.updateLabBookingStatus(bookingId, 'sample_collected');
    const updated = PortalService.getLabBookings();
    setLabBookings(updated);
    triggerCelebrationFireworks();
    showToast('success', 'Sample Confirmed', `Blood sample collected for ${patientName}.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-500 animate-pulse" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">Admin & Phlebotomy Alerts</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. Phlebotomy Blood Test Requests Alert */}
          {pendingLabBookings.length > 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400/80 dark:border-amber-700 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-xs uppercase tracking-wide">
                  <TestTube className="w-4 h-4 text-amber-500 animate-bounce" />
                  <span>Phlebotomy Blood Requests ({pendingLabBookings.length})</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 uppercase font-mono">
                  ACTION REQUIRED
                </span>
              </div>

              <div className="space-y-2">
                {pendingLabBookings.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-xs space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <strong className="text-slate-900 dark:text-white">{b.patientName}</strong>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-mono">{formatCurrency(b.netPrice)}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      🧪 {b.testName}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>{b.collectionType === 'home_collection' ? '🏠 Home Sample' : '🏥 Lab Visit'} • {formatDate(b.scheduledDate)}</span>
                      <button
                        onClick={() => handleConfirmSample(b.id, b.patientName)}
                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3 h-3" /> Confirm Sample
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  onClose();
                  navigate('/patients');
                }}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 pt-1"
              >
                View in Patient Directory <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>All phlebotomy sample collections up-to-date.</span>
            </div>
          )}

          {/* 2. Cardholder OPD Appointments Alert */}
          {pendingAppointments.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex items-center justify-between text-blue-800 dark:text-blue-300 font-bold text-xs">
                <div className="flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4" />
                  <span>Cardholder OPD Wish Appointments ({pendingAppointments.length})</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {pendingAppointments.length} patient consultation wish(es) waiting in Doctor EMR suite.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/emr');
                }}
                className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 pt-1"
              >
                Open Doctor EMR Hub <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 3. Expired Cards Alerts */}
          {expiredCards.length > 0 && (
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Cards Expired / Need Renewal ({expiredCards.length})</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {expiredCards.length} patient health card(s) have passed validity date.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/cards');
                }}
                className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 pt-1"
              >
                Review Cards in Directory <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 4. Live Recent Activity */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Live Audit Activity</span>
            {auditLogs.map(log => (
              <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-0.5">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>{log.action.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-500 line-clamp-1 text-[11px]">{log.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={() => {
              onClose();
              navigate('/activity');
            }}
            className="text-xs font-bold text-slate-500 hover:text-brand-blue"
          >
            Open Complete Cryptographic Audit Logs →
          </button>
        </div>
      </motion.div>
    </div>
  );
};