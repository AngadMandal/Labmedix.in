import os

content = """import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

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

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Mock submit
    setTimeout(() => {
      setIsSubmitting(false);
      const app = { applicationNo: 'APP-' + Date.now(), totalPaidAmount: 500 };
      onApplicationComplete(app);
      setStep(4);
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Health Card Application" size="xl">
      <div className="p-4 space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Basic Information</h3>
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)}>Next Step <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Select Membership Plan</h3>
            <div className="p-4 rounded-xl border border-teal-500 bg-slate-900 cursor-pointer">
              <h4 className="text-teal-400 font-bold">Standard Health Card</h4>
              <p className="text-slate-300">₹500 / year</p>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button onClick={() => setStep(3)}>Proceed to Payment <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Payment</h3>
            <p className="text-slate-300">Pay using UPI or NetBanking</p>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button variant="primary" isLoading={isSubmitting} onClick={handleSubmit}>Submit Application</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-emerald-400">Application Submitted!</h3>
            <p className="text-slate-300">Your application has been logged successfully.</p>
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
"""

with open('src/components/portal/PatientCardApplicationModal.tsx', 'w') as f:
    f.write(content)
