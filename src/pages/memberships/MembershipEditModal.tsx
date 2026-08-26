import React, { useState } from 'react';
import { Membership } from '../../types';
import { MembershipService } from '../../services/membershipService';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';

interface MembershipEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  membership?: Membership | null;
  onSuccess: () => void;
}

export const MembershipEditModal: React.FC<MembershipEditModalProps> = ({
  isOpen,
  onClose,
  membership,
  onSuccess
}) => {
  const { showToast } = useToast();
  const isEditing = !!membership;

  const [name, setName] = useState(membership?.name || '');
  const [validityMonths, setValidityMonths] = useState(membership?.validityMonths || 12);
  const [registrationFee, setRegistrationFee] = useState(membership?.registrationFee || 499);
  const [annualRenewalFee, setAnnualRenewalFee] = useState(membership?.annualRenewalFee || 299);
  const [opdDiscount, setOpdDiscount] = useState(membership?.opdDiscount || 20);
  const [labDiscount, setLabDiscount] = useState(membership?.labDiscount || 25);
  const [pharmacyDiscount, setPharmacyDiscount] = useState(membership?.pharmacyDiscount || 10);
  const [homeCollectionDiscount, setHomeCollectionDiscount] = useState(membership?.homeCollectionDiscount || 50);
  const [benefitsText, setBenefitsText] = useState(membership?.specialBenefits.join('\n') || 'Specialist Consultations Discount\nPathology & Radiology Test Discounts\nPharmacy Flat Discount');
  const [color, setColor] = useState(membership?.color || '#0B4F9C');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const benefitsArray = benefitsText.split('\n').map(s => s.trim()).filter(Boolean);

    if (isEditing && membership) {
      MembershipService.update(membership.id, {
        name,
        validityMonths,
        registrationFee,
        annualRenewalFee,
        opdDiscount,
        labDiscount,
        pharmacyDiscount,
        homeCollectionDiscount,
        specialBenefits: benefitsArray,
        color
      });
      showToast('success', 'Tier Updated', `${name} tier configuration saved.`);
    } else {
      MembershipService.create({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '_'),
        validityMonths,
        registrationFee,
        annualRenewalFee,
        opdDiscount,
        labDiscount,
        pharmacyDiscount,
        homeCollectionDiscount,
        specialBenefits: benefitsArray,
        color,
        badgeIcon: 'Shield',
        isFamilyPlan: false,
        status: 'active'
      });
      showToast('success', 'Tier Created', `${name} membership tier created.`);
    }
    onSuccess();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? `Edit ${membership?.name}` : 'Create Membership Tier'} maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Membership Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Badge Color (Hex)" value={color} onChange={(e) => setColor(e.target.value)} required />
          <Input label="Registration Fee (₹)" type="number" value={registrationFee} onChange={(e) => setRegistrationFee(Number(e.target.value))} required />
          <Input label="Renewal Fee (₹)" type="number" value={annualRenewalFee} onChange={(e) => setAnnualRenewalFee(Number(e.target.value))} required />
          <Input label="Validity (Months)" type="number" value={validityMonths} onChange={(e) => setValidityMonths(Number(e.target.value))} required />
          <Input label="OPD Discount (%)" type="number" value={opdDiscount} onChange={(e) => setOpdDiscount(Number(e.target.value))} required />
          <Input label="Lab Discount (%)" type="number" value={labDiscount} onChange={(e) => setLabDiscount(Number(e.target.value))} required />
          <Input label="Pharmacy Discount (%)" type="number" value={pharmacyDiscount} onChange={(e) => setPharmacyDiscount(Number(e.target.value))} required />
          <div className="sm:col-span-2">
            <Input label="Home Collection Discount (%) - 100 for Free" type="number" value={homeCollectionDiscount} onChange={(e) => setHomeCollectionDiscount(Number(e.target.value))} required />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            Special Benefits (One benefit per line)
          </label>
          <textarea
            rows={4}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            value={benefitsText}
            onChange={(e) => setBenefitsText(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Membership Tier
          </Button>
        </div>
      </form>
    </Modal>
  );
};