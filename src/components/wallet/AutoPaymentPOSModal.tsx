import React, { useState, useMemo, useEffect } from 'react';
import { Patient, Wallet, WalletTransaction, Membership, HealthCard } from '../../types';
import { WalletService } from '../../services/walletService';
import { StorageService } from '../../services/storage';
import { PatientService } from '../../services/patientService';
import { FamilyService } from '../../services/familyService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { LabMedixLogo } from '../common/LabMedixLogo';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  Stethoscope,
  FlaskConical,
  Pill,
  CalendarCheck,
  Building2,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Wallet as WalletIcon,
  Printer,
  Receipt,
  Search,
  ScanLine,
  Radio,
  Wifi,
  Users2,
  Plus,
  Trash2,
  QrCode,
  ShieldCheck,
  FileText,
  User,
  ShoppingBag,
  Heart
} from 'lucide-react';

export type POSDepartment = 'doctor_appointment' | 'opd_consult' | 'lab_pathology' | 'pharmacy' | 'daycare_procedure';

export interface POSLineItem {
  id: string;
  name: string;
  dept: POSDepartment;
  grossPrice: number;
  qty: number;
  discountPercentage: number;
  category: string;
}

interface ServicePreset {
  id: string;
  name: string;
  dept: POSDepartment;
  grossAmount: number;
  category: string;
  hsnCode: string;
}

const PRESET_SERVICES: ServicePreset[] = [
  // Doctor Appointments
  { id: 'doc_1', name: 'Dr. Subhashish Roy (Sr. Cardiologist & Director)', dept: 'doctor_appointment', grossAmount: 800, category: 'Cardiology OPD', hsnCode: '999312' },
  { id: 'doc_2', name: 'Dr. Anita Sen (Sr. Gynaecologist & Obstetrician)', dept: 'doctor_appointment', grossAmount: 750, category: 'Women Health', hsnCode: '999312' },
  { id: 'doc_3', name: 'Dr. Amit Patel (Pediatric & Neonatal Specialist)', dept: 'doctor_appointment', grossAmount: 650, category: 'Pediatrics', hsnCode: '999312' },
  { id: 'doc_4', name: 'Dr. Rajesh Sharma (Sr. General Physician & Internal Med)', dept: 'doctor_appointment', grossAmount: 500, category: 'General OPD', hsnCode: '999312' },
  { id: 'doc_5', name: 'Dr. Priya Banerjee (Orthopaedic & Joint Specialist)', dept: 'doctor_appointment', grossAmount: 850, category: 'Orthopaedics', hsnCode: '999312' },

  // OPD Consultations
  { id: 'opd_1', name: 'General Outpatient Clinical Examination & Vitals', dept: 'opd_consult', grossAmount: 350, category: 'OPD Services', hsnCode: '999311' },
  { id: 'opd_2', name: 'Emergency Triage & Primary Consultation', dept: 'opd_consult', grossAmount: 700, category: 'Emergency 24x7', hsnCode: '999311' },
  { id: 'opd_3', name: 'Specialist Follow-up Consultation Review', dept: 'opd_consult', grossAmount: 400, category: 'Follow-up', hsnCode: '999311' },

  // Lab Pathology
  { id: 'lab_1', name: 'Comprehensive Full Body Health Checkup (68 Tests)', dept: 'lab_pathology', grossAmount: 2500, category: 'Preventive Health', hsnCode: '999315' },
  { id: 'lab_2', name: 'Complete Blood Count (CBC) + ESR Auto-Analyzer', dept: 'lab_pathology', grossAmount: 450, category: 'Hematology', hsnCode: '999315' },
  { id: 'lab_3', name: 'Lipid Profile + Liver Function Test (LFT Profile)', dept: 'lab_pathology', grossAmount: 950, category: 'Biochemistry', hsnCode: '999315' },
  { id: 'lab_4', name: 'HbA1c Glycated Hemoglobin + Fasting Blood Sugar', dept: 'lab_pathology', grossAmount: 600, category: 'Diabetic Care', hsnCode: '999315' },
  { id: 'lab_5', name: 'Thyroid Panel Total (T3, T4, TSH Ultra-Sensitive)', dept: 'lab_pathology', grossAmount: 550, category: 'Endocrinology', hsnCode: '999315' },
  { id: 'lab_6', name: 'Digital Chest X-Ray / USG Abdomen & Pelvis', dept: 'lab_pathology', grossAmount: 1100, category: 'Radiology', hsnCode: '999315' },

  // Pharmacy
  { id: 'ph_1', name: 'Monthly Chronic Cardiac & Hypertension Medicine Kit', dept: 'pharmacy', grossAmount: 1850, category: 'Prescription Drugs', hsnCode: '300490' },
  { id: 'ph_2', name: 'Antibiotics, Pain Care & Antipyretic Wellness Kit', dept: 'pharmacy', grossAmount: 650, category: 'General Pharmacy', hsnCode: '300490' },
  { id: 'ph_3', name: 'Gastro-Protective & Multivitamin Essential Pack', dept: 'pharmacy', grossAmount: 450, category: 'Supplements', hsnCode: '300490' },

  // Daycare & Procedures
  { id: 'dc_1', name: 'Daycare Ward Admission & Minor Surgical Procedure', dept: 'daycare_procedure', grossAmount: 4500, category: 'Daycare OT', hsnCode: '999319' },
  { id: 'dc_2', name: 'Dialysis Session & Post-Procedure Care', dept: 'daycare_procedure', grossAmount: 2200, category: 'Special Procedures', hsnCode: '999319' }
];

interface AutoPaymentPOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPatientId?: string;
  onPaymentSuccess: (txn: WalletTransaction, wallet: Wallet) => void;
}

export const AutoPaymentPOSModal: React.FC<AutoPaymentPOSModalProps> = ({
  isOpen,
  onClose,
  initialPatientId,
  onPaymentSuccess
}) => {
  const { showToast } = useToast();
  const patients = PatientService.getAll();
  const cards = StorageService.getCards();
  const memberships = StorageService.getMemberships();
  const wallets = StorageService.getWallets();
  const company = StorageService.getCompanyProfile();

  const [cardSearchQuery, setCardSearchQuery] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatientId || (patients[0]?.id || '')
  );

  // Beneficiary selection (support for whole family coverage)
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>(
    initialPatientId || (patients[0]?.id || '')
  );

  // NFC Scanner State
  const [isNfcScanning, setIsNfcScanning] = useState(false);
  const [nfcSuccessTag, setNfcSuccessTag] = useState<string | null>(null);

  // Department & Service Catalog State
  const [selectedDept, setSelectedDept] = useState<POSDepartment>('doctor_appointment');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('doc_1');
  const [customGrossAmount, setCustomGrossAmount] = useState<string>('');
  const [customServiceName, setCustomServiceName] = useState<string>('');
  const [isCustomService, setIsCustomService] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Multi-Line Cart Line Items
  const [cartItems, setCartItems] = useState<POSLineItem[]>([
    {
      id: 'item_init_1',
      name: 'Dr. Subhashish Roy (Sr. Cardiologist & Director)',
      dept: 'doctor_appointment',
      grossPrice: 800,
      qty: 1,
      discountPercentage: 25,
      category: 'Cardiology OPD'
    }
  ]);

  // Settlement Mode when balance is insufficient: 'standard' | 'due_later' | 'instant_topup' | 'cash_copay'
  const [settlementOption, setSettlementOption] = useState<'standard' | 'due_later' | 'instant_topup' | 'cash_copay'>('standard');
  const [coPayCashInput, setCoPayCashInput] = useState<string>('');

  // Post-Payment Printable Invoice State
  const [completedInvoice, setCompletedInvoice] = useState<{
    invoiceNo: string;
    date: string;
    cardholder: Patient;
    beneficiary: Patient;
    card: HealthCard | null;
    membership: Membership | null;
    items: POSLineItem[];
    grossTotal: number;
    discountTotal: number;
    netTotal: number;
    walletDebit: number;
    cashCoPay: number;
    dueLogged: number;
    newWalletBalance: number;
  } | null>(null);

  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
      setSelectedBeneficiaryId(initialPatientId);
    }
  }, [initialPatientId]);

  // Primary Patient & Linked Family Shield Group
  const currentCardholder = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  const familyGroup = useMemo(() => {
    if (!currentCardholder) return undefined;
    return FamilyService.getByPatientId(currentCardholder.id);
  }, [currentCardholder]);

  const familyBeneficiaries = useMemo(() => {
    if (!familyGroup) return [currentCardholder].filter(Boolean);
    const allP = StorageService.getPatients();
    return familyGroup.members.map(m => {
      const p = allP.find(pat => pat.id === m.patientId);
      return {
        ...m,
        patientData: p
      };
    }).filter(m => m.patientData);
  }, [familyGroup, currentCardholder]);

  const currentBeneficiary = useMemo(() => {
    return patients.find(p => p.id === selectedBeneficiaryId) || currentCardholder;
  }, [patients, selectedBeneficiaryId, currentCardholder]);

  // Cardholder Wallet (Family Shared Float)
  const currentWallet = useMemo(() => {
    if (!currentCardholder) return null;
    return wallets.find(w => w.patientId === currentCardholder.id) || WalletService.getByPatientId(currentCardholder.id) || null;
  }, [wallets, currentCardholder]);

  // Cardholder Health Card & Membership Tier (applies to whole family)
  const activeCard = useMemo(() => {
    if (!currentCardholder) return null;
    return cards.find(c => c.patientId === currentCardholder.id && c.status === 'active') || null;
  }, [cards, currentCardholder]);

  const activeMembership = useMemo(() => {
    if (!activeCard) return null;
    return memberships.find(m => m.id === activeCard.membershipId) || null;
  }, [activeCard, memberships]);

  // Auto Discount Percentage based on Department & Card Membership Tier
  const getDiscountForDept = (dept: POSDepartment): number => {
    if (!activeMembership) return 0;
    switch (dept) {
      case 'doctor_appointment':
      case 'opd_consult':
        return activeMembership.opdDiscount || 0;
      case 'lab_pathology':
        return activeMembership.labDiscount || 0;
      case 'pharmacy':
        return activeMembership.pharmacyDiscount || 0;
      case 'daycare_procedure':
        return Math.min(activeMembership.opdDiscount || 15, 20);
      default:
        return 0;
    }
  };

  // Recalculate Cart Discounts when Patient/Membership Changes
  useEffect(() => {
    setCartItems(prev => prev.map(item => ({
      ...item,
      discountPercentage: getDiscountForDept(item.dept)
    })));
  }, [activeMembership]);

  // Quick Card / Patient Search Auto-Lookup
  const handleCardSearch = (term: string) => {
    setCardSearchQuery(term);
    const q = term.trim().toLowerCase();
    if (!q) return;

    const matchedCard = cards.find(
      c => c.cardNumber.toLowerCase().includes(q) || c.verificationCode.toLowerCase().includes(q) || (c.nfcUid && c.nfcUid.toLowerCase().includes(q))
    );

    if (matchedCard) {
      const p = patients.find(pat => pat.id === matchedCard.patientId);
      if (p) {
        setSelectedPatientId(p.id);
        setSelectedBeneficiaryId(p.id);
      }
    } else {
      const p = patients.find(
        pat => pat.id.toLowerCase().includes(q) ||
               pat.fullName.toLowerCase().includes(q) ||
               (pat.mobile && pat.mobile.includes(q))
      );
      if (p) {
        setSelectedPatientId(p.id);
        setSelectedBeneficiaryId(p.id);
      }
    }
  };

  // 1-Tap NFC Smart Card Scanner Simulation
  const handleSimulateNfcTap = () => {
    setIsNfcScanning(true);
    setNfcSuccessTag(null);

    setTimeout(() => {
      setIsNfcScanning(false);
      const randomCard = cards.find(c => c.status === 'active') || cards[0];
      if (randomCard) {
        const p = patients.find(pat => pat.id === randomCard.patientId);
        if (p) {
          setSelectedPatientId(p.id);
          setSelectedBeneficiaryId(p.id);
          setCardSearchQuery(randomCard.cardNumber);
          setNfcSuccessTag(`NFC-UID: ${randomCard.nfcUid || '04:E2:89:1A:B5:4C:80'} (${randomCard.cardNumber})`);
          triggerCelebrationFireworks();
          showToast('success', 'NFC Smart Card Tapped! 📡', `Read ${randomCard.cardNumber} for ${p.fullName} (13.56 MHz ISO 14443-A).`);
        }
      }
    }, 700);
  };

  // Active Service Items filtered by Department
  const departmentServices = useMemo(() => {
    return PRESET_SERVICES.filter(s => s.dept === selectedDept);
  }, [selectedDept]);

  // Selected Service Item
  const activeServiceItem = useMemo(() => {
    return PRESET_SERVICES.find(s => s.id === selectedServiceId) || departmentServices[0];
  }, [selectedServiceId, departmentServices]);

  // Add Item to Billing Cart
  const handleAddItemToCart = () => {
    const name = isCustomService ? (customServiceName || 'Custom Procedure / Investigation') : activeServiceItem.name;
    const grossPrice = isCustomService ? (parseFloat(customGrossAmount) || 500) : activeServiceItem.grossAmount;
    const category = isCustomService ? 'Special Procedure' : activeServiceItem.category;
    const disc = getDiscountForDept(selectedDept);

    const newItem: POSLineItem = {
      id: `cart_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      dept: selectedDept,
      grossPrice,
      qty: 1,
      discountPercentage: disc,
      category
    };

    setCartItems(prev => [...prev, newItem]);
    if (isCustomService) {
      setCustomServiceName('');
      setCustomGrossAmount('');
      setIsCustomService(false);
    }
    showToast('success', 'Item Added to Bill', `${name} added with ${disc}% card discount.`);
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateQty = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id);
      return;
    }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty: newQty } : i));
  };

  // Cart Financial Computations
  const totalGross = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.grossPrice * item.qty), 0);
  }, [cartItems]);

  const totalDiscount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const lineGross = item.grossPrice * item.qty;
      return sum + Math.round((lineGross * item.discountPercentage) / 100);
    }, 0);
  }, [cartItems]);

  const totalNetPayable = Math.max(0, totalGross - totalDiscount);
  const availableWalletBalance = currentWallet?.balance || 0;
  const isBalanceSufficient = availableWalletBalance >= totalNetPayable;
  const shortageAmount = Math.max(0, totalNetPayable - availableWalletBalance);

  // Execute Billing & Cashless POS Payment
  const handleExecuteAutoPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentCardholder || !currentBeneficiary) {
      showToast('error', 'No Patient Selected', 'Please choose a patient first.');
      return;
    }

    if (cartItems.length === 0 || totalNetPayable <= 0) {
      showToast('error', 'Empty Bill', 'Please add at least one bill item.');
      return;
    }

    setIsProcessing(true);

    const invoiceNo = `INV-POS-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    // Topup Float if instant topup chosen
    if (!isBalanceSufficient && settlementOption === 'instant_topup') {
      WalletService.addTransaction(
        currentCardholder.id,
        'credit',
        shortageAmount,
        `[POS-TOPUP] Front Desk Instant Recharge to Settle Invoice: ${invoiceNo}`
      );
    }

    const allowDue = !isBalanceSufficient && settlementOption === 'due_later';
    const coPayCash = settlementOption === 'cash_copay' ? (parseFloat(coPayCashInput) || shortageAmount) : 0;
    const walletDebit = allowDue || coPayCash > 0 ? availableWalletBalance : totalNetPayable;

    const notes = `[RECEPTION-POS] ${invoiceNo} for ${currentBeneficiary.fullName} (${currentBeneficiary.id}) • ${cartItems.length} Items • Gross: ₹${totalGross} - Card Savings: ₹${totalDiscount} = Net ₹${totalNetPayable}`;

    const result = WalletService.addTransaction(
      currentCardholder.id,
      'debit',
      totalNetPayable,
      notes,
      {
        customRef: invoiceNo,
        grossAmount: totalGross,
        discountAmount: totalDiscount,
        discountPercentage: Math.round((totalDiscount / totalGross) * 100) || 0,
        allowDue: allowDue || coPayCash > 0,
        coPayCashAmount: coPayCash
      }
    );

    setIsProcessing(false);

    if (result.error) {
      showToast('error', 'Payment Failed', result.error);
    } else {
      triggerCelebrationFireworks();

      const invoiceData = {
        invoiceNo,
        date: new Date().toISOString(),
        cardholder: currentCardholder,
        beneficiary: currentBeneficiary,
        card: activeCard,
        membership: activeMembership,
        items: [...cartItems],
        grossTotal: totalGross,
        discountTotal: totalDiscount,
        netTotal: totalNetPayable,
        walletDebit,
        cashCoPay: coPayCash,
        dueLogged: allowDue ? shortageAmount : 0,
        newWalletBalance: result.wallet.balance
      };

      setCompletedInvoice(invoiceData);

      showToast(
        'success',
        'Invoice Generated & Settled!',
        `Settled ${formatCurrency(totalNetPayable)} for ${currentBeneficiary.fullName} with ${activeMembership?.name || 'Cashless'} benefits.`
      );

      onPaymentSuccess(result.transaction, result.wallet);
    }
  };

  // Professional Invoice Print
  const handlePrintInvoice = (format: 'a4' | 'thermal') => {
    const printWin = window.open('', '', 'width=850,height=950');
    if (!printWin || !completedInvoice) {
      window.print();
      return;
    }

    if (format === 'thermal') {
      printWin.document.write(`
        <html>
          <head>
            <title>Thermal Receipt ${completedInvoice.invoiceNo}</title>
            <style>
              body { font-family: monospace; font-size: 11px; margin: 0; padding: 10px; width: 280px; }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
              .flex { display: flex; justify-content: space-between; }
            </style>
          </head>
          <body>
            <div class="center bold" style="font-size: 13px;">${company.name}</div>
            <div class="center" style="font-size: 9px;">${company.tagline}</div>
            <div class="center" style="font-size: 9px;">Helpline: ${company.helpline}</div>
            <div class="divider"></div>
            <div>Invoice: <b>${completedInvoice.invoiceNo}</b></div>
            <div>Date: ${formatDateTime(completedInvoice.date)}</div>
            <div>Cardholder: ${completedInvoice.cardholder.fullName} (${completedInvoice.cardholder.id})</div>
            <div>Beneficiary: <b>${completedInvoice.beneficiary.fullName}</b></div>
            <div>Health Card: ${completedInvoice.card?.cardNumber || 'N/A'} [${completedInvoice.membership?.name || 'Standard'}]</div>
            <div class="divider"></div>
            <div class="bold">ITEMS & SERVICES:</div>
            ${completedInvoice.items.map(i => `
              <div>${i.name} x${i.qty}</div>
              <div class="flex" style="font-size: 10px; color: #333;">
                <span>Gross: ₹${i.grossPrice * i.qty}</span>
                <span>-${i.discountPercentage}% = ₹${Math.round((i.grossPrice * i.qty) * (1 - i.discountPercentage / 100))}</span>
              </div>
            `).join('')}
            <div class="divider"></div>
            <div class="flex"><span>Gross Total:</span><span>₹${completedInvoice.grossTotal}</span></div>
            <div class="flex bold"><span>Cardholder Discount:</span><span>-₹${completedInvoice.discountTotal}</span></div>
            <div class="flex bold" style="font-size: 13px;"><span>NET PAID:</span><span>₹${completedInvoice.netTotal}</span></div>
            <div class="divider"></div>
            <div class="flex"><span>Wallet Debit:</span><span>₹${completedInvoice.walletDebit}</span></div>
            ${completedInvoice.cashCoPay > 0 ? `<div class="flex"><span>Cash Co-Pay:</span><span>₹${completedInvoice.cashCoPay}</span></div>` : ''}
            ${completedInvoice.dueLogged > 0 ? `<div class="flex bold" style="color: red;"><span>Hospital Due:</span><span>₹${completedInvoice.dueLogged}</span></div>` : ''}
            <div class="flex"><span>Wallet Closing:</span><span>₹${completedInvoice.newWalletBalance}</span></div>
            <div class="divider"></div>
            <div class="center" style="font-size: 8px;">THANK YOU • ISO 9001 & NABH VALIDATED</div>
          </body>
        </html>
      `);
    } else {
      // Standard A4 Tax Invoice
      printWin.document.write(`
        <html>
          <head>
            <title>Tax Invoice ${completedInvoice.invoiceNo}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 25px; color: #0f172a; font-size: 12px; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f766e; padding-bottom: 12px; }
              .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              .table th { background: #f0fdfa; color: #0f766e; text-align: left; padding: 8px; border: 1px solid #ccfbf1; font-size: 11px; }
              .table td { padding: 8px; border: 1px solid #e2e8f0; font-size: 11px; }
              .badge { background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
              .total-box { margin-top: 15px; margin-left: auto; width: 280px; }
              .flex { display: flex; justify-content: space-between; padding: 3px 0; }
              .bold { font-weight: bold; }
              .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 style="margin: 0; font-size: 20px; color: #0f766e; font-weight: 900;">${company.name}</h1>
                <p style="margin: 2px 0; font-size: 11px; color: #475569;">${company.tagline}</p>
                <p style="margin: 2px 0; font-size: 10px; color: #64748b;">${company.address}, ${company.district}, ${company.state} - ${company.pinCode}</p>
                <p style="margin: 2px 0; font-size: 10px; color: #64748b;">GSTIN: ${company.gstin || '19AAACL1234F1Z5'} • License: ${company.clinicalLicenseNo || 'CEA/WB/KOL/2025/1102'}</p>
              </div>
              <div style="text-align: right;">
                <h3 style="margin: 0; color: #0f766e;">OFFICIAL TAX INVOICE</h3>
                <p style="margin: 2px 0; font-family: monospace; font-weight: bold;">${completedInvoice.invoiceNo}</p>
                <p style="margin: 2px 0; font-size: 10px;">Date: ${formatDateTime(completedInvoice.date)}</p>
                <span class="badge">ISO 9001:2015 ACCREDITED</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; padding: 10px; background: #f8fafc; border-radius: 8px;">
              <div>
                <strong style="color: #0f766e; font-size: 11px; text-transform: uppercase;">Primary Cardholder:</strong>
                <div><b>${completedInvoice.cardholder.fullName}</b> (ID: ${completedInvoice.cardholder.id})</div>
                <div>Health Card: <b style="font-family: monospace;">${completedInvoice.card?.cardNumber || 'N/A'}</b></div>
                <div>Membership Tier: <b>${completedInvoice.membership?.name || 'Standard'}</b></div>
                <div>Mobile: ${completedInvoice.cardholder.mobile}</div>
              </div>
              <div>
                <strong style="color: #0f766e; font-size: 11px; text-transform: uppercase;">Patient / Beneficiary:</strong>
                <div><b>${completedInvoice.beneficiary.fullName}</b> (ID: ${completedInvoice.beneficiary.id})</div>
                <div>Age / Gender: ${completedInvoice.beneficiary.age} Y / ${completedInvoice.beneficiary.gender}</div>
                <div>Blood Group: <b>${completedInvoice.beneficiary.bloodGroup || 'B+'}</b></div>
                <div>Coverage Status: <b style="color: #059669;">100% Cashless Family Shield Covered</b></div>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service / Investigation Description</th>
                  <th>Department</th>
                  <th>Qty</th>
                  <th>Standard Rate</th>
                  <th>Card Discount</th>
                  <th>Net Amount</th>
                </tr>
              </thead>
              <tbody>
                ${completedInvoice.items.map((it, idx) => {
                  const gross = it.grossPrice * it.qty;
                  const disc = Math.round((gross * it.discountPercentage) / 100);
                  const net = gross - disc;
                  return `
                    <tr>
                      <td>${idx + 1}</td>
                      <td><b>${it.name}</b><br><span style="font-size: 9.5px; color: #64748b;">${it.category}</span></td>
                      <td>${it.dept.replace(/_/g, ' ').toUpperCase()}</td>
                      <td>${it.qty}</td>
                      <td>₹${gross}</td>
                      <td style="color: #059669;">${it.discountPercentage}% (-₹${disc})</td>
                      <td><b>₹${net}</b></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="total-box">
              <div class="flex"><span>Standard Gross Total:</span><span>₹${completedInvoice.grossTotal}</span></div>
              <div class="flex bold" style="color: #059669;"><span>Total Cardholder Savings:</span><span>-₹${completedInvoice.discountTotal}</span></div>
              <div class="flex bold" style="font-size: 14px; border-top: 1px solid #cbd5e1; padding-top: 5px; color: #0f766e;">
                <span>Net Cashless Settlement:</span><span>₹${completedInvoice.netTotal}</span>
              </div>
              <div class="flex" style="font-size: 10px; color: #64748b; margin-top: 5px;">
                <span>Paid via Health Wallet Float:</span><span>₹${completedInvoice.walletDebit}</span>
              </div>
              ${completedInvoice.cashCoPay > 0 ? `<div class="flex" style="font-size: 10px;"><span>Cash/UPI Co-Pay:</span><span>₹${completedInvoice.cashCoPay}</span></div>` : ''}
              ${completedInvoice.dueLogged > 0 ? `<div class="flex bold" style="color: #dc2626; font-size: 10px;"><span>Hospital Due Logged:</span><span>₹${completedInvoice.dueLogged}</span></div>` : ''}
              <div class="flex" style="font-size: 10px; color: #059669; font-weight: bold;">
                <span>Remaining Wallet Balance:</span><span>₹${completedInvoice.newWalletBalance}</span>
              </div>
            </div>

            <div class="footer">
              <p>This is a computer-generated tax invoice verified under LABMEDIX Cashless Escrow Engine.</p>
              <p>© ${new Date().getFullYear()} ${company.name}. 24x7 Support: ${company.helpline} • Web: ${company.website}</p>
            </div>
          </body>
        </html>
      `);
    }

    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 400);
  };

  // RENDER COMPLETED INVOICE SUCCESS VIEW
  if (completedInvoice) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="🧾 Official Reception POS Tax Invoice & Settlement Receipt" maxWidth="2xl">
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950 border-2 border-emerald-500 text-center space-y-1.5 shadow-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-base font-black text-emerald-300 uppercase">
              Cashless Settlement & Invoice Complete!
            </h3>
            <p className="text-xs text-slate-300">
              Invoice <strong className="text-white font-mono">{completedInvoice.invoiceNo}</strong> settled for <strong className="text-emerald-400">{completedInvoice.beneficiary.fullName}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Cardholder:</span>
              <strong className="text-white">{completedInvoice.cardholder.fullName} ({completedInvoice.cardholder.id})</strong>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Beneficiary Patient:</span>
              <strong className="text-teal-300">{completedInvoice.beneficiary.fullName} ({completedInvoice.beneficiary.id})</strong>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Health Card & Tier:</span>
              <span className="text-amber-300 font-bold">{completedInvoice.card?.cardNumber} [{completedInvoice.membership?.name}]</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Gross Total</span>
                <strong className="text-xs text-slate-300">{formatCurrency(completedInvoice.grossTotal)}</strong>
              </div>
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 block">Card Savings</span>
                <strong className="text-xs text-emerald-400">-{formatCurrency(completedInvoice.discountTotal)}</strong>
              </div>
              <div className="p-2 rounded-xl bg-teal-950/60 border border-teal-500/40">
                <span className="text-[10px] text-teal-300 block">Net Paid</span>
                <strong className="text-sm text-white font-black">{formatCurrency(completedInvoice.netTotal)}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-200"
                leftIcon={<Printer className="w-4 h-4 text-teal-400" />}
                onClick={() => handlePrintInvoice('a4')}
              >
                📄 Print A4 / A5 Tax Invoice
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-200"
                leftIcon={<Receipt className="w-4 h-4 text-amber-400" />}
                onClick={() => handlePrintInvoice('thermal')}
              >
                🖨️ Thermal POS Receipt (80mm)
              </Button>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 font-bold"
              onClick={onClose}
            >
              Done & Close Desk
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚡ Reception Cashless POS & Multi-Line Billing Console" maxWidth="4xl">
      <form onSubmit={handleExecuteAutoPayment} className="space-y-4 text-xs">
        {/* STEP 0: QUICK LOOKUP & 1-TAP NFC CARD TAP BAR */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-teal-500/40 text-white space-y-2.5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5 font-mono">
              <ScanLine className="w-4 h-4 text-teal-400 animate-pulse" />
              Reception Smart Lookup & 1-Tap NFC Tap
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateNfcTap}
                disabled={isNfcScanning}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-[11px] flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
              >
                <Radio className={`w-3.5 h-3.5 ${isNfcScanning ? 'animate-spin' : 'animate-pulse'}`} />
                <span>{isNfcScanning ? 'Reading Chip...' : '📡 Tap NFC Card (13.56 MHz)'}</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Card ID (LHC-2026-...), NFC Chip UID, Patient ID, Phone or Name..."
              value={cardSearchQuery}
              onChange={(e) => handleCardSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono placeholder:text-slate-500 focus:ring-2 focus:ring-teal-400"
            />
          </div>

          {nfcSuccessTag && (
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[10.5px] font-mono text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Contactless Handshake: <strong>{nfcSuccessTag}</strong></span>
            </div>
          )}
        </div>

        {/* STEP 1: CARDHOLDER STATUS & FAMILY BENEFICIARY SELECTOR */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white border border-teal-500/40 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <LabMedixLogo logoUrl={company.logoUrl} variant="monogram" size="sm" theme="white" />
              <div>
                <span className="text-[9.5px] text-teal-300 font-mono uppercase tracking-wider font-bold block">
                  PRIMARY CARDHOLDER ACCOUNT
                </span>
                <strong className="text-sm text-white font-bold block">
                  {currentCardholder?.fullName || 'Select Patient'}
                </strong>
                <span className="text-[10px] text-slate-300 font-mono">
                  ID: {currentCardholder?.id} • Float: <strong className="text-emerald-400">{formatCurrency(availableWalletBalance)}</strong>
                </span>
              </div>
            </div>

            <div className="text-right bg-slate-950/80 p-2.5 rounded-2xl border border-slate-700/80">
              <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold">
                Card Membership Tier
              </span>
              {activeMembership ? (
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeMembership.color }} />
                  <strong className="text-xs font-black text-amber-300 uppercase">
                    {activeMembership.name}
                  </strong>
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono">Standard (0% Disc)</span>
              )}
            </div>
          </div>

          {/* 1 CARD WHOLE FAMILY COVERAGE BENEFICIARY SELECTOR */}
          <div className="pt-2 border-t border-slate-700/60 space-y-1.5">
            <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5" />
              <span>Select Patient Beneficiary (1 Card Covers Whole Family):</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {familyBeneficiaries.map((b: any) => {
                const pat = b.patientData || b;
                const isSelected = selectedBeneficiaryId === pat.id;
                const rel = b.relationship || (pat.id === currentCardholder?.id ? 'Head of Family' : 'Family Member');
                return (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => setSelectedBeneficiaryId(pat.id)}
                    className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md ring-2 ring-amber-300'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <strong className="block">{pat.fullName}</strong>
                      <span className="text-[9.5px] opacity-80 block font-mono">
                        {rel} • {pat.age} yrs • {pat.bloodGroup || 'B+'}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 2: DEPARTMENT SELECTOR PILLS */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            2. Healthcare Department & Add Services to Cart
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'doctor_appointment' as const, label: '👨‍⚕️ Doctor OPD', icon: CalendarCheck, color: 'hover:border-blue-500' },
              { id: 'opd_consult' as const, label: '🩺 General Consult', icon: Stethoscope, color: 'hover:border-teal-500' },
              { id: 'lab_pathology' as const, label: '🔬 Pathology Lab', icon: FlaskConical, color: 'hover:border-purple-500' },
              { id: 'pharmacy' as const, label: '💊 Pharmacy', icon: Pill, color: 'hover:border-emerald-500' },
              { id: 'daycare_procedure' as const, label: '🏥 Daycare / OT', icon: Building2, color: 'hover:border-amber-500' }
            ].map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => {
                  setSelectedDept(dept.id);
                  const firstServ = PRESET_SERVICES.find(s => s.dept === dept.id);
                  if (firstServ) setSelectedServiceId(firstServ.id);
                  setIsCustomService(false);
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  selectedDept === dept.id
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md font-black scale-[1.02]'
                    : `bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 ${dept.color}`
                }`}
              >
                <dept.icon className="w-4 h-4" />
                <span className="text-[11px] leading-tight font-bold">{dept.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 3: SERVICE SELECTOR & ADD TO CART ROW */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Select Preset Service or Custom Investigation:
            </span>
            <button
              type="button"
              onClick={() => setIsCustomService(!isCustomService)}
              className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              {isCustomService ? 'Choose from Preset Catalog' : '+ Custom Investigation / Charge'}
            </button>
          </div>

          {!isCustomService ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  {departmentServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {formatCurrency(s.grossAmount)} [{s.category}]
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddItemToCart}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:scale-102 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Bill</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Custom Service Description"
                value={customServiceName}
                onChange={(e) => setCustomServiceName(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Gross Amount ₹"
                value={customGrossAmount}
                onChange={(e) => setCustomGrossAmount(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddItemToCart}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Bill</span>
              </button>
            </div>
          )}
        </div>

        {/* STEP 4: MULTI-ITEM BILLING CART TABLE */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-teal-500" />
              <span>Bill Items & Prescribed Procedures ({cartItems.length} Items):</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Card Discounts Applied Instantly</span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-mono">
                <tr>
                  <th className="p-2.5">Service Description</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Gross Rate</th>
                  <th className="p-2.5 text-right">Card Savings</th>
                  <th className="p-2.5 text-right">Net Amount</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cartItems.map((item) => {
                  const lineGross = item.grossPrice * item.qty;
                  const lineDisc = Math.round((lineGross * item.discountPercentage) / 100);
                  const lineNet = lineGross - lineDisc;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="p-2.5">
                        <strong className="text-slate-900 dark:text-white block">{item.name}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{item.category}</span>
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                            className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold w-4 text-center">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                            className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-600 dark:text-slate-300">
                        {formatCurrency(lineGross)}
                      </td>
                      <td className="p-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {item.discountPercentage}% (-{formatCurrency(lineDisc)})
                      </td>
                      <td className="p-2.5 text-right font-mono font-black text-slate-900 dark:text-white">
                        {formatCurrency(lineNet)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveCartItem(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* STEP 5: TOTAL CALCULATIONS & DUE SETTLEMENT ENGINE */}
        <div className="p-4 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Standard Gross</span>
              <strong className="text-sm font-mono text-slate-300">{formatCurrency(totalGross)}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 uppercase font-mono block">Card Savings</span>
              <strong className="text-sm font-mono text-emerald-400">-{formatCurrency(totalDiscount)}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/40">
              <span className="text-[10px] text-teal-300 uppercase font-mono block font-bold">Net Cashless Payable</span>
              <strong className="text-base font-black font-mono text-white">{formatCurrency(totalNetPayable)}</strong>
            </div>
          </div>

          {/* BALANCE & DUE ENGINE ALERT */}
          {isBalanceSufficient ? (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Wallet Float Sufficient. Closing Balance: <strong>{formatCurrency(availableWalletBalance - totalNetPayable)}</strong></span>
              </div>
              <span className="font-mono font-bold">Float: {formatCurrency(availableWalletBalance)}</span>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-rose-950/60 border-2 border-rose-500/60 text-white space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>INSUFFICIENT FLOAT (Shortage: <strong className="text-rose-200">{formatCurrency(shortageAmount)}</strong>)</span>
                </div>
                <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded border border-rose-500/40">
                  Current Float: {formatCurrency(availableWalletBalance)}
                </span>
              </div>

              {/* Settlement Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSettlementOption('due_later')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    settlementOption === 'due_later'
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <strong className="block">⚡ Settle as Hospital Due</strong>
                  <span className="text-[9.5px] opacity-80 block">Debit ₹{availableWalletBalance} from float, log ₹{shortageAmount} Due</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettlementOption('instant_topup')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    settlementOption === 'instant_topup'
                      ? 'bg-teal-500 text-slate-950 font-black border-teal-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <strong className="block">💳 1-Click Instant Top-up</strong>
                  <span className="text-[9.5px] opacity-80 block">Recharge ₹{shortageAmount} & settle full bill</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettlementOption('cash_copay')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    settlementOption === 'cash_copay'
                      ? 'bg-blue-500 text-white font-black border-blue-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <strong className="block">💵 Wallet + Cash Co-Pay</strong>
                  <span className="text-[9.5px] opacity-80 block">Collect ₹{shortageAmount} cash at front desk</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isProcessing}
            disabled={totalNetPayable <= 0}
            className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 font-black shadow-lg"
            leftIcon={<Zap className="w-4 h-4 text-amber-300" />}
          >
            {isBalanceSufficient
              ? `Confirm Cashless Settlement (${formatCurrency(totalNetPayable)})`
              : settlementOption === 'due_later'
                ? `Confirm with Hospital Due (${formatCurrency(shortageAmount)} Due)`
                : settlementOption === 'instant_topup'
                  ? `Top-up ₹${shortageAmount} & Settle (${formatCurrency(totalNetPayable)})`
                  : `Confirm Co-Pay Split (₹${availableWalletBalance} Float + ₹${shortageAmount} Cash)`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
