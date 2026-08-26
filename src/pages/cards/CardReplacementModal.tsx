import React, { useState } from 'react';
import { HealthCard, Patient } from '../../types';
import { CardService } from '../../services/cardService';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { Layers, AlertTriangle } from 'lucide-react';

interface CardReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldCard: HealthCard;
  patient: Patient;
  onSuccess: (newCard: HealthCard) => void;
}

export const CardReplacementModal: React.FC<CardReplacementModalProps> = ({
  isOpen,
  onClose,
  oldCard,
  patient,
  onSuccess
}) => {
  const [reason, setReason] = useState('Lost Card');
  const [customNotes, setCustomNotes] = useState('');
  const [replacementFee, setReplacementFee] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const handleReplace = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const fullReason = customNotes ? `${reason}: ${customNotes}` : reason;
    const res = CardService.replaceCard(oldCard.id, fullReason, parseFloat(replacementFee) || 0);
    setIsProcessing(false);

    if (res) {
      showToast('success', 'Card Replaced', `Old card flagged as Replaced. New card ${res.newCard.cardNumber} issued.`);
      onSuccess(res.newCard);
      onClose();
    } else {
      showToast('error', 'Replacement Failed', 'Could not replace card.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue Replacement Health Card" maxWidth="md">
      <form onSubmit={handleReplace} className="space-y-4">
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Card Replacement Policy</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Replacing this card will mark <strong>{oldCard.cardNumber}</strong> as REPLACED and deactivate its QR verification, issuing a new secure card number.
          </p>
        </div>

        <Select
          label="Reason for Card Replacement"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={[
            { value: 'Lost Card', label: '🔍 Physical Card Lost by Patient' },
            { value: 'Damaged / Broken Card', label: '💔 Card Damaged / Scratched' },
            { value: 'Name / Blood Group Correction', label: '✏️ Incorrect Information on Card' },
            { value: 'Tier Upgrade', label: '⭐ Membership Tier Upgrade' }
          ]}
        />

        <Input
          label="Additional Incident Notes"
          placeholder="e.g. Reported at front desk by patient"
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
        />

        <Input
          label="PVC Re-issue Card Fee (₹)"
          type="number"
          value={replacementFee}
          onChange={(e) => setReplacementFee(e.target.value)}
          required
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" isLoading={isProcessing} leftIcon={<Layers className="w-4 h-4" />}>
            Confirm & Issue New Card
          </Button>
        </div>
      </form>
    </Modal>
  );
};