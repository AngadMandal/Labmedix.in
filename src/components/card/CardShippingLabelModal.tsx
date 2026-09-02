import React, { useRef } from 'react';
import { CardDispatchRecord } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { Button } from '../common/Button';
import { Printer, X, ShieldCheck, Truck, Package, QrCode } from 'lucide-react';

interface CardShippingLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CardDispatchRecord | null;
}

export const CardShippingLabelModal: React.FC<CardShippingLabelModalProps> = ({
  isOpen,
  onClose,
  record
}) => {
  const { companyProfile } = useSettings();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-brand-blue border border-blue-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Postal Shipping Label & Envelope Sticker
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                AWB Consignment: {record.consignmentNo} • {record.courierPartner.toUpperCase()}
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

        {/* Printable Label Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-100 dark:bg-slate-950/30 flex justify-center items-center print:p-0 print:m-0 print:bg-white">
          <div
            ref={printRef}
            className="w-full max-w-lg bg-white text-slate-950 p-6 rounded-2xl border-2 border-dashed border-slate-300 shadow-lg print:border-solid print:border-2 print:border-black print:shadow-none print:w-full print:max-w-none print:m-0 print:rounded-none"
            style={{ minHeight: '420px' }}
          >
            {/* Top Bar: Carrier and Priority */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-slate-950 text-white font-black text-xs px-2.5 py-1 rounded tracking-wider uppercase">
                  {record.courierPartner.replace('_', ' ')}
                </div>
                {record.priority === 'urgent' && (
                  <span className="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded uppercase">
                    URGENT MEDICAL DISPATCH
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  DISPATCH ID
                </div>
                <div className="font-mono font-bold text-xs">{record.id}</div>
              </div>
            </div>

            {/* Consignment Barcode Representation */}
            <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg mb-4 print:bg-white print:border-slate-400">
              <div className="font-mono text-2xl tracking-[0.25em] font-black text-slate-900 select-all">
                ||| | |||| | ||| |||| | ||| ||
              </div>
              <div className="font-mono font-bold text-sm tracking-widest text-slate-800 mt-1">
                {record.consignmentNo}
              </div>
            </div>

            {/* Recipient / SHIP TO Details */}
            <div className="grid grid-cols-3 gap-4 border-b-2 border-slate-900 pb-4 mb-4">
              <div className="col-span-2 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  SHIP TO / DELIVER TO CARDHOLDER:
                </div>
                <div className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                  {record.patientName}
                </div>
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>📱 Phone: {record.patientMobile}</span>
                  {record.bloodGroup && (
                    <span className="bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded text-[10px] border border-rose-200">
                      Blood: {record.bloodGroup}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-800 mt-1 leading-relaxed whitespace-pre-line font-medium">
                  {record.address?.fullAddress || `${record.address?.villageArea}, ${record.address?.postOffice}, ${record.address?.district}, ${record.address?.state} - ${record.address?.pinCode}`}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono font-bold border border-slate-300">
                  PIN CODE: <span className="text-sm font-black text-slate-900">{record.address?.pinCode}</span>
                </div>
              </div>

              {/* QR Verification Code */}
              <div className="flex flex-col items-center justify-center border-l border-slate-200 pl-3">
                <div className="w-24 h-24 bg-slate-950 text-white rounded-xl flex items-center justify-center p-2 relative overflow-hidden shadow-xs">
                  <QrCode className="w-20 h-20 text-white" />
                </div>
                <span className="text-[9px] font-mono text-center font-bold text-slate-500 mt-1.5 leading-tight">
                  Scan to Confirm Delivery
                </span>
              </div>
            </div>

            {/* Package Contents & Card Tier */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-xs print:bg-white">
              <div className="flex items-center justify-between font-bold text-slate-800 mb-1.5">
                <span>Card Number: <span className="font-mono text-brand-blue font-black">{record.cardNumber}</span></span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase" style={{ backgroundColor: `${record.membershipColor}20`, color: record.membershipColor }}>
                  {record.membershipName}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Enclosed: High-Security CR80 PVC Health Card, Emergency NFC Lanyard & Welcome Kit</span>
              </div>
            </div>

            {/* Sender / RETURN TO Details */}
            <div className="flex items-start justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-200">
              <div>
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                  RETURN IF UNDELIVERED TO:
                </div>
                <div className="font-black text-slate-900 text-xs">
                  {companyProfile.name}
                </div>
                <div>{companyProfile.address}</div>
                <div>Helpdesk: {companyProfile.phone} • {companyProfile.email}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono font-bold text-[10px] text-slate-500">LABMEDIX LOGISTICS</div>
                <div className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 border border-emerald-200">
                  DO NOT BEND OR CRUSH
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 print:hidden">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-slate-400" />
            <span>Standard 4x6 / A6 Thermal & A4 Sheet Compatible</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handlePrint} className="gap-1.5">
              <Printer className="w-4 h-4" />
              Print Shipping Label
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
