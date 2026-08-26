import { jsPDF } from 'jspdf';
import { CashDeskVoucher, CompanyProfile } from '../types';
import { formatCurrency, formatDate, formatDateTime } from './formatters';

export interface VoucherExportFilterMeta {
  searchQuery?: string;
  statusFilter?: string;
  categoryFilter?: string;
  bearerFilter?: string;
}

/**
 * Export filtered cash desk vouchers as a CSV file
 */
export function exportVouchersToCsv(
  vouchers: CashDeskVoucher[],
  fileNamePrefix: string = 'Hospital_Cash_Desk_Vouchers_Ledger'
): void {
  if (vouchers.length === 0) {
    alert('No vouchers match current filter criteria to export.');
    return;
  }

  const headers = [
    'Voucher Code',
    'Category',
    'Amount (INR)',
    'Status',
    'Security PIN (Masked)',
    'Auth Seal Code',
    'Security Hash (SHA-256 Entropy)',
    'Bearer Type',
    'Patient Name',
    'Patient ID',
    'Patient Phone',
    'Department Restriction',
    'Doctor Restriction',
    'Issue Date',
    'Valid Until',
    'Issued By',
    'Batch ID',
    'Redeemed At',
    'Redeemed By',
    'Redemption Ref',
    'Failed PIN Attempts',
    'Is Locked',
    'Issue Notes'
  ];

  const rows = vouchers.map(v => [
    `"${v.voucherCode}"`,
    `"${v.categoryName || v.category}"`,
    v.amount,
    `"${v.status.toUpperCase()}"`,
    `"${v.pin ? '••••' + v.pin.slice(-2) : 'N/A'}"`,
    `"${v.authSealCode}"`,
    `"${v.securityHash}"`,
    `"${v.bearerType}"`,
    `"${v.patientName || 'General Bearer'}"`,
    `"${v.patientId || 'N/A'}"`,
    `"${v.patientPhone || 'N/A'}"`,
    `"${v.departmentRestriction || 'Universal Desk'}"`,
    `"${v.doctorRestrictionName || 'All Doctors'}"`,
    `"${formatDate(v.validFrom)}"`,
    `"${formatDate(v.validUntil)}"`,
    `"${v.issuedBy}"`,
    `"${v.batchId || 'Single Issue'}"`,
    `"${v.redeemedAt ? formatDateTime(v.redeemedAt) : 'N/A'}"`,
    `"${v.redeemedBy || 'N/A'}"`,
    `"${v.redemptionTransactionRef || 'N/A'}"`,
    v.failedPinAttempts || 0,
    v.isLocked ? 'YES' : 'NO',
    `"${(v.issueNotes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileNamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export filtered cash desk vouchers as a multi-page PDF accounting report
 */
export function exportVouchersToPdf(
  vouchers: CashDeskVoucher[],
  company: CompanyProfile,
  filterMeta?: VoucherExportFilterMeta
): void {
  if (vouchers.length === 0) {
    alert('No vouchers match current filter criteria to export.');
    return;
  }

  // Create A4 Landscape PDF for structured accounting view
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title & Hospital Details
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name || 'LABMEDIX MULTI-SPECIALITY CENTRE', margin, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('CENTRAL CASH DESK VOUCHER & FLOAT AUDIT LEDGER', margin, 17);
  doc.text(`Generated: ${new Date().toLocaleString()} | Super Admin Security Verified`, margin, 23);

  // Summary Metrics Banner
  const totalAmount = vouchers.reduce((acc, v) => acc + v.amount, 0);
  const activeCount = vouchers.filter(v => v.status === 'active').length;
  const activeAmount = vouchers.filter(v => v.status === 'active').reduce((acc, v) => acc + v.amount, 0);
  const redeemedCount = vouchers.filter(v => v.status === 'redeemed').length;
  const redeemedAmount = vouchers.filter(v => v.status === 'redeemed').reduce((acc, v) => acc + v.amount, 0);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text(`Total Records: ${vouchers.length} | Float Value: INR ${totalAmount.toLocaleString('en-IN')}`, pageWidth - margin - 80, 11);
  doc.setTextColor(74, 222, 128); // green-400
  doc.text(`Active: ${activeCount} (INR ${activeAmount.toLocaleString('en-IN')})`, pageWidth - margin - 80, 17);
  doc.setTextColor(244, 114, 182); // pink-400
  doc.text(`Redeemed: ${redeemedCount} (INR ${redeemedAmount.toLocaleString('en-IN')})`, pageWidth - margin - 80, 23);

  // Filters Ribbon
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, 32, pageWidth - (margin * 2), 9, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const filterText = `Applied Filters: [Status: ${filterMeta?.statusFilter || 'All'}] [Category: ${filterMeta?.categoryFilter || 'All'}] [Search: "${filterMeta?.searchQuery || 'None'}"]`;
  doc.text(filterText, margin + 4, 38);

  // Table Column Coordinates
  const colX = {
    code: margin + 2,
    category: margin + 38,
    amount: margin + 85,
    status: margin + 105,
    bearer: margin + 125,
    dept: margin + 175,
    dates: margin + 215,
    auth: margin + 250
  };

  let currentY = 48;
  let pageNumber = 1;

  const renderTableHeader = () => {
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(margin, currentY - 5, pageWidth - (margin * 2), 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('VOUCHER SERIAL', colX.code, currentY - 0.5);
    doc.text('CATEGORY', colX.category, currentY - 0.5);
    doc.text('AMOUNT (INR)', colX.amount, currentY - 0.5);
    doc.text('STATUS', colX.status, currentY - 0.5);
    doc.text('BEARER / PATIENT', colX.bearer, currentY - 0.5);
    doc.text('DEPARTMENT RESTRICTION', colX.dept, currentY - 0.5);
    doc.text('VALIDITY', colX.dates, currentY - 0.5);
    doc.text('AUTH SEAL', colX.auth, currentY - 0.5);
    currentY += 4;
  };

  renderTableHeader();

  vouchers.forEach((v, index) => {
    // Check if new page needed
    if (currentY > pageHeight - 20) {
      // Page footer
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7);
      doc.text(`Hospital Confidential Ledger - Page ${pageNumber}`, pageWidth / 2, pageHeight - 7, { align: 'center' });

      doc.addPage();
      pageNumber++;
      currentY = 20;
      renderTableHeader();
    }

    // Row alternating background
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(margin, currentY - 3.5, pageWidth - (margin * 2), 6.5, 'F');
    }

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(v.voucherCode, colX.code, currentY + 0.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const catShort = (v.categoryName || v.category).substring(0, 26);
    doc.text(catShort, colX.category, currentY + 0.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 148, 136); // teal-600
    doc.text(`INR ${v.amount.toLocaleString('en-IN')}`, colX.amount, currentY + 0.8);

    // Status Pill
    if (v.status === 'active') {
      doc.setTextColor(16, 185, 129); // green
    } else if (v.status === 'redeemed') {
      doc.setTextColor(99, 102, 241); // indigo
    } else if (v.status === 'locked') {
      doc.setTextColor(239, 68, 68); // red
    } else {
      doc.setTextColor(100, 116, 139); // slate
    }
    doc.text(v.status.toUpperCase(), colX.status, currentY + 0.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const bearerName = (v.patientName ? `${v.patientName} (${v.patientId || ''})` : 'General Desk Bearer').substring(0, 28);
    doc.text(bearerName, colX.bearer, currentY + 0.8);

    const deptStr = (v.departmentRestriction || 'Universal Desk').substring(0, 22);
    doc.text(deptStr, colX.dept, currentY + 0.8);

    const validStr = `${formatDate(v.validFrom).slice(0, 6)} - ${formatDate(v.validUntil).slice(0, 6)}`;
    doc.text(validStr, colX.dates, currentY + 0.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(v.authSealCode || 'AUTH-SEAL', colX.auth, currentY + 0.8);

    currentY += 6.5;
  });

  // Final Page Footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text(`Hospital Confidential Ledger - Page ${pageNumber} | Printed: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 7, { align: 'center' });

  // Download PDF
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Hospital_Cash_Desk_Ledger_${dateStr}.pdf`);
}
