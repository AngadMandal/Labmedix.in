import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, ArrowRight, ArrowLeft, Star, Shield } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { StorageService } from '../../services/storage';
import { MembershipTierService } from '../../services/membershipTierService';
import { Membership } from '../../types';

interface PatientCardApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationComplete: (app: any) => void;
  onOpenStatusTracker?: (appNo: string) => void;
}

export const PatientCardApplicationModal: React.FC<PatientCardApplicationModalProps> = ({
  isOpen,
  onClose,
  onApplicationComplete,
  onOpenStatusTracker
}) => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [memberships, setMemberships] = useState<Membership[]>(() => StorageService.getActiveMemberships());
  const [selectedMembershipId, setSelectedMembershipId] = useState<string>(() => 
    StorageService.getRecommendedMembership()?.id || StorageService.getActiveMemberships()[0]?.id || ''
  );

  useEffect(() => {
    const unsub = MembershipTierService.subscribeToTiers((allTiers) => {
      const active = allTiers.filter(t => t.status === 'active');
      setMemberships(active);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const selectedTier = memberships.find(m => m.id === selectedMembershipId) || memberships[0];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const app = { 
        applicationNo: 'APP-' + Date.now(), 
        totalPaidAmount: selectedTier?.registrationFee || 500,
        membershipName: selectedTier?.name || 'Standard Health Shield'
      };
      onApplicationComplete(app);
      setStep(4);
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Health Card Application" maxWidth="xl">
      <div className="p-4 space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Basic Information</h3>
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)}>Next Step <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Select Health Card Membership Tier</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {memberships.map((m) => {
                const isSelected = (selectedMembershipId === m.id) || (!selectedMembershipId && m.isRecommended);
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMembershipId(m.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                        : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                    }`}
                  >
                    {m.isRecommended && (
                      <span className="absolute -top-2.5 right-3 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <Star className="w-2.5 h-2.5 fill-slate-950" /> Recommended
                      </span>
                    )}
                    <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-amber-400" />
                      {m.name}
                    </h4>
                    <p className="text-emerald-400 font-mono text-xs font-bold mt-1">
                      {formatCurrency(m.registrationFee)} / year
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      OPD: {m.opdDiscount}% OFF • Lab: {m.labDiscount}% OFF
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button onClick={() => setStep(3)}>Proceed to Payment ({formatCurrency(selectedTier?.registrationFee || 0)}) <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Payment & Confirmation</h3>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Selected Plan:</span>
                <strong className="text-white">{selectedTier?.name}</strong>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Annual Fee:</span>
                <strong className="text-emerald-400 font-mono">{formatCurrency(selectedTier?.registrationFee || 0)}</strong>
              </div>
            </div>
            <p className="text-slate-400 text-xs">Payment mode: Instant QR / UPI / NetBanking</p>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button variant="primary" isLoading={isSubmitting} onClick={handleSubmit}>
                Pay & Submit Application
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-emerald-400">Application Submitted!</h3>
            <p className="text-slate-300">Your application for {selectedTier?.name} has been received.</p>
            <div className="flex justify-center pt-4 gap-4">
              {onOpenStatusTracker && (
                <Button variant="outline" onClick={() => { onClose(); onOpenStatusTracker('APP-1234'); }}>Track Status</Button>
              )}
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
