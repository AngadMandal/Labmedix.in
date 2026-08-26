import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { HealthCard } from '../../types';
import { StorageService } from '../../services/storage';
import { CardService } from '../../services/cardService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import {
  ShieldAlert,
  Trash2,
  AlertTriangle,
  Lock,
  Archive,
  Clock,
  CheckCircle2,
  XCircle,
  FileWarning
} from 'lucide-react';

export interface SuperAdminCardDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: HealthCard | null;
  onDeleted: () => void;
}

export const SuperAdminCardDeleteModal: React.FC<SuperAdminCardDeleteModalProps> = ({
  isOpen,
  onClose,
  card,
  onDeleted
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [deleteMode, setDeleteMode] = useState<'soft_archive' | 'permanent_purge'>('soft_archive');
  const [deleteReason, setDeleteReason] = useState('Administrative Cardholder Revocation');
  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!card) return null;

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const patient = StorageService.getPatients().find(p => p.id === card.patientId);

  const handleDelete = () => {
    if (!isSuperAdmin) {
      showToast('error', 'Access Denied', 'Only Super Administrator is authorized to delete or revoke issued health cards.');
      return;
    }

    if (deleteMode === 'permanent_purge' && confirmText.trim().toUpperCase() !== 'CONFIRM DELETE') {
      showToast('error', 'Confirmation Required', 'Please type "CONFIRM DELETE" to permanently expunge this card.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const res = CardService.deleteCard(
        card.id,
        deleteReason.trim() || 'Super Admin Administrative Action',
        deleteMode === 'permanent_purge',
        currentUser?.role || 'super_admin',
        currentUser?.fullName || 'Super Administrator'
      );

      setIsProcessing(false);

      if (res.success) {
        if (res.permanent) {
          showToast('warning', 'Card Permanently Purged', `Card ${card.cardNumber} has been expunged from all database records.`);
        } else {
          showToast('success', 'Card Revoked & Archived', `Card ${card.cardNumber} is archived. Cardholder portal access locked with 30-day retention window.`);
        }
        onDeleted();
        onClose();
      } else {
        showToast('error', 'Action Failed', res.error || 'Could not delete card.');
      }
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Super-Admin Health Card Deletion & Revocation Protocol"
      maxWidth="2xl"
    >
      <div className="space-y-6 text-xs">
        {/* Warning Banner */}
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 flex items-start gap-3 shadow-lg">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase text-white">
              Super-Admin Controlled Credential Security
            </h4>
            <p className="text-[11px] text-rose-300 leading-relaxed">
              Once an official Health Card is issued to a patient, non-super-admin users cannot delete it.
              When a card is deleted, <strong>the cardholder's portal access is immediately blocked</strong>, QR code verification fails, and cashless hospital bookings are disabled.
            </p>
          </div>
        </div>

        {/* Target Card Identity Details */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Target Card Number:</span>
            <strong className="text-teal-400 text-sm font-black">{card.cardNumber}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Patient Holder:</span>
            <strong className="text-white">{patient?.fullName || card.patientId} ({card.patientId})</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Current Card Status:</span>
            <span className="text-amber-400 font-bold uppercase">{card.status}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Card Expiry Date:</span>
            <span>{card.expiryDate}</span>
          </div>
        </div>

        {/* Deletion Mode Selector */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Select Deletion Level:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Soft Archive (Recommended) */}
            <div
              onClick={() => setDeleteMode('soft_archive')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                deleteMode === 'soft_archive'
                  ? 'bg-amber-950/40 border-amber-500 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-amber-300 uppercase flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-amber-400" />
                  1. Soft Archive & Revoke
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Recommended
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400">
                Immediately locks cardholder login and QR scan. Keeps records in archived queue with a <strong>30-day retention window</strong> for Admin/Super-Admin restoration.
              </p>
            </div>

            {/* Option 2: Permanent Purge (Hard Delete) */}
            <div
              onClick={() => setDeleteMode('permanent_purge')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                deleteMode === 'permanent_purge'
                  ? 'bg-rose-950/60 border-rose-500 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-rose-400 uppercase flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  2. Permanent Purge
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Irreversible
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400">
                Permanently wipes card from database and unlinks it from the patient master record. <strong>Cannot be restored</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Deletion Reason Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
            Reason for Revocation / Deletion (Logged in Audit Trail):
          </label>
          <Input
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="e.g. Duplicate Card Issued / Patient Left Region / Fraudulent Application"
            required
          />
        </div>

        {/* Permanent Delete Confirmation Input */}
        {deleteMode === 'permanent_purge' && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/80 space-y-2">
            <label className="text-[11px] font-black text-rose-300 block">
              ⚠️ Permanent Purge Confirmation: Type <span className="font-mono text-white bg-black/60 px-1.5 py-0.5 rounded">CONFIRM DELETE</span> to proceed:
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type CONFIRM DELETE"
              className="border-rose-500"
            />
          </div>
        )}

        {/* Security Info: 30 Days Retention Window */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10.5px] text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            <strong>30-Day Retention Policy:</strong> If archived, administrators can restore this card within 30 days (1 month). After 1 month, the retention request window expires and restoration is blocked.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>

          <Button
            variant="danger"
            size="sm"
            className="font-black shadow-lg"
            isLoading={isProcessing}
            disabled={!isSuperAdmin || (deleteMode === 'permanent_purge' && confirmText.trim().toUpperCase() !== 'CONFIRM DELETE')}
            onClick={handleDelete}
          >
            {deleteMode === 'permanent_purge' ? '🔥 Permanently Purge All Records' : '🛑 Revoke & Archive Card (30-Day Retention)'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
