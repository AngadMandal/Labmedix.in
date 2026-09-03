import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PatientService } from '../../services/patientService';
import { CardService } from '../../services/cardService';
import { StorageService } from '../../services/storage';
import { useSettings } from '../../context/SettingsContext';
import { Membership } from '../../types';
import { CardStudio } from '../../components/card/CardStudio';
import { Card3DPhysicalShowcase } from '../../components/card/Card3DPhysicalShowcase';
import { CardStatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Palette, Users, RefreshCw, Layers, ArrowLeft, CheckCircle2, AlertCircle, Rotate3d, Sliders } from 'lucide-react';

export const CardStudioPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { companyProfile } = useSettings();

  const [activeView, setActiveView] = useState<'studio' | '3d_showcase'>('studio');
  const patientIdFromQuery = searchParams.get('patientId');
  const patients = PatientService.getAll();
  const memberships = StorageService.getMemberships();

  // Selected Patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    if (patientIdFromQuery && patients.some(p => p.id === patientIdFromQuery)) {
      return patientIdFromQuery;
    }
    return patients[0]?.id || '';
  });

  useEffect(() => {
    if (patientIdFromQuery && patientIdFromQuery !== selectedPatientId) {
      setSelectedPatientId(patientIdFromQuery);
    }
  }, [patientIdFromQuery]);

  const handlePatientChange = (pId: string) => {
    setSelectedPatientId(pId);
    setSearchParams({ patientId: pId });
  };

  const defaultMembership: Membership = {
    id: 'tier_standard',
    name: 'Standard Care Membership',
    slug: 'standard-care',
    validityMonths: 12,
    registrationFee: 0,
    annualRenewalFee: 0,
    opdDiscount: 20,
    labDiscount: 20,
    pharmacyDiscount: 10,
    homeCollectionDiscount: 15,
    specialBenefits: ['Digital Health Card', 'Free Annual Checkup'],
    color: '#3b82f6',
    badgeIcon: 'Shield',
    isFamilyPlan: true,
    maxFamilyMembers: 4,
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z'
  };

  const patient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const card = patient ? CardService.getById(patient.healthCardId || '') || CardService.getAll().find(c => c.patientId === patient.id) : null;
  const membership = (card ? memberships.find(m => m && m.id === card.membershipId) : null) || memberships[0] || defaultMembership;

  if (!patient || !card) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-black text-slate-900 dark:text-white">No Health Card Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
          Please register a patient first or select a patient who has an active health card.
        </p>
        <Button variant="primary" onClick={() => navigate('/patients/new')}>
          Register Patient
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Patient Quick Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Palette className="w-7 h-7 text-brand-blue" />
            CR80 PVC Card Studio & 3D Visualizer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dual-sided ISO-7810 card designer, framer-motion 3D physical showcase, and print vector export engine.
          </p>
        </div>

        {/* View Mode Switcher & Patient Picker */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold font-mono">
            <button
              onClick={() => setActiveView('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'studio' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Card Studio</span>
            </button>
            <button
              onClick={() => setActiveView('3d_showcase')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === '3d_showcase' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              <Rotate3d className="w-3.5 h-3.5" />
              <span>Interactive 3D Preview</span>
            </button>
          </div>

          <div className="w-60">
            <Select
              value={selectedPatientId}
              onChange={(e) => handlePatientChange(e.target.value)}
              options={patients.map(p => ({
                value: p.id,
                label: `${p.fullName} (${p.id})`
              }))}
            />
          </div>
        </div>
      </div>

      {/* Selected Card Status Ribbon */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <img src={patient.photoUrl || '/logo.jpg'} alt="" className="w-8 h-8 rounded-lg object-cover border shadow-xs" />
          <div>
            <strong className="text-slate-900 dark:text-white font-bold block">{patient.fullName}</strong>
            <span className="text-slate-400 font-mono text-[10px]">Card: {card.cardNumber} • Code: {card.verificationCode}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400">Card Status:</span>
          <CardStatusBadge status={card.status} />
          <span className="text-slate-400">Plan:</span>
          <strong className="text-blue-600 dark:text-blue-400 font-bold">{membership.name}</strong>
        </div>
      </div>

      {/* Active View: Studio vs 3D Physical Showcase */}
      {activeView === '3d_showcase' ? (
        <Card3DPhysicalShowcase
          patient={patient}
          card={card}
          membership={membership}
          company={companyProfile}
        />
      ) : (
        <CardStudio
          patient={patient}
          card={card}
          membership={membership}
          company={companyProfile}
        />
      )}
    </div>
  );
};