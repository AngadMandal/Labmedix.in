import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient, HealthCard, Membership, CompanyProfile } from '../../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { CR80CardFront } from '../card/CR80CardFront';
import { formatDate } from '../../utils/formatters';
import { CreditCard, Heart, MapPin, Phone, Calendar, ArrowRight, UserCheck } from 'lucide-react';

interface PatientQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  card?: HealthCard;
  membership?: Membership;
  company: CompanyProfile;
}

export const PatientQuickViewModal: React.FC<PatientQuickViewModalProps> = ({
  isOpen,
  onClose,
  patient,
  card,
  membership,
  company
}) => {
  const navigate = useNavigate();
  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Quick-View Summary" maxWidth="lg">
      <div className="space-y-6">
        {/* Top Demographics Box */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <img
            src={patient.photoUrl || '/logo.jpg'}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border shadow-sm"
          />
          <div className="flex-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">{patient.fullName}</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
              <span>{patient.id}</span>
              <span>•</span>
              <span>{patient.mobile}</span>
              <span>•</span>
              <span className="text-red-500 font-bold">{patient.bloodGroup}</span>
              <span>•</span>
              <span>{patient.age} Y / {patient.gender.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Live Card Preview */}
        {card && membership && (
          <div className="flex flex-col items-center">
            <div className="scale-90 sm:scale-95 origin-top">
              <CR80CardFront patient={patient} card={card} membership={membership} company={company} />
            </div>
          </div>
        )}

        {/* Quick Address & Medical */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Address</span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{patient.address.fullAddress}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Emergency Contact</span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{patient.emergencyContact.name} ({patient.emergencyContact.mobile})</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => {
              onClose();
              navigate(`/patients/${patient.id}`);
            }}
          >
            Open Full 8-Tab Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
};