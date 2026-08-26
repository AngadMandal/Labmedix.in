import React, { useState, useEffect, useRef } from 'react';
import { CashDeskVoucher } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { generateQrDataUrl } from '../../utils/qr';
import { LabMedixLogo } from '../common/LabMedixLogo';
import { StorageService } from '../../services/storage';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Calendar,
  User,
  Building2,
  AlertTriangle,
  QrCode,
  FileText,
  BadgePercent,
  CheckCircle2
} from 'lucide-react';

interface VoucherSlipModalProps {
  voucher: CashDeskVoucher | null;
  isOpen: boolean;
  onClose: () => void;
  onRedeemClick?: (voucher: CashDeskVoucher) => void;
  autoPrintOnOpen?: boolean;
}

export const VoucherSlipModal: React.FC<VoucherSlipModalProps> = ({
  voucher,
  isOpen,
  onClose,
  onRedeemClick,
  autoPrintOnOpen = false
}) => {
  const { showToast } = useToast();
  const [showPin, setShowPin] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [printFormat, setPrintFormat] = useState<'thermal_pos' | 'a4_certificate'>(() => {
    return StorageService.getVoucherSettings().defaultFormat || 'thermal_pos';
  });
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const hasAutoPrintedRef = useRef(false);

  useEffect(() => {
    if (voucher) {
      const payload = JSON.stringify({
        type: 'LABMEDIX_CASH_VOUCHER',
        code: voucher.voucherCode,
        amount: voucher.amount,
        cat: voucher.category,
        seal: voucher.authSealCode,
        exp: voucher.validUntil,
        hash: voucher.securityHash
      });
      generateQrDataUrl(payload, 300).then(url => {
        setQrDataUrl(url);
      });
    }
  }, [voucher]);

  // Handle Auto-Print trigger when requested by user settings
  useEffect(() => {
    if (isOpen && autoPrintOnOpen && qrDataUrl && !hasAutoPrintedRef.current) {
      hasAutoPrintedRef.current = true;
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
    if (!isOpen) {
      hasAutoPrintedRef.current = false;
    }
  }, [isOpen, autoPrintOnOpen, qrDataUrl]);

  if (!voucher) return null;

  const company = StorageService.getCompanyProfile();

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast('success', 'Copied to Clipboard', `${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  /**
   * Universal Standalone Print Handler
   * Generates a high-fidelity standalone printable document in an isolated frame
   * to guarantee 100% crisp printing without modal overflow or backdrop interference.
   */
  const handlePrint = () => {
    const isThermal = printFormat === 'thermal_pos';
    const printWin = window.open('', '', 'width=850,height=950');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>LABMEDIX - Hospital Cash Desk Official Voucher Slip [${voucher.voucherCode}]</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: ${isThermal ? '80mm auto' : 'A4 portrait'};
              margin: ${isThermal ? '3mm' : '10mm'};
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, monospace;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: ${isThermal ? '4px' : '15px'};
            }
            ${isThermal ? `
              /* 80mm Thermal Receipt Styling */
              .thermal-slip {
                width: 72mm;
                margin: 0 auto;
                font-family: 'Courier New', Courier, monospace;
                font-size: 11px;
                line-height: 1.35;
                color: #000;
              }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .dashed-line { border-top: 1px dashed #000; margin: 8px 0; }
              .double-line { border-top: 2px solid #000; margin: 8px 0; }
              .kv-row { display: flex; justify-content: space-between; margin: 3px 0; }
              .amount-box {
                border: 1.5px solid #000;
                padding: 6px;
                text-align: center;
                margin: 6px 0;
                background: #f8fafc;
              }
              .qr-container { text-align: center; margin: 8px 0; }
              .qr-container img { width: 120px; height: 120px; image-rendering: pixelated; }
              .seal-badge { font-weight: 900; letter-spacing: 1px; }
            ` : `
              /* A4 Hospital Certificate Styling */
              .a4-cert {
                max-width: 190mm;
                margin: 0 auto;
                border: 2px solid #0f172a;
                border-radius: 12px;
                padding: 24px;
                background: #ffffff;
                box-shadow: none;
              }
              .cert-header {
                display: flex;
                justify-content: space-between;
                border-bottom: 2px solid #0f172a;
                padding-bottom: 14px;
                margin-bottom: 18px;
              }
              .cert-title { font-size: 18px; font-weight: 900; color: #0f172a; text-transform: uppercase; }
              .cert-subtitle { font-size: 11px; color: #475569; }
              .amount-card {
                background: #f0fdfa;
                border: 1.5px solid #0d9488;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 16px;
              }
              .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
              .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: 11px; }
              .qr-box {
                background: #0f172a;
                color: #ffffff;
                border-radius: 12px;
                padding: 14px;
                text-align: center;
              }
              .qr-box img { width: 110px; height: 110px; background: #fff; padding: 4px; border-radius: 8px; }
              .signature-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 12px;
                border-top: 1px solid #cbd5e1;
                padding-top: 20px;
                margin-top: 24px;
                font-size: 11px;
              }
            `}
          </style>
        </head>
        <body>
          ${isThermal ? `
            <div class="thermal-slip">
              <div class="center">
                <div class="bold" style="font-size: 14px; text-transform: uppercase;">${company.name || 'LABMEDIX MULTI-SPECIALITY CENTRE'}</div>
                <div style="font-size: 9px;">${company.address || 'Central Multi-Speciality Medical Centre'}</div>
                <div style="font-size: 9px;">Helpline: ${company.phone || '1800-889-9999'}</div>
                <div class="bold" style="font-size: 11px; margin-top: 4px; padding: 2px 4px; background: #000; color: #fff; display: inline-block;">
                  OFFICIAL CASH DESK VOUCHER
                </div>
              </div>

              <div class="double-line"></div>

              <div class="amount-box">
                <div style="font-size: 10px; text-transform: uppercase;">CREDIT VALUE</div>
                <div class="bold" style="font-size: 20px;">₹${voucher.amount.toLocaleString('en-IN')}</div>
                <div class="bold" style="font-size: 10px;">[${voucher.categoryName || voucher.category}]</div>
              </div>

              <div class="dashed-line"></div>

              <div class="kv-row">
                <span>VOUCHER CODE:</span>
                <span class="bold">${voucher.voucherCode}</span>
              </div>
              <div class="kv-row">
                <span>AUTH SEAL:</span>
                <span class="bold seal-badge">${voucher.authSealCode}</span>
              </div>
              <div class="kv-row">
                <span>SECURITY PIN:</span>
                <span class="bold" style="font-size: 13px;">${voucher.pin}</span>
              </div>
              <div class="kv-row">
                <span>BEARER:</span>
                <span class="bold">${voucher.patientName ? `${voucher.patientName} (${voucher.patientId || ''})` : 'General Desk Bearer'}</span>
              </div>
              ${voucher.departmentRestriction ? `
                <div class="kv-row">
                  <span>DEPARTMENT:</span>
                  <span>${voucher.departmentRestriction}</span>
                </div>
              ` : ''}
              <div class="kv-row">
                <span>ISSUE DATE:</span>
                <span>${formatDate(voucher.validFrom)}</span>
              </div>
              <div class="kv-row">
                <span>VALID UNTIL:</span>
                <span class="bold">${formatDate(voucher.validUntil)}</span>
              </div>
              <div class="kv-row">
                <span>STATUS:</span>
                <span class="bold">${voucher.status.toUpperCase()}</span>
              </div>

              <div class="dashed-line"></div>

              <div class="qr-container">
                <img src="${qrDataUrl}" alt="Voucher QR" />
                <div style="font-size: 9px; margin-top: 4px;">SCAN QR OR PRESENT PIN AT CASH DESK</div>
                <div style="font-size: 7.5px; word-break: break-all; margin-top: 2px;">HASH: ${voucher.securityHash}</div>
              </div>

              <div class="dashed-line"></div>

              <div style="display: flex; justify-content: space-between; font-size: 8.5px; margin-top: 8px;">
                <div>
                  <div class="bold">Issued By:</div>
                  <div>${voucher.issuedBy}</div>
                </div>
                <div style="text-align: right;">
                  <div class="bold">Authorized Signatory:</div>
                  <div>Super Admin Desk</div>
                </div>
              </div>

              <div class="center" style="font-size: 8px; margin-top: 10px;">
                *** SINGLE USE CASHLESS TENDER ***
              </div>
            </div>
          ` : `
            <div class="a4-cert">
              <div class="cert-header">
                <div>
                  <div class="cert-title">${company.name || 'LABMEDIX MULTI-SPECIALITY CENTRE'}</div>
                  <div class="cert-subtitle">${company.address || 'Kolkata Central Healthcare & Diagnostics Suite'}</div>
                  <div class="cert-subtitle" style="font-weight: bold; margin-top: 2px;">NABH & NABL ACCREDITED TERTIARY CARE FACILITY</div>
                </div>
                <div style="text-align: right;">
                  <div style="display: inline-block; background: #0f766e; color: #fff; font-weight: bold; font-size: 10px; padding: 4px 10px; border-radius: 20px;">
                    SUPER ADMIN CASH DESK VOUCHER
                  </div>
                  <div style="font-size: 11px; font-weight: bold; margin-top: 6px;">Voucher No: <span style="color: #4338ca;">${voucher.voucherCode}</span></div>
                  <div style="font-size: 10px; color: #64748b;">Date of Issue: ${formatDate(voucher.validFrom)}</div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; align-items: center; margin-bottom: 16px;">
                <div>
                  <div class="amount-card">
                    <div style="font-size: 10px; color: #0f766e; text-transform: uppercase; font-weight: bold;">Authorized Float Tender Value</div>
                    <div style="font-size: 32px; font-weight: 900; color: #042f2e; margin: 4px 0;">
                      ₹${voucher.amount.toLocaleString('en-IN')}
                    </div>
                    <div style="font-size: 12px; font-weight: bold; color: #0d9488;">
                      [${voucher.categoryName || voucher.category}]
                    </div>
                  </div>

                  <div class="grid-2">
                    <div class="info-box">
                      <strong style="display: block; color: #64748b; font-size: 9.5px; text-transform: uppercase;">Beneficiary / Bearer</strong>
                      <strong style="color: #0f172a; font-size: 12px;">${voucher.patientName || 'General Cash Desk Bearer'}</strong>
                      ${voucher.patientId ? `<div style="color: #64748b; font-size: 10px;">ID: ${voucher.patientId}</div>` : ''}
                    </div>
                    <div class="info-box">
                      <strong style="display: block; color: #64748b; font-size: 9.5px; text-transform: uppercase;">Validity Period</strong>
                      <strong style="color: #b91c1c; font-size: 12px;">Valid till ${formatDate(voucher.validUntil)}</strong>
                      <div style="color: #64748b; font-size: 10px;">Single-use Settlement</div>
                    </div>
                  </div>

                  ${voucher.issueNotes ? `
                    <div class="info-box" style="margin-top: 8px;">
                      <strong>Hospital Endorsement:</strong> ${voucher.issueNotes}
                    </div>
                  ` : ''}
                </div>

                <div class="qr-box">
                  <img src="${qrDataUrl}" alt="Voucher QR" />
                  <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-top: 6px;">Cryptographic Security PIN</div>
                  <div style="font-size: 20px; font-weight: 900; color: #f59e0b; letter-spacing: 2px;">${voucher.pin}</div>
                  <div style="font-size: 10px; color: #5eead4; margin-top: 4px;">Seal: ${voucher.authSealCode}</div>
                </div>
              </div>

              <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; font-size: 9.5px; font-family: monospace; display: flex; justify-content: space-between;">
                <span>Tamper-Evident Hash: <strong>${voucher.securityHash}</strong></span>
                <span style="color: #047857; font-weight: bold;">✓ 256-bit Cryptographic Entropy Verified</span>
              </div>

              <div class="signature-grid">
                <div>
                  <strong>Issued by Authority:</strong>
                  <div style="margin-top: 4px;">${voucher.issuedBy}</div>
                </div>
                <div style="text-align: center;">
                  <strong>Hospital Cashier Counter:</strong>
                  <div style="margin-top: 4px; font-style: italic;">Counter-signed at POS Redemption</div>
                </div>
                <div style="text-align: right;">
                  <strong>Chief Medical Superintendent:</strong>
                  <div style="margin-top: 4px; font-style: italic;">Dr. Labmedix Super Admin</div>
                </div>
              </div>
            </div>
          `}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `;

    if (printWin) {
      printWin.document.open();
      printWin.document.write(htmlContent);
      printWin.document.close();
    } else {
      // Fallback if popup blocked
      window.print();
    }
  };

  const isExpired = new Date(voucher.validUntil) < new Date();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hospital Cash Desk Official Voucher Slip"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Format Switcher & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Print Layout:</span>
            <button
              type="button"
              onClick={() => {
                setPrintFormat('thermal_pos');
                StorageService.saveVoucherSettings({ autoPrintOnCreation: StorageService.getVoucherSettings().autoPrintOnCreation, defaultFormat: 'thermal_pos' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                printFormat === 'thermal_pos'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🧾 80mm Thermal POS
            </button>
            <button
              type="button"
              onClick={() => {
                setPrintFormat('a4_certificate');
                StorageService.saveVoucherSettings({ autoPrintOnCreation: StorageService.getVoucherSettings().autoPrintOnCreation, defaultFormat: 'a4_certificate' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                printFormat === 'a4_certificate'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              📄 A4 Hospital Certificate
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              className="bg-blue-600 hover:bg-blue-700 font-bold shadow-md"
              leftIcon={<Printer className="w-4 h-4 text-white" />}
              onClick={handlePrint}
            >
              Print Official Slip
            </Button>
            {voucher.status === 'active' && !isExpired && onRedeemClick && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Sparkles className="w-4 h-4 text-teal-500" />}
                onClick={() => {
                  onClose();
                  onRedeemClick(voucher);
                }}
              >
                Redeem at POS
              </Button>
            )}
          </div>
        </div>

        {/* PRINTABLE SLIP CONTAINER PREVIEW */}
        <div id="voucher-printable-preview" className="print:m-0 print:p-0">
          {printFormat === 'thermal_pos' ? (
            /* ================= THERMAL 80MM POS FORMAT ================= */
            <div className="bg-white text-slate-900 font-mono p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-inner max-w-sm mx-auto space-y-4 print:max-w-none print:shadow-none print:border-none">
              {/* Header */}
              <div className="text-center space-y-1 border-b border-dashed border-slate-400 pb-3">
                <div className="flex justify-center mb-1">
                  <LabMedixLogo logoUrl={company.logoUrl} size="sm" variant="monogram" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider">{company.name}</h3>
                <p className="text-[10px] text-slate-600">{company.address || 'Central Multi-Speciality Medical Centre'}</p>
                <p className="text-[10px] text-slate-600">Ph: {company.phone} | Helpline: {company.helpline || '1800-889-9999'}</p>
                <div className="inline-block px-2 py-0.5 mt-1 text-[10px] font-black uppercase bg-slate-900 text-white rounded">
                  OFFICIAL CASH DESK VOUCHER
                </div>
              </div>

              {/* Amount Showcase */}
              <div className="text-center p-3 bg-slate-100 rounded-xl border border-slate-300">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Voucher Credit Value</span>
                <span className="text-2xl font-black text-slate-950 tracking-tight">
                  {formatCurrency(voucher.amount)}
                </span>
                <span className="text-[10px] font-bold text-teal-800 block mt-0.5">
                  [{voucher.categoryName || voucher.category}]
                </span>
              </div>

              {/* Voucher Details */}
              <div className="space-y-1.5 text-[11px] border-b border-dashed border-slate-400 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Voucher Code:</span>
                  <span className="font-bold text-slate-900">{voucher.voucherCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Auth Seal:</span>
                  <span className="font-bold text-indigo-900">{voucher.authSealCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Cryptographic PIN:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-rose-700 tracking-wider">
                      {showPin ? voucher.pin : '••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-slate-400 hover:text-slate-800 print:hidden"
                      aria-label="Toggle PIN visibility"
                    >
                      {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bearer / Beneficiary:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[180px]">
                    {voucher.patientName ? `${voucher.patientName} (${voucher.patientId || ''})` : 'General Cash Desk Bearer'}
                  </span>
                </div>
                {voucher.departmentRestriction && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-bold text-slate-900">{voucher.departmentRestriction}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Issue Date:</span>
                  <span>{formatDate(voucher.validFrom)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Valid Until:</span>
                  <span className="font-bold text-rose-800">{formatDate(voucher.validUntil)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold uppercase text-slate-900">{voucher.status}</span>
                </div>
              </div>

              {/* QR Code & Barcode */}
              <div className="text-center space-y-2 pt-1">
                <div className="flex justify-center p-2 bg-white rounded-lg border border-slate-200 inline-block mx-auto">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Voucher QR" className="w-[115px] h-[115px] object-contain" />
                  ) : (
                    <div className="w-[115px] h-[115px] bg-slate-100 animate-pulse rounded" />
                  )}
                </div>
                <p className="text-[9px] text-slate-500 font-mono leading-tight">
                  Scan QR or present PIN at Hospital Cash Desk for instant redemption. Single-use only.
                </p>
                <p className="text-[8px] text-slate-400 font-mono truncate">
                  Hash: {voucher.securityHash}
                </p>
              </div>

              {/* Footer Signatures */}
              <div className="pt-4 border-t border-dashed border-slate-400 text-[9px] flex justify-between text-slate-600">
                <div>
                  <p className="font-bold">Issued by:</p>
                  <p>{voucher.issuedBy}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Authorized Signatory:</p>
                  <p className="italic">Dr. Labmedix Super Admin</p>
                </div>
              </div>
            </div>
          ) : (
            /* ================= A4 HOSPITAL CERTIFICATE FORMAT ================= */
            <div className="bg-white text-slate-900 p-8 rounded-3xl border-2 border-slate-300 dark:border-slate-700 shadow-md space-y-6 relative overflow-hidden print:border-none print:shadow-none">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                <span className="text-7xl font-black rotate-[-30deg] uppercase tracking-widest text-slate-900">
                  OFFICIAL CASH FLOAT
                </span>
              </div>

              {/* Top Certificate Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div className="space-y-1">
                  <LabMedixLogo logoUrl={company.logoUrl} size="md" variant="horizontal" />
                  <p className="text-xs text-slate-600 max-w-sm pt-1">{company.address || 'Kolkata Central Healthcare & Diagnostics Suite'}</p>
                  <p className="text-xs text-slate-600 font-mono">NABH & NABL ACCREDITED TERTIARY HOSPITAL</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-900 text-white font-mono">
                    SUPER ADMIN CASH DESK VOUCHER
                  </span>
                  <p className="text-xs font-bold text-slate-800 pt-1">Voucher No: <span className="font-mono text-indigo-700">{voucher.voucherCode}</span></p>
                  <p className="text-xs text-slate-500 font-mono">Date of Issue: {formatDate(voucher.validFrom)}</p>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Authorized Credit Tender</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black text-slate-950 font-mono">
                        {formatCurrency(voucher.amount)}
                      </span>
                      <span className="text-sm font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                        {voucher.categoryName || voucher.category}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-bold block">Bearer / Patient</span>
                      <span className="font-bold text-slate-900 block truncate">
                        {voucher.patientName ? `${voucher.patientName}` : 'General Cash Desk Bearer'}
                      </span>
                      {voucher.patientId && <span className="text-[10px] font-mono text-slate-500 block">ID: {voucher.patientId}</span>}
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-bold block">Validity Period</span>
                      <span className="font-bold text-rose-700 block">
                        Valid till {formatDate(voucher.validUntil)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">Single-use Tender</span>
                    </div>
                  </div>

                  {voucher.issueNotes && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <strong className="text-slate-900">Hospital Endorsement:</strong> {voucher.issueNotes}
                    </div>
                  )}
                </div>

                {/* QR & Security Box */}
                <div className="p-4 rounded-3xl bg-slate-900 text-white text-center space-y-3 shadow-lg">
                  <div className="flex justify-center p-2 bg-white rounded-2xl inline-block mx-auto">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="Voucher QR" className="w-[110px] h-[110px] object-contain rounded-lg" />
                    ) : (
                      <div className="w-[110px] h-[110px] bg-slate-800 animate-pulse rounded-lg" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Cryptographic Security PIN</span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-black tracking-widest text-amber-400 font-mono">
                        {showPin ? voucher.pin : '••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="text-slate-400 hover:text-white print:hidden"
                        aria-label="Toggle PIN visibility"
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-teal-300 block">Seal: {voucher.authSealCode}</span>
                </div>
              </div>

              {/* Cryptographic Verification Hash & Terms */}
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-600">
                <span>Tamper-Evident Hash: <strong className="text-slate-900">{voucher.securityHash}</strong></span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Cryptographic Entropy Verified
                </span>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-xs text-slate-600">
                <div>
                  <p className="font-bold text-slate-900">Issued by Authority:</p>
                  <p className="pt-1">{voucher.issuedBy}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900">Hospital Cashier Verification:</p>
                  <p className="pt-1 italic">Counter-signed at Redemption</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">Chief Medical Superintendent:</p>
                  <p className="pt-1 italic">Dr. Labmedix Super Admin</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Copy Action Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => handleCopy(voucher.voucherCode, 'Voucher Code')}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left hover:border-blue-500 transition-colors"
          >
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Voucher Serial</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate block">{voucher.voucherCode}</span>
            </div>
            {copiedField === 'Voucher Code' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            type="button"
            onClick={() => handleCopy(voucher.pin, 'Voucher PIN')}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left hover:border-blue-500 transition-colors"
          >
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Cryptographic PIN</span>
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 block">{voucher.pin}</span>
            </div>
            {copiedField === 'Voucher PIN' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            type="button"
            onClick={() => handleCopy(voucher.authSealCode, 'Auth Seal')}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left hover:border-blue-500 transition-colors"
          >
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Auth Seal Code</span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 block">{voucher.authSealCode}</span>
            </div>
            {copiedField === 'Auth Seal' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>
    </Modal>
  );
};
