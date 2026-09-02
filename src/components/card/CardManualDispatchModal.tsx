import React, { useState } from 'react';
import { CardDispatchRecord, CardCourierPartner, CardDispatchPriority, HealthCard, Patient } from '../../types';
import { CardDispatchService } from '../../services/cardDispatchService';
import { StorageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { X, Plus, Truck, User, CreditCard } from 'lucide-react';

interface CardManualDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (record: CardDispatchRecord) => void;
}

export const CardManualDispatchModal: React.FC<CardManualDispatchModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const { showToast } = useToast();
  const cards = StorageService.getCards().filter(c => !c.isDeleted && c.status !== 'deleted');
  const patients = StorageService.getPatients();

  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [courierPartner, setCourierPartner] = useState<CardCourierPartner>('speed_post');
  const [priority, setPriority] = useState<CardDispatchPriority>('standard');
  const [customConsignment, setCustomConsignment] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const selectedCard = cards.find(c => c.id === selectedCardId);
  const patient = patients.find(p => p.id === selectedCard?.patientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !patient) {
      showToast('error', 'Please select a valid health card and patient');
      return;
    }

    const record = CardDispatchService.createDispatch({
      cardId: selectedCard.id,
      cardNumber: selectedCard.cardNumber,
      patientId: patient.id,
      patientName: patient.fullName,
      patientMobile: patient.mobile,
      patientEmail: patient.email,
      bloodGroup: patient.bloodGroup,
      photoUrl: patient.photoUrl,
      address: patient.address,
      courierPartner,
      priority,
      consignmentNo: customConsignment.trim() || undefined,
      notes: notes.trim() || 'Manual card dispatch order created'
    });

    onCreated(record);
    showToast('success', `Dispatch order ${record.id} created!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-brand-blue border border-blue-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Create New Card Dispatch Order
              </h3>
              <p className="text-xs text-slate-500">
                Queue a health card for physical printing & courier fulfillment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Health Card & Cardholder
            </label>
            <select
              value={selectedCardId}
              onChange={e => setSelectedCardId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
            >
              {cards.map(c => {
                const pat = patients.find(p => p.id === c.patientId);
                return (
                  <option key={c.id} value={c.id}>
                    {c.cardNumber} — {pat?.fullName || 'Unknown'} ({pat?.mobile || ''})
                  </option>
                );
              })}
            </select>
          </div>

          {patient && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">Recipient: {patient.fullName}</div>
              <div className="text-slate-500">Address: {patient.address?.fullAddress || `${patient.address?.district}, ${patient.address?.pinCode}`}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Logistics Partner
              </label>
              <select
                value={courierPartner}
                onChange={e => setCourierPartner(e.target.value as CardCourierPartner)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
              >
                <option value="speed_post">Speed Post</option>
                <option value="bluedart">Blue Dart</option>
                <option value="delhivery">Delhivery</option>
                <option value="dtdc">DTDC</option>
                <option value="executive_hand">Field Agent Hand Delivery</option>
                <option value="counter_pickup">Counter Self-Pickup</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as CardDispatchPriority)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
              >
                <option value="standard">Standard (2-4 Days)</option>
                <option value="high">High Priority (1-2 Days)</option>
                <option value="urgent">Urgent / Emergency Same-Day</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Custom Consignment AWB # (Optional, leave blank to auto-generate)
            </label>
            <input
              type="text"
              value={customConsignment}
              onChange={e => setCustomConsignment(e.target.value)}
              placeholder="Auto-generated if empty"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Dispatch Instructions / Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Call before delivery, senior citizen household"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="gap-1.5 shadow-md">
              <Plus className="w-4 h-4" />
              Enqueue Card Dispatch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
