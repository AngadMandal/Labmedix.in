import React, { useState } from 'react';
import { HealthCard, Patient } from '../../types';
import { CardService } from '../../services/cardService';
import { StorageService } from '../../services/storage';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { triggerConfetti } from '../../utils/confetti';
import { RefreshCw, Calendar, ShieldCheck } from 'lucide-react';

interface CardRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: HealthCard;
  patient: Patient;
  onSuccess: (updatedCard: HealthCard) => void;
}

export const CardRenewalModal: React.FC<CardRenewalModalProps> = ({
  isOpen,
  onClose,
  card,
  patient,
  onSuccess
}) => {
  const [months, setMonths] = useState<number>(12);
  const [fee, setFee] = useState<string>('299');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const memberships = StorageService.getMemberships();
  const mem = memberships.find(m => m.id === card.membershipId) || memberships[0];

  const handleRenew = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const res = CardService.renewCard(card.id, months, parseFloat(fee) || 0);
    setIsProcessing(false);

    if (res.error) {
      showToast('error', 'Renewal Failed', res.error);
    } else {
      showToast('success', 'Card Renewed!', `Card ${card.cardNumber} extended until ${res.card.expiryDate}`);
      onSuccess(res.card);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renew Health Card Validity" maxWidth="md">
      <form onSubmit={handleRenew} className="space-y-4">
        {/* Card Info Box */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Card Number:</span>
            <strong className="font-mono text-emerald-800 dark:text-emerald-300">{card.cardNumber}</strong>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Cardholder:</span>
            <strong>{patient.fullName}</strong>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Current Expiry:</span>
            <span className="text-red-500 font-bold">{formatDate(card.expiryDate)}</span>
          </div>
        </div>

        <Select
          label="Renewal Duration"
          value={String(months)}
          onChange={(e) => {
            const m = Number(e.target.value);
            setMonths(m);
            setFee(String(m === 24 ? mem.annualRenewalFee * 1.8 : mem.annualRenewalFee));
          }}
          options={[
            { value: '12', label: '1 Year (12 Months)' },
            { value: '24', label: '2 Years (24 Months)' },
            { value: '36', label: '3 Years (36 Months)' }
          ]}
        />

        <Input
          label="Renewal Fee Collected (₹)"
          type="number"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          required
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="submit" variant="success" isLoading={isProcessing} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Confirm Renewal
          </Button>
        </div>
      </form>
    </Modal>
  );
};