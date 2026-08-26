import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { AuditService } from './auditService';

export class ExportService {
  /**
   * Captures an element to HTML5 Canvas safely in an isolated sandbox,
   * avoiding 3D perspective transforms, viewport clipping, and scaling distortions.
   */
  public static async captureElementToCanvas(element: HTMLElement, scale = 3): Promise<HTMLCanvasElement> {
    // 1. Create a clean in-DOM sandbox container
    const sandbox = document.createElement('div');
    sandbox.style.position = 'fixed';
    sandbox.style.top = '0px';
    sandbox.style.left = '0px';
    sandbox.style.zIndex = '-99999';
    sandbox.style.opacity = '1';
    sandbox.style.pointerEvents = 'none';
    sandbox.style.background = 'transparent';
    sandbox.style.overflow = 'visible';

    // 2. Clone the element
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.transform = 'none';
    clone.style.transformOrigin = 'top left';
    clone.style.margin = '0';
    clone.style.boxShadow = 'none';
    clone.style.position = 'relative';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.display = 'block';
    clone.style.visibility = 'visible';

    // Ensure all images in clone have crossOrigin set
    const images = clone.querySelectorAll('img');
    images.forEach(img => {
      img.crossOrigin = 'anonymous';
    });

    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);

    // Wait a moment for DOM and fonts to settle
    await new Promise(r => setTimeout(r, 120));

    try {
      const canvas = await html2canvas(clone, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        width: clone.offsetWidth || 500,
        height: clone.offsetHeight || 315,
        windowWidth: 1920,
        windowHeight: 1080
      });
      return canvas;
    } finally {
      document.body.removeChild(sandbox);
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
   * Generates single or multi-page A4 PDF for Clinical Prescriptions
   */
  public static async exportPrescriptionToPdf(element: HTMLElement, filename = 'LABMEDIX_PRESCRIPTION.pdf'): Promise<void> {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4' // 210 x 297 mm
      });

      const canvas = await this.captureElementToCanvas(element, 2.5);
      const imgData = canvas.toDataURL('image/png', 1.0);
      
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
      AuditService.log('PRESCRIPTION_EXPORTED', 'patient', `Exported A4 Prescription PDF: ${filename}`);
    } catch (error) {
      console.error('Error generating Prescription PDF export:', error);
      throw error;
    }
  }
}