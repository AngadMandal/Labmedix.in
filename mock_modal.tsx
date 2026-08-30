import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Membership, CardApplicationRequest, ApplicationFamilyMember, CashDeskVoucher } from '../../types';
import { StorageService } from '../../services/storage';
import { PortalService } from '../../services/portalService';
import { IntegrationService } from '../../services/integrationService';
import { CashDeskVoucherService } from '../../services/cashDeskVoucherService';
import { DoctorMasterService, DoctorMasterItem } from '../../services/doctorMasterService';
import { AddressAutoPopupModal } from '../common/AddressAutoPopupModal';
import { AddressLookupService } from '../../services/addressLookupService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { GooglePayMerchantQR } from '../payment/GooglePayMerchantQR';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  QrCode,
  Printer,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Smartphone,
  Copy,
  Check,
  Building2,
  Lock,
  Users2,
  Plus,
  Trash2,
  Wallet,
  Clock,
  Search,
  ExternalLink,
  Camera,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  MapPin,
  HeartHandshake,
  Ticket,
  KeyRound,
  ShieldAlert,
  Coins,
  Receipt,
  FileCheck,
  Stethoscope,
  Activity,
  Heart,
  UserCheck,
  Building
} from 'lucide-react';

interface PatientCardApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationComplete?: (application: CardApplicationRequest) => void;
  onOpenStatusTracker?: (appNo?: string) => void;
}

export const PatientCardApplicationModal: React.FC<PatientCardApplicationModalProps> = ({
  isOpen,
  onClose,
  onApplicationComplete,
  onOpenStatusTracker
}) => {
  const { showToast } = useToast();
  const memberships = StorageService.getMemberships().filter(m => m.status === 'active');
  const company = StorageService.getCompanyProfile();

  // Multi-step Wizard: 1: Profile -> 2: 3D Plan -> 3: Payment -> 4: Success Slip
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // 0. Passport Size Photo State (Mandatory)
  const [photoUrl, setPhotoUrl] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample Passport Photos for Quick 1-Click Testing
  const samplePassportPhotos = [
    { name: 'Male Applicant', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
    { name: 'Female Applicant', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
    { name: 'Senior Citizen', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80' },
    { name: 'Young Adult', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80' },
  ];

  // Step 1: Patient Profile Form State (Clean defaults, zero dummy prefilled data)
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');

  // Address Details (Mandatory)
  const [cityArea, setCityArea] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [district, setDistrict] = useState('Kolkata');
  const [stateVal, setStateVal] = useState('West Bengal');
  const [pinCode, setPinCode] = useState('');
  const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);

  // Instant PIN Code Auto-Resolve
  const handlePinCodeChange = (newPin: string) => {
    setPinCode(newPin);
