import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storage';
import { CardA4Sheet } from '../../components/card/CardA4Sheet';
import { Button } from '../../components/common/Button';
import { ArrowLeft, Layers } from 'lucide-react';

export const CardPrintSheetPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const patients = StorageService.getPatients();
  const cards = StorageService.getCards();
  const memberships = StorageService.getMemberships();
  const company = StorageService.getCompanyProfile();

  const patientId = searchParams.get('patientId');

  // Prepare cards for sheet
  const patientsWithCards = cards.map(c => {
    const p = patients.find(pat => pat.id === c.patientId);
    const m = memberships.find(mem => mem.id === c.membershipId) || memberships[0];
    if (!p) return null;
    return { patient: p, card: c, membership: m };
  }).filter(Boolean) as any[];

  // If patientId was passed, prioritize that patient first
  if (patientId) {
    patientsWithCards.sort((a, b) => (a.patient.id === patientId ? -1 : 1));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/cards')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cards
          </button>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-brand-blue" />
            A4 Multi-Card Printing Studio
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Print multiple CR80 PVC Health Cards on single A4 sheets with cutting marks and millimeter precision.
          </p>
        </div>
      </div>

      <CardA4Sheet
        patientsWithCards={patientsWithCards}
        company={company}
      />
    </div>
  );
};