import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientService } from '../../services/patientService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { PhotoUploaderWebcam } from '../../components/common/PhotoUploaderWebcam';
import { ArrowLeft, Save } from 'lucide-react';

export const PatientEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const patient = PatientService.getById(id || '');

  const [fullName, setFullName] = useState(patient?.fullName || '');
  const [dob, setDob] = useState(patient?.dob || '');
  const [age, setAge] = useState(patient?.age || 0);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(patient?.gender || 'male');
  const [mobile, setMobile] = useState(patient?.mobile || '');
  const [whatsapp, setWhatsapp] = useState(patient?.whatsapp || '');
  const [email, setEmail] = useState(patient?.email || '');
  const [bloodGroup, setBloodGroup] = useState(patient?.bloodGroup || 'B+');
  const [photoUrl, setPhotoUrl] = useState(patient?.photoUrl || '');
  const [fullAddress, setFullAddress] = useState(patient?.address.fullAddress || '');
  const [emergencyName, setEmergencyName] = useState(patient?.emergencyContact.name || '');
  const [emergencyMobile, setEmergencyMobile] = useState(patient?.emergencyContact.mobile || '');
  const [allergies, setAllergies] = useState(patient?.medicalInfo.allergies || '');
  const [chronicConditions, setChronicConditions] = useState(patient?.medicalInfo.chronicConditions || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!patient) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl">
        <h3 className="font-bold text-slate-800 dark:text-white">Patient Not Found</h3>
        <Button className="mt-4" onClick={() => navigate('/patients')}>Back</Button>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updated = PatientService.updatePatient(patient.id, {
      fullName,
      dob,
      age,
      gender,
      mobile,
      whatsapp,
      email,
      bloodGroup,
      photoUrl,
      address: { ...patient.address, fullAddress },
      emergencyContact: { ...patient.emergencyContact, name: emergencyName, mobile: emergencyMobile },
      medicalInfo: { ...patient.medicalInfo, allergies, chronicConditions, bloodGroup }
    });

    setIsSaving(false);
    if (updated) {
      showToast('success', 'Profile Updated', `Changes to ${updated.fullName} saved.`);
      navigate(`/patients/${patient.id}`);
    } else {
      showToast('error', 'Update Failed', 'Could not save updates.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/patients/${patient.id}`)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel & Return
        </button>
        <span className="text-xs font-mono font-bold text-slate-500">Editing: {patient.id}</span>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit Patient Record</h3>

        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="shrink-0">
            <PhotoUploaderWebcam photoUrl={photoUrl} onPhotoChange={setPhotoUrl} />
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            <Input label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select
              label="Blood Group"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              options={[
                { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
                { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' }
              ]}
            />
            <Input label="Age" type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)} required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Residential Address" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} />
          </div>
          <Input label="Emergency Contact Name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
          <Input label="Emergency Mobile" value={emergencyMobile} onChange={(e) => setEmergencyMobile(e.target.value)} />
          <Input label="Known Allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
          <Input label="Chronic Conditions" value={chronicConditions} onChange={(e) => setChronicConditions(e.target.value)} />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={() => navigate(`/patients/${patient.id}`)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};