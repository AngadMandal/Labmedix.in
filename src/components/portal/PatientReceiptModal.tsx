import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { PatientReceiptData } from '../../services/portalService';
import { StorageService } from '../../services/storage';
import { ExportService } from '../../services/exportService';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { LabMedixLogo } from '../common/LabMedixLogo';
import { Printer, Download, Share2, Receipt, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';

interface PatientReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PatientReceiptData | null;
}

export const PatientReceiptModal: React.FC<PatientReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt
}) => {
  const [printFormat, setPrintFormat] = useState<'thermal_80mm' | 'a4_standard'>('thermal_80mm');
  const company = StorageService.getCompanyProfile();
  const { showToast } = useToast();

  if (!receipt) return null;

  const isThermal = printFormat === 'thermal_80mm';

  const handlePrintDirect = () => {
    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (!printWin) {
      window.print();
      return;
    }

    const printContent = document.getElementById('portal-receipt-content');
    if (!printContent) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receipt.receiptNo} - ${receipt.patientName}</title>
          <style>
            @page {
              size: ${isThermal ? '80mm auto' : 'A4 portrait'};
              margin: ${isThermal ? '3mm' : '15mm'};
            }
            body {
              font-family: 'Segoe UI', -apple-system, sans-serif;
              font-size: ${isThermal ? '10px' : '12px'};
              color: #0F172A;
              margin: 0;
              padding: ${isThermal ? '4px' : '10px'};
              line-height: 1.35;
              -webkit-print-color-adjust: exact !important;
            }
            .header-center { text-align: center; border-bottom: 1.5px dashed #0D9488; padding-bottom: 8px; margin-bottom: 8px; }
            .row-flex { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .item-table { width: 100%; border-collapse: collapse; margin: 8px 0; }
            .item-table th, .item-table td { padding: 4px 6px; text-align: left; font-size: ${isThermal ? '9.5px' : '11px'}; }
            .item-table th { border-bottom: 1px solid #000; border-top: 1px solid #000; text-transform: uppercase; font-size: 8.5px; }
            .item-table td.right, .item-table th.right { text-align: right; }
            .total-box { border-top: 1.5px dashed #000; border-bottom: 1.5px solid #000; padding: 6px 0; margin: 6px 0; font-weight: bold; }
            .footer-note { text-align: center; font-size: 8.5px; color: #475569; margin-top: 10px; border-top: 1px dotted #CBD5E1; padding-top: 6px; }
            .barcode-box { text-align: center; font-family: monospace; font-size: 10px; letter-spacing: 2px; margin-top: 6px; }
          </style>
        </head>
        <body>
          <div class="header-center">
            <h3 style="margin: 0; font-size: ${isThermal ? '13px' : '16px'}; font-weight: 900; text-transform: uppercase; color: #0D9488;">
              ${company.name || 'LABMEDIX'} HEALTHCARE
            </h3>
            <div style="font-size: 9px; font-weight: bold;">ISO 9001:2015 ACCREDITED HEALTHCARE NETWORK</div>
            <div style="font-size: 8px; color: #64748B;">${company.address || 'Central Medical Complex, Kolkata'} • 24x7 Helpline: ${company.helpline || '1800-889-9911'}</div>
            <div style="font-size: 8px; color: #64748B;">GSTIN: ${company.gstin || '19AAACL1234F1Z5'} • Web: ${company.website || 'labmedix.org'}</div>
          </div>

          <div style="font-size: 9px; margin-bottom: 6px;">
            <div class="row-flex"><span><strong>Receipt No:</strong> ${receipt.receiptNo}</span><span><strong>Date:</strong> ${formatDateTime(receipt.date)}</span></div>
            <div class="row-flex"><span><strong>Patient:</strong> ${receipt.patientName} (${receipt.patientId})</span><span><strong>Card Tier:</strong> ${receipt.cardTier || 'Health Card'}</span></div>
            ${receipt.cardNo ? `<div class="row-flex"><span><strong>Card No:</strong> ${receipt.cardNo}</span><span><strong>Payment:</strong> ${receipt.paymentMethod}</span></div>` : ''}
          </div>

          <table class="item-table">
            <thead>
              <tr>
                <th>Description / Service</th>
                <th class="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${receipt.items && receipt.items.length > 0 ? receipt.items.map(item => `
                <tr>
                  <td>${item.name} ${item.qty ? `x ${item.qty}` : ''}</td>
                  <td class="right">${formatCurrency(item.price)}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td>${receipt.serviceDescription}</td>
                  <td class="right">${formatCurrency(receipt.grossAmount)}</td>
                </tr>
              `}
            </tbody>
          </table>

          <div class="total-box">
            <div class="row-flex"><span>Gross Total:</span><span>${formatCurrency(receipt.grossAmount)}</span></div>
            ${receipt.discountAmount > 0 ? `
              <div class="row-flex" style="color: #0D9488;">
                <span>Cardholder Discount (${receipt.discountPercentage || 25}% OFF):</span>
                <span>-${formatCurrency(receipt.discountAmount)}</span>
              </div>
            ` : ''}
            <div class="row-flex" style="font-size: ${isThermal ? '12px' : '14px'};">
              <span>NET AMOUNT PAID:</span>
              <span>${formatCurrency(receipt.netAmount)}</span>
            </div>
          </div>

          ${receipt.walletClosingBalance !== undefined ? `
            <div style="font-size: 8.5px; background: #F0FDFA; border: 1px solid #99F6E4; padding: 4px 6px; border-radius: 4px; margin-top: 6px;">
              <div><strong>Prepaid Health Wallet Summary:</strong></div>
              <div class="row-flex"><span>Wallet Closing Balance:</span><strong>${formatCurrency(receipt.walletClosingBalance)}</strong></div>
            </div>
          ` : ''}

          <div class="barcode-box">
            ||| | |||| ||| ||||| |||| ||| |<br>
            *${receipt.receiptNo}*
          </div>

          <div class="footer-note">
            Thank you for choosing LABMEDIX Healthcare Network.<br>
            This is a computer generated official tax invoice & payment receipt.
          </div>

          <script>
            setTimeout(() => { window.print(); window.close(); }, 300);
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleDownloadPdf = async () => {
    const el = document.getElementById('portal-receipt-content');
    if (!el) return;
    try {
      showToast('info', 'Rendering Receipt', 'Compiling official receipt PDF...');
      await ExportService.exportPrescriptionToPdf(el, `RECEIPT_${receipt.receiptNo}_${receipt.patientName}.pdf`);
      triggerCelebrationFireworks();
      showToast('success', 'Receipt Downloaded', 'Saved official receipt PDF.');
    } catch {
      handlePrintDirect();
    }
  };

  const handleDownloadPng = async () => {
    const el = document.getElementById('portal-receipt-content');
    if (!el) return;
    try {
      showToast('info', 'Exporting Image', 'Saving receipt image PNG...');
      await ExportService.exportToPng(el, `RECEIPT_${receipt.receiptNo}.png`);
      triggerCelebrationFireworks();
      showToast('success', 'Image Saved', 'Saved official receipt PNG.');
    } catch {
      showToast('error', 'Download Error', 'Could not export receipt image.');
    }
  };

  const handleWhatsApp = () => {
    const text = `Hello ${receipt.patientName},\n\nYour LABMEDIX official payment receipt is ready.\n\nReceipt No: ${receipt.receiptNo}\nService: ${receipt.serviceDescription}\nNet Paid: ${formatCurrency(receipt.netAmount)}\nPayment Method: ${receipt.paymentMethod}\n\nLABMEDIX 24x7 Helpline: ${company.helpline || '1800-889-9911'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Official Receipt: ${receipt.receiptNo}`} maxWidth="lg">
      <div className="space-y-4 text-xs">
        {/* FORMAT SWITCHER */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 text-white border border-slate-800">
          <span className="text-[11px] font-bold text-slate-300">Print Output Layout:</span>
          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setPrintFormat('thermal_80mm')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                isThermal ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🧾 80mm Thermal Receipt
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('a4_standard')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                !isThermal ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              📄 A4 Standard Invoice
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT CONTAINER */}
        <div
          id="portal-receipt-content"
          className={`bg-white text-slate-900 rounded-2xl border border-slate-300 shadow-xl p-5 mx-auto font-sans ${
            isThermal ? 'max-w-sm text-[11px]' : 'max-w-xl text-xs'
          }`}
        >
          {/* Top Brand Banner */}
          <div className="text-center border-b-2 border-teal-600 pb-3 mb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <LabMedixLogo logoUrl={company.logoUrl} variant="monogram" size="sm" theme="teal" />
              <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">
                {company.name || 'LABMEDIX'} HEALTHCARE
              </h2>
            </div>
            <p className="text-[10px] text-teal-700 font-bold">
              ISO 9001:2015 ACCREDITED HEALTHCARE NETWORK
            </p>
            <p className="text-[9px] text-slate-500 font-mono">
              {company.address || 'Central Medical Complex, Kolkata'} • 24x7 Helpline: {company.helpline || '1800-889-9911'}
            </p>
          </div>

          {/* Meta Info */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px] space-y-1 font-mono mb-3">
            <div className="flex justify-between">
              <span><strong>Receipt No:</strong> <span className="text-teal-700">{receipt.receiptNo}</span></span>
              <span><strong>Date:</strong> {formatDateTime(receipt.date)}</span>
            </div>
            <div className="flex justify-between">
              <span><strong>Patient:</strong> {receipt.patientName}</span>
              <span><strong>ID:</strong> {receipt.patientId}</span>
            </div>
            {receipt.cardNo && (
              <div className="flex justify-between">
                <span><strong>Health Card:</strong> {receipt.cardNo}</span>
                <span className="font-bold text-amber-700">{receipt.cardTier || 'Cardholder'}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span><strong>Payment Method:</strong> {receipt.paymentMethod}</span>
              <span className="text-emerald-700 font-black">PAID ✅</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border-t border-b border-slate-300 py-2 my-2">
            <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase pb-1 border-b border-slate-200">
              <span>Service Description</span>
              <span>Amount</span>
            </div>

            <div className="py-2 space-y-1.5">
              {receipt.items && receipt.items.length > 0 ? (
                receipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span>{item.name} {item.qty ? `(Qty: ${item.qty})` : ''}</span>
                    <span className="font-mono font-bold">{formatCurrency(item.price)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-[11px]">
                  <span>{receipt.serviceDescription}</span>
                  <span className="font-mono font-bold">{formatCurrency(receipt.grossAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Total & Discount Breakdown */}
          <div className="space-y-1 py-1 text-[11px] font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Gross Total:</span>
              <span>{formatCurrency(receipt.grossAmount)}</span>
            </div>
            {receipt.discountAmount > 0 && (
              <div className="flex justify-between text-teal-700 font-bold">
                <span>Cardholder Discount ({receipt.discountPercentage || 25}% OFF):</span>
                <span>-{formatCurrency(receipt.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-800 pt-1.5">
              <span>NET AMOUNT PAID:</span>
              <span className="text-teal-700">{formatCurrency(receipt.netAmount)}</span>
            </div>
          </div>

          {/* Health Wallet Cashless Balance Summary */}
          {receipt.walletClosingBalance !== undefined && (
            <div className="mt-3 p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-[10px] space-y-0.5 font-mono">
              <div className="text-teal-900 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Prepaid Health Wallet Cashless Settlement
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Remaining Wallet Balance:</span>
                <strong className="text-emerald-700">{formatCurrency(receipt.walletClosingBalance)}</strong>
              </div>
            </div>
          )}

          {/* Barcode & Security Hash */}
          <div className="text-center pt-3 mt-3 border-t border-dashed border-slate-300">
            <div className="font-mono text-xs tracking-widest text-slate-800">
              ||| | |||| ||| ||||| |||| ||| |
            </div>
            <span className="font-mono text-[9px] text-slate-500">*{receipt.receiptNo}*</span>
            <p className="text-[8px] text-slate-400 mt-1">
              Thank you for trusting LABMEDIX Healthcare Network. Computer generated tax invoice.
            </p>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-purple-600" />}
              onClick={handleDownloadPdf}
            >
              📄 PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-teal-600" />}
              onClick={handleDownloadPng}
            >
              🖼️ PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold"
              leftIcon={<Share2 className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={handleWhatsApp}
            >
              📱 WhatsApp
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 font-bold shadow-md"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrintDirect}
            >
              {isThermal ? '🖨️ Thermal Print (80mm)' : '🖨️ Print A4 Invoice'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
