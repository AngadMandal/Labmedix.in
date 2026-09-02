import React, { useState } from 'react';
import { CardDispatchRecord, CardDispatchStatus, CardPrintStatus, CardCourierPartner } from '../../types';
import { CardDispatchService } from '../../services/cardDispatchService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  X,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  ShieldCheck,
  Send,
  MessageSquare,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  MapPin,
  Calendar,
  UserCheck,
  QrCode,
  Layers,
  ChevronRight
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/formatters';

interface CardDispatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CardDispatchRecord | null;
  onUpdated: (record: CardDispatchRecord) => void;
  onOpenLabel: (record: CardDispatchRecord) => void;
  onOpenQc: (record: CardDispatchRecord) => void;
}

export const CardDispatchDetailsModal: React.FC<CardDispatchDetailsModalProps> = ({
  isOpen,
  onClose,
  record,
  onUpdated,
  onOpenLabel,
  onOpenQc
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'actions'>('overview');
  const [courierInput, setCourierInput] = useState<CardCourierPartner>(record?.courierPartner || 'speed_post');
  const [consignmentInput, setConsignmentInput] = useState<string>(record?.consignmentNo || '');
  const [executiveNameInput, setExecutiveNameInput] = useState<string>(record?.deliveryExecutiveName || '');
  const [executivePhoneInput, setExecutivePhoneInput] = useState<string>(record?.deliveryExecutivePhone || '');
  const [receiverNameInput, setReceiverNameInput] = useState<string>(record?.patientName || '');
  const [receiverOtpInput, setReceiverOtpInput] = useState<string>('VERIFIED-OTP-7729');
  const [returnReasonInput, setReturnReasonInput] = useState<string>('');

  if (!isOpen || !record) return null;

  const handleMarkPrinted = () => {
    const updated = CardDispatchService.markAsPrinted(record.id, currentUser?.fullName || 'Production Desk');
    if (updated) {
      onUpdated(updated);
      showToast('success', 'Card marked as printed successfully');
    }
  };

  const handlePackageCard = () => {
    const updated = CardDispatchService.packageCard(record.id, currentUser?.fullName || 'Packaging Desk');
    if (updated) {
      onUpdated(updated);
      showToast('success', 'Card packaged with welcome kit');
    }
  };

  const handleHandoverCourier = () => {
    if (!consignmentInput.trim()) {
      showToast('error', 'Please enter a consignment tracking number');
      return;
    }
    const updated = CardDispatchService.handoverToCourier(
      record.id,
      courierInput,
      consignmentInput.trim(),
      currentUser?.fullName || 'Dispatch Officer',
      executiveNameInput.trim(),
      executivePhoneInput.trim()
    );
    if (updated) {
      onUpdated(updated);
      showToast('success', `Card handed over to ${courierInput.toUpperCase()}`);
    }
  };

  const handleMarkDelivered = () => {
    if (!receiverNameInput.trim()) {
      showToast('error', 'Please enter recipient person name');
      return;
    }
    const updated = CardDispatchService.markDelivered(
      record.id,
      receiverNameInput.trim(),
      'Self / Household',
      receiverOtpInput.trim()
    );
    if (updated) {
      onUpdated(updated);
      showToast('success', 'Delivery marked as successfully completed!');
    }
  };

  const handleMarkReturned = () => {
    if (!returnReasonInput.trim()) {
      showToast('error', 'Please provide a reason for return');
      return;
    }
    const updated = CardDispatchService.markReturned(record.id, returnReasonInput.trim());
    if (updated) {
      onUpdated(updated);
      showToast('warning', 'Shipment logged as returned');
    }
  };

  const handleSendWhatsAppNotification = () => {
    const message = `Hello ${record.patientName},\nYour LABMEDIX Smart Health Card (${record.cardNumber}) has been dispatched via ${record.courierPartner.toUpperCase()}.\nTracking AWB: ${record.consignmentNo}\nTrack online: ${record.trackingUrl}\nHelpline: +91 98300 00001`;
    window.open(`https://wa.me/91${record.patientMobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    
    const updated = CardDispatchService.updateDispatch(record.id, {
      whatsappNotificationSent: true,
      lastNotifiedAt: new Date().toISOString()
    });
    if (updated) onUpdated(updated);
    showToast('success', 'WhatsApp tracking notification sent');
  };

  const getStatusBadge = () => {
    if (record.dispatchStatus === 'delivered') {
      return <Badge variant="success" size="md">Delivered & Verified</Badge>;
    }
    if (record.dispatchStatus === 'in_transit' || record.dispatchStatus === 'out_for_delivery') {
      return <Badge variant="info" size="md">In Transit • {record.courierPartner.toUpperCase()}</Badge>;
    }
    if (record.dispatchStatus === 'packaged') {
      return <Badge variant="warning" size="md">Packaged & Ready</Badge>;
    }
    if (record.printStatus === 'qc_passed') {
      return <Badge variant="purple" size="md">QC Passed</Badge>;
    }
    if (record.printStatus === 'printed') {
      return <Badge variant="neutral" size="md">Printed (Pending QC)</Badge>;
    }
    return <Badge variant="neutral" size="md">Pending Production</Badge>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-black border border-brand-blue/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Card Production & Dispatch Tracker
                </h3>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Dispatch Order: {record.id} • Card: {record.cardNumber}
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Overview & Package Kit
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Lifecycle Timeline ({record.timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'actions'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Operations & Handover Controls
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Patient & Card Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <img
                    src={record.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={record.patientName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {record.patientName}
                      </h4>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                        style={{ backgroundColor: `${record.membershipColor}20`, color: record.membershipColor }}
                      >
                        {record.membershipName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>📱 {record.patientMobile}</span>
                      <span>•</span>
                      <span>Blood: {record.bloodGroup}</span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {record.address?.fullAddress || `${record.address?.district}, ${record.address?.pinCode}`}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-[10px] font-black uppercase text-slate-400">Card Number</div>
                  <div className="text-sm font-mono font-black text-brand-blue">{record.cardNumber}</div>
                  <div className="text-[11px] font-bold text-slate-500">
                    Priority: <span className={record.priority === 'urgent' ? 'text-rose-600 uppercase font-black' : 'capitalize'}>{record.priority}</span>
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                  Card Production & Logistics Milestones
                </div>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className={`p-2.5 rounded-xl border text-xs ${
                    record.printStatus !== 'pending_print'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold'
                  }`}>
                    <Printer className="w-4 h-4 mx-auto mb-1" />
                    1. Print Card
                    <div className="text-[10px] opacity-80 mt-0.5">{record.printStatus !== 'pending_print' ? 'Done' : 'Pending'}</div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${
                    record.printStatus === 'qc_passed' || record.dispatchStatus === 'in_transit' || record.dispatchStatus === 'delivered'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}>
                    <ShieldCheck className="w-4 h-4 mx-auto mb-1" />
                    2. NFC QC
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {record.printStatus === 'qc_passed' || record.dispatchStatus === 'in_transit' || record.dispatchStatus === 'delivered' ? 'Passed' : 'Pending'}
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${
                    record.dispatchStatus !== 'unallocated' && record.dispatchStatus !== 'queued'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}>
                    <Package className="w-4 h-4 mx-auto mb-1" />
                    3. Kit Packaged
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {record.dispatchStatus !== 'unallocated' && record.dispatchStatus !== 'queued' ? 'Enclosed' : 'Pending'}
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${
                    record.dispatchStatus === 'in_transit' || record.dispatchStatus === 'out_for_delivery' || record.dispatchStatus === 'delivered'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}>
                    <Truck className="w-4 h-4 mx-auto mb-1" />
                    4. In Transit
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {record.dispatchStatus === 'in_transit' || record.dispatchStatus === 'out_for_delivery' || record.dispatchStatus === 'delivered' ? record.courierPartner.toUpperCase() : 'Pending'}
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${
                    record.dispatchStatus === 'delivered'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}>
                    <UserCheck className="w-4 h-4 mx-auto mb-1" />
                    5. Delivered
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {record.dispatchStatus === 'delivered' ? 'Confirmed' : 'Pending'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Kit Enclosure Checklist */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-brand-blue" />
                    Enclosed Welcome Kit Items
                  </h5>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    5-in-1 Kit
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {record.kitContents.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Tracking Information Card */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-brand-blue">
                    Consignment / AWB Tracking
                  </div>
                  <div className="text-base font-mono font-black text-slate-900 dark:text-white mt-0.5">
                    {record.consignmentNo}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Courier: <strong className="text-slate-800 dark:text-slate-200">{record.courierPartner.toUpperCase()}</strong> • Est. Delivery: {record.estimatedDelivery || '2-3 Business Days'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendWhatsAppNotification}
                    className="gap-1 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onOpenLabel(record)}
                    className="gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Label
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {record.timeline.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      {idx + 1}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-900 dark:text-white">{evt.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">{formatDateTime(evt.timestamp)}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{evt.description}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Actor: <strong className="text-slate-700 dark:text-slate-300">{evt.actor}</strong></span>
                        {evt.location && <span>Location: {evt.location}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Step 1: Print & QC Actions */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  1. Production & Quality Control Actions
                </h5>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkPrinted}
                    disabled={record.printStatus !== 'pending_print'}
                    className="gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    Mark as Printed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenQc(record)}
                    className="gap-1.5 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 hover:bg-purple-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Run NFC & Barcode QC Scanner
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePackageCard}
                    disabled={record.dispatchStatus !== 'queued' && record.dispatchStatus !== 'unallocated'}
                    className="gap-1.5 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 hover:bg-blue-50"
                  >
                    <Package className="w-4 h-4" />
                    Mark as Packaged in Envelope
                  </Button>
                </div>
              </div>

              {/* Step 2: Courier Handover Update */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  2. Dispatch & Handover to Courier Partner
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Courier Partner</label>
                    <select
                      value={courierInput}
                      onChange={e => setCourierInput(e.target.value as CardCourierPartner)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                    >
                      <option value="speed_post">India Post Speed Post</option>
                      <option value="bluedart">Blue Dart Express</option>
                      <option value="delhivery">Delhivery Healthcare Logistics</option>
                      <option value="dtdc">DTDC Air Express</option>
                      <option value="executive_hand">Field Executive Hand Delivery</option>
                      <option value="counter_pickup">Hospital / OPD Counter Self-Pickup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Consignment / Tracking Number</label>
                    <input
                      type="text"
                      value={consignmentInput}
                      onChange={e => setConsignmentInput(e.target.value)}
                      placeholder="e.g. EK894021948IN"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Agent Name (Optional)</label>
                    <input
                      type="text"
                      value={executiveNameInput}
                      onChange={e => setExecutiveNameInput(e.target.value)}
                      placeholder="e.g. Rahul Karmakar"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Agent Phone (Optional)</label>
                    <input
                      type="text"
                      value={executivePhoneInput}
                      onChange={e => setExecutivePhoneInput(e.target.value)}
                      placeholder="e.g. +91 98311 44520"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button variant="primary" size="sm" onClick={handleHandoverCourier} className="gap-1.5">
                    <Truck className="w-4 h-4" />
                    Handover & Dispatch Shipment
                  </Button>
                </div>
              </div>

              {/* Step 3: Complete Delivery or Log Return */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Complete Delivery */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Confirm Doorstep Delivery
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Received By</label>
                      <input
                        type="text"
                        value={receiverNameInput}
                        onChange={e => setReceiverNameInput(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">OTP / Receiver Signature Proof</label>
                      <input
                        type="text"
                        value={receiverOtpInput}
                        onChange={e => setReceiverOtpInput(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                      />
                    </div>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleMarkDelivered} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Delivered
                  </Button>
                </div>

                {/* Return Shipment */}
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-rose-800 dark:text-rose-300">
                    Log Return / Undelivered
                  </h5>
                  <div className="text-xs">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Return Reason</label>
                    <textarea
                      rows={2}
                      value={returnReasonInput}
                      onChange={e => setReturnReasonInput(e.target.value)}
                      placeholder="e.g. Door locked, incorrect PIN code, phone switched off"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleMarkReturned} className="w-full text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-50 gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Mark Returned
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 font-mono">
            Created: {formatDate(record.createdAt)}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
