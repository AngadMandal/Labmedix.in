import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { AuditService } from './auditService';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

export interface AnalyticsPdfExportOptions {
  scope: 'all' | 'overview' | 'velocity' | 'wallet_float' | 'staff_productivity' | 'audit_ledger' | 'dept_collections' | 'doctor_referrals' | 'my_reports';
  branchName: string;
  branchCode: string;
  timeRange: string;
  operatorName: string;
  operatorRole: string;
  companyName?: string;
  companySubtitle?: string;
  companyRegistrationNo?: string;
  kpis: {
    totalRegistrationRevenue: number;
    totalWalletFloat: number;
    totalWalletDeposits: number;
    totalBillingDeductions: number;
    activeCardCount: number;
    activePatientsCount: number;
  };
  deptCollections?: Array<{
    label: string;
    gross: number;
    disc: number;
    net: number;
    count: number;
  }>;
  staffProductivity?: Array<{
    fullName: string;
    staffId?: string;
    role: string;
    registeredCount: number;
    cardsPrinted: number;
    avgProcessMinutes: string;
    accuracyScore: number;
    rankBadge: string;
  }>;
  doctorReferrals?: Array<{
    name: string;
    doctorCode: string;
    speciality: string;
    totalTestsReferredCount: number;
    totalReferredLabRevenue: number;
    bloodCommissionPercent: number;
    totalCommissionEarned: number;
    totalCommissionPaid: number;
    payableCommissionBalance: number;
  }>;
  velocityTrend?: Array<{
    day: string;
    newPatients: number;
    cardsIssued: number;
    prepaidRecharged: number;
    billingRedeemed: number;
  }>;
  auditTrail?: Array<{
    action: string;
    module: string;
    description: string;
    userName: string;
    timestamp: string;
    hash?: string;
  }>;
  myReportData?: {
    userName: string;
    staffId: string;
    role: string;
    department: string;
    patientsCount: number;
    auditActionsCount: number;
    colleaguesCount: number;
  };
}

export class ExportService {
  /**
   * Captures an element to HTML5 Canvas safely in an isolated sandbox,
   * avoiding 3D perspective transforms, viewport clipping, and scaling distortions.
   */
  public static async captureElementToCanvas(element: HTMLElement, scale = 3): Promise<HTMLCanvasElement> {
    // Ensure all images within the element are fully loaded with CORS
    const images = element.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(img => {
        img.crossOrigin = 'anonymous';
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    // Wait for fonts and SVG rendering to settle
    await new Promise(r => setTimeout(r, 250));

    try {
      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        width: element.offsetWidth || 500,
        height: element.offsetHeight || 315,
        windowWidth: 1920,
        windowHeight: 1080
      });
      return canvas;
    } catch (error) {
      console.error('Error capturing element to canvas:', error);
      throw error;
    }
  }

  /**
   * Generates a high-res 300+ DPI PNG from an HTML card element
   */
  public static async exportToPng(element: HTMLElement, filename: string): Promise<string> {
    try {
      const canvas = await this.captureElementToCanvas(element, 3);
      const dataUrl = canvas.toDataURL('image/png', 1.0);

      // Create download anchor
      const link = document.createElement('a');
      link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      AuditService.log('CARD_EXPORTED', 'card', `Exported high-res PNG: ${filename}`);
      return dataUrl;
    } catch (error) {
      console.error('Error generating PNG export:', error);
      throw error;
    }
  }

  /**
   * Generates exact CR80 PVC dimension double-sided PDF (85.60 mm x 53.98 mm)
   */
  public static async exportCardToPdf(
    frontElement: HTMLElement,
    backElement?: HTMLElement | null,
    filename = 'LABMEDIX_CR80_HEALTH_CARD.pdf'
  ): Promise<void> {
    try {
      // CR80 PVC Standard Dimensions: 85.60 mm width, 53.98 mm height (landscape)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [53.98, 85.60]
      });

      // 1. Capture Front Side
      const frontCanvas = await this.captureElementToCanvas(frontElement, 3);
      const frontImgData = frontCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(frontImgData, 'PNG', 0, 0, 85.60, 53.98, undefined, 'FAST');

      // 2. Capture Back Side if present
      if (backElement) {
        pdf.addPage([53.98, 85.60], 'landscape');
        const backCanvas = await this.captureElementToCanvas(backElement, 3);
        const backImgData = backCanvas.toDataURL('image/png', 1.0);
        pdf.addImage(backImgData, 'PNG', 0, 0, 85.60, 53.98, undefined, 'FAST');
      }

      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
      AuditService.log('CARD_EXPORTED', 'card', `Exported CR80 PVC PDF: ${filename}`);
    } catch (error) {
      console.error('Error generating PDF export:', error);
      throw error;
    }
  }

  /**
   * Generates A4 PDF sheet containing multiple cards
   */
  public static async exportA4SheetToPdf(sheetElement: HTMLElement, filename = 'LABMEDIX_A4_PRINT_SHEET.pdf'): Promise<void> {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4' // 210 x 297 mm
      });

      const canvas = await this.captureElementToCanvas(sheetElement, 2);
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);

      AuditService.log('CARD_EXPORTED', 'card', `Exported A4 multi-card sheet PDF: ${filename}`);
    } catch (error) {
      console.error('Error generating A4 PDF export:', error);
      throw error;
    }
  }

  /**
   * Generates single or multi-page PDF for Clinical Prescriptions with Smart Layout sizing (A4, 80mm Thermal, A5)
   */
  public static async exportPrescriptionToPdf(
    element: HTMLElement,
    filename = 'LABMEDIX_PRESCRIPTION.pdf',
    layoutMode: 'detailed_a4' | 'thermal_slip' | 'compact_a5' | 'clinical_summary' = 'detailed_a4'
  ): Promise<void> {
    try {
      const canvas = await this.captureElementToCanvas(element, 2.5);
      const imgData = canvas.toDataURL('image/png', 1.0);

      if (layoutMode === 'thermal_slip') {
        // 80mm Thermal Roll format: dynamic continuous height
        const rollWidthMm = 80;
        const rollHeightMm = Math.max(80, Math.round((canvas.height * rollWidthMm) / canvas.width));
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [rollWidthMm, rollHeightMm]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, rollWidthMm, rollHeightMm, undefined, 'FAST');
        pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
        AuditService.log('PRESCRIPTION_EXPORTED', 'patient', `Exported Thermal 80mm POS Prescription PDF: ${filename}`);
        return;
      }

      if (layoutMode === 'compact_a5') {
        // A5 Portrait format: 148mm x 210mm
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a5'
        });

        const imgWidth = 148;
        const pageHeight = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pageHeight;
        }

        pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
        AuditService.log('PRESCRIPTION_EXPORTED', 'patient', `Exported A5 Compact Prescription PDF: ${filename}`);
        return;
      }

      // Standard A4 Portrait format: 210mm x 297mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
      AuditService.log('PRESCRIPTION_EXPORTED', 'patient', `Exported ${layoutMode === 'clinical_summary' ? 'Clinical Case Summary' : 'A4'} Prescription PDF: ${filename}`);
    } catch (error) {
      console.error('Error generating Prescription PDF export:', error);
      throw error;
    }
  }

  /**
   * Generates a multi-page A4 Analytical & Financial Audit Report in PDF format using jsPDF.
   */
  public static async exportAnalyticsReportToPdf(options: AnalyticsPdfExportOptions): Promise<void> {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4' // 210mm x 297mm
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const marginLeft = 14;
      const marginRight = 14;
      const contentWidth = pageWidth - marginLeft - marginRight; // 182mm
      let currentY = 14;
      let pageNumber = 1;

      const drawHeader = () => {
        // Top banner background
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 28, 'F');

        // Brand accent line
        doc.setFillColor(13, 148, 136); // teal-600
        doc.rect(0, 28, pageWidth, 1.8, 'F');

        // Monogram / Logo Mark
        doc.setFillColor(13, 148, 136);
        doc.roundedRect(marginLeft, 5, 18, 18, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('LM', marginLeft + 5, 16.5);

        // Header Title
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(options.companyName || 'LABMEDIX HEALTHCARE NETWORK', marginLeft + 23, 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(
          `${options.companySubtitle || 'Executive Operations & Financial Audit Report'}  |  Reg: ${options.companyRegistrationNo || 'WB-MED-2025-0892'}`,
          marginLeft + 23,
          17
        );
        doc.text(`Branch: ${options.branchName} (${options.branchCode})  |  Period: ${options.timeRange.toUpperCase()}`, marginLeft + 23, 22);

        // Right side badge
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(pageWidth - marginRight - 42, 6, 42, 16, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(45, 212, 191); // teal-400
        doc.text('OFFICIAL AUDIT REPORT', pageWidth - marginRight - 39, 11);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(203, 213, 225);
        doc.text(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), pageWidth - marginRight - 39, 15.5);
        doc.text(`By: ${options.operatorName}`, pageWidth - marginRight - 39, 19.5);

        currentY = 36;
      };

      const drawFooter = () => {
        doc.setFillColor(241, 245, 249); // slate-100
        doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(
          'LABMEDIX Certified Clinical Audit Trail • Strictly Confidential & Cryptographically Verified',
          marginLeft,
          pageHeight - 5
        );

        doc.setFont('helvetica', 'bold');
        doc.text(`Page ${pageNumber}`, pageWidth - marginRight - 12, pageHeight - 5);
      };

      const checkPageBreak = (neededHeight: number) => {
        if (currentY + neededHeight > pageHeight - 16) {
          drawFooter();
          doc.addPage();
          pageNumber++;
          drawHeader();
        }
      };

      // 1. First Page Header
      drawHeader();

      // Section: Report Overview Banner
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(marginLeft, currentY, contentWidth, 14, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(marginLeft, currentY, contentWidth, 14, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const scopeTitle = options.scope === 'all' 
        ? 'CONSOLIDATED EXECUTIVE INTELLIGENCE & FINANCIAL AUDIT' 
        : `ANALYTICS REPORT: ${options.scope.replace('_', ' ').toUpperCase()}`;
      doc.text(scopeTitle, marginLeft + 4, currentY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Generated on ${new Date().toLocaleString()} by ${options.operatorName} (${options.operatorRole.toUpperCase()}) for ${options.branchName}`,
        marginLeft + 4,
        currentY + 10.5
      );

      currentY += 19;

      // Section: Executive KPI Metric Cards (2x3 or 4x1 grid)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('1. Key Financial & Operational Indicators', marginLeft, currentY);
      currentY += 4;

      const cardWidth = (contentWidth - 6) / 3;
      const cardHeight = 16;

      const kpiItems = [
        { label: 'Card Membership Revenue', val: formatCurrency(options.kpis.totalRegistrationRevenue), sub: `${options.kpis.activeCardCount} CR80 Cards Issued`, color: [13, 148, 136] },
        { label: 'Prepaid Float Vault Reserve', val: formatCurrency(options.kpis.totalWalletFloat), sub: '100% Cashless Liquid Escrow', color: [2, 132, 199] },
        { label: 'Total Registered Patients', val: `${options.kpis.activePatientsCount} Patients`, sub: 'Active Intake Volume', color: [147, 51, 234] },
        { label: 'Total Prepaid Deposits', val: formatCurrency(options.kpis.totalWalletDeposits), sub: 'Gross Patient Wallet Recharges', color: [16, 185, 129] },
        { label: 'OPD & Lab Deductions', val: formatCurrency(options.kpis.totalBillingDeductions), sub: 'Services Redeemed', color: [245, 158, 11] },
        { label: 'Network Operations Health', val: '100% Operational', sub: `${options.branchCode} Live Sync Active`, color: [79, 70, 229] }
      ];

      kpiItems.forEach((kpi, idx) => {
        const row = Math.floor(idx / 3);
        const col = idx % 3;
        const x = marginLeft + col * (cardWidth + 3);
        const y = currentY + row * (cardHeight + 3);

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'S');

        // Color accent bar on left of card
        doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
        doc.rect(x, y + 2, 1.5, cardHeight - 4, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label.toUpperCase(), x + 4, y + 4.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(kpi.val, x + 4, y + 9.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(148, 163, 184);
        doc.text(kpi.sub, x + 4, y + 13.5);
      });

      currentY += (cardHeight + 3) * 2 + 5;

      // Section: Department Collections Table
      if (options.deptCollections && options.deptCollections.length > 0 && (options.scope === 'all' || options.scope === 'dept_collections' || options.scope === 'overview')) {
        checkPageBreak(50);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text('2. Department-wise Revenue & Collection Breakdown', marginLeft, currentY);
        currentY += 4;

        // Table Header
        const colWidths = [60, 26, 32, 32, 32];
        const headers = ['Department / Clinical Unit', 'Bill Count', 'Gross Revenue', 'Discounts Given', 'Net Collection'];

        doc.setFillColor(15, 23, 42);
        doc.rect(marginLeft, currentY, contentWidth, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);

        let tableX = marginLeft + 3;
        headers.forEach((h, i) => {
          const alignRight = i >= 1;
          if (alignRight) {
            doc.text(h, tableX + colWidths[i] - 6, currentY + 4.2, { align: 'right' });
          } else {
            doc.text(h, tableX, currentY + 4.2);
          }
          tableX += colWidths[i];
        });
        currentY += 6;

        let totalGross = 0;
        let totalDisc = 0;
        let totalNet = 0;
        let totalBills = 0;

        options.deptCollections.forEach((dept, i) => {
          checkPageBreak(8);
          totalGross += dept.gross;
          totalDisc += dept.disc;
          totalNet += dept.net;
          totalBills += dept.count;

          doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
          doc.rect(marginLeft, currentY, contentWidth, 5.5, 'F');
          doc.setDrawColor(241, 245, 249);
          doc.line(marginLeft, currentY + 5.5, marginLeft + contentWidth, currentY + 5.5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(30, 41, 59);

          let curX = marginLeft + 3;
          doc.text(dept.label, curX, currentY + 3.8);
          curX += colWidths[0];

          doc.text(String(dept.count), curX + colWidths[1] - 6, currentY + 3.8, { align: 'right' });
          curX += colWidths[1];

          doc.text(formatCurrency(dept.gross), curX + colWidths[2] - 6, currentY + 3.8, { align: 'right' });
          curX += colWidths[2];

          doc.setTextColor(220, 38, 38);
          doc.text(`-${formatCurrency(dept.disc)}`, curX + colWidths[3] - 6, currentY + 3.8, { align: 'right' });
          curX += colWidths[3];

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(13, 148, 136);
          doc.text(formatCurrency(dept.net), curX + colWidths[4] - 6, currentY + 3.8, { align: 'right' });

          currentY += 5.5;
        });

        // Total Row
        doc.setFillColor(241, 245, 249);
        doc.rect(marginLeft, currentY, contentWidth, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);

        let curX = marginLeft + 3;
        doc.text('TOTAL CONSOLIDATED COLLECTIONS', curX, currentY + 4.2);
        curX += colWidths[0];
        doc.text(String(totalBills), curX + colWidths[1] - 6, currentY + 4.2, { align: 'right' });
        curX += colWidths[1];
        doc.text(formatCurrency(totalGross), curX + colWidths[2] - 6, currentY + 4.2, { align: 'right' });
        curX += colWidths[2];
        doc.setTextColor(220, 38, 38);
        doc.text(`-${formatCurrency(totalDisc)}`, curX + colWidths[3] - 6, currentY + 4.2, { align: 'right' });
        curX += colWidths[3];
        doc.setTextColor(13, 148, 136);
        doc.text(formatCurrency(totalNet), curX + colWidths[4] - 6, currentY + 4.2, { align: 'right' });

        currentY += 10;
      }

      // Section: Staff Productivity Matrix Table
      if (options.staffProductivity && options.staffProductivity.length > 0 && (options.scope === 'all' || options.scope === 'staff_productivity')) {
        checkPageBreak(50);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text('3. Healthcare Staff Productivity & Intake Leaderboard', marginLeft, currentY);
        currentY += 4;

        const staffCols = [48, 30, 26, 26, 26, 26];
        const staffHeaders = ['Staff Officer & ID', 'Assigned Role', 'Patients Registered', 'Cards Printed', 'Avg Process Time', 'Accuracy Score'];

        doc.setFillColor(15, 23, 42);
        doc.rect(marginLeft, currentY, contentWidth, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);

        let tableX = marginLeft + 3;
        staffHeaders.forEach((h, i) => {
          const alignRight = i >= 2;
          if (alignRight) {
            doc.text(h, tableX + staffCols[i] - 6, currentY + 4.2, { align: 'right' });
          } else {
            doc.text(h, tableX, currentY + 4.2);
          }
          tableX += staffCols[i];
        });
        currentY += 6;

        options.staffProductivity.slice(0, 12).forEach((s, i) => {
          checkPageBreak(6);

          doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
          doc.rect(marginLeft, currentY, contentWidth, 5.5, 'F');
          doc.setDrawColor(241, 245, 249);
          doc.line(marginLeft, currentY + 5.5, marginLeft + contentWidth, currentY + 5.5);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(30, 41, 59);

          let curX = marginLeft + 3;
          doc.text(`${s.fullName} (${s.staffId || 'STAFF'})`, curX, currentY + 3.8);
          curX += staffCols[0];

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          doc.text(s.role.toUpperCase(), curX, currentY + 3.8);
          curX += staffCols[1];

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(13, 148, 136);
          doc.text(`${s.registeredCount}`, curX + staffCols[2] - 6, currentY + 3.8, { align: 'right' });
          curX += staffCols[2];

          doc.setTextColor(2, 132, 199);
          doc.text(`${s.cardsPrinted}`, curX + staffCols[3] - 6, currentY + 3.8, { align: 'right' });
          curX += staffCols[3];

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          doc.text(`${s.avgProcessMinutes} min`, curX + staffCols[4] - 6, currentY + 3.8, { align: 'right' });
          curX += staffCols[4];

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(16, 185, 129);
          doc.text(`${s.accuracyScore}%`, curX + staffCols[5] - 6, currentY + 3.8, { align: 'right' });

          currentY += 5.5;
        });

        currentY += 6;
      }

      // Section: Doctor Recommendations & Commission Referrals Table
      if (options.doctorReferrals && options.doctorReferrals.length > 0 && (options.scope === 'all' || options.scope === 'doctor_referrals')) {
        checkPageBreak(50);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text('4. Doctor Recommendations & Referral Commission Audit', marginLeft, currentY);
        currentY += 4;

        const docCols = [50, 30, 26, 26, 26, 24];
        const docHeaders = ['Doctor Name & Code', 'Speciality', 'Referred Tests', 'Lab Revenue', 'Earned Comm.', 'Payable Bal.'];

        doc.setFillColor(15, 23, 42);
        doc.rect(marginLeft, currentY, contentWidth, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);

        let tableX = marginLeft + 3;
        docHeaders.forEach((h, i) => {
          const alignRight = i >= 2;
          if (alignRight) {
            doc.text(h, tableX + docCols[i] - 6, currentY + 4.2, { align: 'right' });
          } else {
            doc.text(h, tableX, currentY + 4.2);
          }
          tableX += docCols[i];
        });
        currentY += 6;

        options.doctorReferrals.slice(0, 10).forEach((docItem, i) => {
          checkPageBreak(6);

          doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
          doc.rect(marginLeft, currentY, contentWidth, 5.5, 'F');
          doc.setDrawColor(241, 245, 249);
          doc.line(marginLeft, currentY + 5.5, marginLeft + contentWidth, currentY + 5.5);

          let curX = marginLeft + 3;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(30, 41, 59);
          doc.text(`${docItem.name} (${docItem.doctorCode})`, curX, currentY + 3.8);
          curX += docCols[0];

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          doc.text(docItem.speciality, curX, currentY + 3.8);
          curX += docCols[1];

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(`${docItem.totalTestsReferredCount} tests`, curX + docCols[2] - 6, currentY + 3.8, { align: 'right' });
          curX += docCols[2];

          doc.text(formatCurrency(docItem.totalReferredLabRevenue), curX + docCols[3] - 6, currentY + 3.8, { align: 'right' });
          curX += docCols[3];

          doc.setTextColor(147, 51, 234);
          doc.text(formatCurrency(docItem.totalCommissionEarned), curX + docCols[4] - 6, currentY + 3.8, { align: 'right' });
          curX += docCols[4];

          doc.setTextColor(217, 119, 6);
          doc.text(formatCurrency(docItem.payableCommissionBalance), curX + docCols[5] - 6, currentY + 3.8, { align: 'right' });

          currentY += 5.5;
        });

        currentY += 6;
      }

      // Section: Cryptographic Audit Trail Records
      if (options.auditTrail && options.auditTrail.length > 0 && (options.scope === 'all' || options.scope === 'audit_ledger')) {
        checkPageBreak(40);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text('5. Sequential Cryptographic Audit Ledger (SHA-256 Verified)', marginLeft, currentY);
        currentY += 4;

        options.auditTrail.slice(0, 8).forEach((log) => {
          checkPageBreak(8);

          doc.setFillColor(248, 250, 252);
          doc.roundedRect(marginLeft, currentY, contentWidth, 7, 1.5, 1.5, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(marginLeft, currentY, contentWidth, 7, 1.5, 1.5, 'S');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(147, 51, 234);
          doc.text(`[${log.module.toUpperCase()}] ${log.action}`, marginLeft + 3, currentY + 3.2);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6);
          doc.setTextColor(71, 85, 105);
          doc.text(log.description.slice(0, 75), marginLeft + 3, currentY + 5.8);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.5);
          doc.setTextColor(148, 163, 184);
          doc.text(`Op: ${log.userName} • ${formatDateTime(log.timestamp)}`, marginLeft + contentWidth - 55, currentY + 3.2);
          if (log.hash) {
            doc.text(`Hash: ${log.hash.slice(0, 18)}...`, marginLeft + contentWidth - 55, currentY + 5.8);
          }

          currentY += 8;
        });
      }

      // Final Signatory Box
      checkPageBreak(25);
      currentY += 4;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, currentY, marginLeft + 50, currentY);
      doc.line(pageWidth - marginRight - 50, currentY, pageWidth - marginRight, currentY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text('Prepared By (Auditor / Staff)', marginLeft, currentY + 4);
      doc.text('Authorized Medical Superintendent', pageWidth - marginRight - 50, currentY + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.text(`${options.operatorName} (${options.operatorRole})`, marginLeft, currentY + 7);
      doc.text('LABMEDIX Executive Board of Governance', pageWidth - marginRight - 50, currentY + 7);

      // Draw footer for the last page
      drawFooter();

      // Download PDF
      const filename = `LABMEDIX_ANALYTICS_REPORT_${options.branchCode}_${options.scope.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);

      AuditService.log('REPORT_EXPORTED', 'security', `Exported analytical PDF report (${options.scope}) for ${options.branchName}`);
    } catch (error) {
      console.error('Error generating Analytics PDF export:', error);
      throw error;
    }
  }

  /**
   * Generates a structured multi-section CSV for analytical data
   */
  public static exportAnalyticsToCsv(options: AnalyticsPdfExportOptions): void {
    const timestamp = new Date().toISOString().slice(0, 10);
    const timeFull = new Date().toISOString();

    const sections: string[] = [];

    // Header Meta
    sections.push([
      `"LABMEDIX EXECUTIVE ANALYTICAL & FINANCIAL REPORT"`,
      `"Scope: ${options.scope.toUpperCase()}"`,
      `"Branch: ${options.branchName} (${options.branchCode})"`,
      `"Period: ${options.timeRange.toUpperCase()}"`,
      `"Generated By: ${options.operatorName} (${options.operatorRole})"`,
      `"Timestamp: ${timeFull}"`
    ].join(','));

    sections.push(''); // Empty line

    // 1. Core KPIs
    sections.push('"--- 1. EXECUTIVE OPERATIONAL & FINANCIAL KPIS ---"');
    sections.push(['Metric Category', 'Indicator Name', 'Current Value', 'Branch Scope', 'Timestamp'].join(','));
    sections.push([
      'Financials',
      'Card Membership Fee Revenue',
      `"${formatCurrency(options.kpis.totalRegistrationRevenue)}"`,
      options.branchCode,
      timestamp
    ].join(','));
    sections.push([
      'Financials',
      'Prepaid Patient Float Reserve',
      `"${formatCurrency(options.kpis.totalWalletFloat)}"`,
      options.branchCode,
      timestamp
    ].join(','));
    sections.push([
      'Patient Volume',
      'Total Active Registered Patients',
      options.kpis.activePatientsCount,
      options.branchCode,
      timestamp
    ].join(','));
    sections.push([
      'Card Operations',
      'Active CR80 Health Cards Embossed',
      options.kpis.activeCardCount,
      options.branchCode,
      timestamp
    ].join(','));
    sections.push([
      'Financials',
      'Total Prepaid Wallet Deposits Collected',
      `"${formatCurrency(options.kpis.totalWalletDeposits)}"`,
      options.branchCode,
      timestamp
    ].join(','));
    sections.push([
      'Financials',
      'Total OPD & Lab Billing Deductions (Discounts Delivered)',
      `"${formatCurrency(options.kpis.totalBillingDeductions)}"`,
      options.branchCode,
      timestamp
    ].join(','));

    sections.push('');

    // 2. Department Collections
    if (options.deptCollections && options.deptCollections.length > 0) {
      sections.push('"--- 2. DEPARTMENT REVENUE & COLLECTIONS BREAKDOWN ---"');
      sections.push(['Department Name', 'Bill Count', 'Gross Revenue (INR)', 'Discounts Given (INR)', 'Net Collection (INR)'].join(','));
      options.deptCollections.forEach(dept => {
        sections.push([
          `"${dept.label}"`,
          dept.count,
          dept.gross,
          dept.disc,
          dept.net
        ].join(','));
      });
      sections.push('');
    }

    // 3. Staff Productivity
    if (options.staffProductivity && options.staffProductivity.length > 0) {
      sections.push('"--- 3. STAFF PRODUCTIVITY & THROUGHPUT MATRIX ---"');
      sections.push(['Staff Name', 'Staff ID', 'Assigned Role', 'Patients Registered', 'Cards Printed', 'Avg Process Time (min)', 'Accuracy Score (%)', 'Rank Badge'].join(','));
      options.staffProductivity.forEach(s => {
        sections.push([
          `"${s.fullName}"`,
          `"${s.staffId || 'N/A'}"`,
          `"${s.role}"`,
          s.registeredCount,
          s.cardsPrinted,
          s.avgProcessMinutes,
          `${s.accuracyScore}%`,
          `"${s.rankBadge}"`
        ].join(','));
      });
      sections.push('');
    }

    // 4. Doctor Referrals
    if (options.doctorReferrals && options.doctorReferrals.length > 0) {
      sections.push('"--- 4. DOCTOR RECOMMENDATIONS & REFERRAL COMMISSIONS ---"');
      sections.push(['Doctor Name', 'Doctor Code', 'Speciality', 'Referred Tests Count', 'Lab Revenue (INR)', 'Commission %', 'Commission Earned (INR)', 'Commission Paid (INR)', 'Payable Balance (INR)'].join(','));
      options.doctorReferrals.forEach(doc => {
        sections.push([
          `"${doc.name}"`,
          `"${doc.doctorCode}"`,
          `"${doc.speciality}"`,
          doc.totalTestsReferredCount,
          doc.totalReferredLabRevenue,
          `${doc.bloodCommissionPercent}%`,
          doc.totalCommissionEarned,
          doc.totalCommissionPaid,
          doc.payableCommissionBalance
        ].join(','));
      });
      sections.push('');
    }

    // 5. Velocity Trend
    if (options.velocityTrend && options.velocityTrend.length > 0) {
      sections.push('"--- 5. REGISTRATION & FINANCIAL VELOCITY TREND ---"');
      sections.push(['Day', 'New Patients', 'Cards Embossed', 'Prepaid Recharged (INR)', 'Billing Redeemed (INR)'].join(','));
      options.velocityTrend.forEach(v => {
        sections.push([
          v.day,
          v.newPatients,
          v.cardsIssued,
          v.prepaidRecharged,
          v.billingRedeemed
        ].join(','));
      });
      sections.push('');
    }

    // 6. Audit Trail
    if (options.auditTrail && options.auditTrail.length > 0) {
      sections.push('"--- 6. CRYPTOGRAPHIC AUDIT LEDGER ---"');
      sections.push(['Module', 'Action', 'Description', 'Operator', 'Timestamp', 'SHA-256 Hash'].join(','));
      options.auditTrail.forEach(a => {
        sections.push([
          `"${a.module}"`,
          `"${a.action}"`,
          `"${a.description.replace(/"/g, '""')}"`,
          `"${a.userName}"`,
          `"${a.timestamp}"`,
          `"${a.hash || 'N/A'}"`
        ].join(','));
      });
      sections.push('');
    }

    const csvContent = sections.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LABMEDIX_ANALYTICS_REPORT_${options.branchCode}_${options.scope.toUpperCase()}_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    AuditService.log('REPORT_EXPORTED', 'security', `Exported analytical CSV report (${options.scope}) for ${options.branchName}`);
  }
}