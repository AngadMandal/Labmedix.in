import React, { useState } from 'react';
import { Patient, HealthCard, Membership, CompanyProfile } from '../../types';
import { CR80CardFront } from './CR80CardFront';
import { CR80CardBack } from './CR80CardBack';
import { CardPrintConfirmationModal } from './CardPrintConfirmationModal';
import { Button } from '../common/Button';
import { ExportService } from '../../services/exportService';
import { PrintService } from '../../services/printService';
import { useToast } from '../../context/ToastContext';
import { triggerCelebrationFireworks } from '../../utils/confetti';
import { Printer, Download, Scissors, Check, Settings2, FileSpreadsheet } from 'lucide-react';

interface CardA4SheetProps {
  patientsWithCards: {
    patient: Patient;
    card: HealthCard;
    membership: Membership;
  }[];
  company: CompanyProfile;
}

export const CardA4Sheet: React.FC<CardA4SheetProps> = ({
  patientsWithCards,
  company
}) => {
  const [layoutMode, setLayoutMode] = useState<'front_only' | 'front_and_back' | 'back_only'>('front_and_back');
  const [cardsCount, setCardsCount] = useState<number>(2); // 1, 2, 4, 8
  const [showCutMarks, setShowCutMarks] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const { showToast } = useToast();

  const handleExportA4Pdf = async () => {
    const sheetEl = document.getElementById('a4-sheet-container');
    if (!sheetEl) return;
    try {
      setIsExporting(true);
      await ExportService.exportA4SheetToPdf(sheetEl, `LABMEDIX_A4_CARDS_SHEET_${Date.now().toString(36)}.pdf`);
      triggerCelebrationFireworks();
      showToast('success', 'A4 PDF Exported!', 'Full A4 print sheet with cutting marks downloaded.');
    } catch (err: any) {
      showToast('error', 'Export Failed', err.message || 'Failed to export A4 PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = (settings?: { printerName: string; layoutMode: string; scale: string; margins: string }) => {
    const sheetEl = document.getElementById('a4-sheet-container');
    if (!sheetEl) {
      window.print();
      return;
    }
    PrintService.printA4Sheet(sheetEl, 'LABMEDIX A4 Multi-Card Print Sheet');
    showToast('info', 'Print Window Opened', `A4 Sheet sent to printer [${settings?.printerName || 'Default'}].`);
  };

  // Render items based on count
  const displayedItems = patientsWithCards.slice(0, cardsCount);

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Print Mode
            </label>
            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value as any)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="front_and_back">Front & Back Pairs</option>
              <option value="front_only">Front Side Only</option>
              <option value="back_only">Back Side Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Cards on Sheet
            </label>
            <select
              value={cardsCount}
              onChange={(e) => setCardsCount(Number(e.target.value))}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value={1}>1 Card Pair</option>
              <option value={2}>2 Cards (Recommended)</option>
              <option value={4}>4 Cards</option>
              <option value={8}>8 Cards (Max Density)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="cutmarks"
              checked={showCutMarks}
              onChange={(e) => setShowCutMarks(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="cutmarks" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Show Cutting Guides (Corner marks)
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4 text-emerald-600" />}
            onClick={handleExportA4Pdf}
            isLoading={isExporting}
          >
            Export A4 PDF
          </Button>
          <Button
            variant="primary"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => setIsPrintModalOpen(true)}
          >
            Print A4 Page
          </Button>
        </div>
      </div>

      {/* A4 Sheet Preview Canvas */}
      <div className="flex justify-center overflow-x-auto p-4 sm:p-8 bg-slate-200 dark:bg-slate-950 rounded-3xl border border-slate-300 dark:border-slate-800">
        <div
          id="a4-sheet-container"
          style={{
            width: '794px', // Standard 96 DPI A4 width (210 mm)
            minHeight: '1123px', // Standard 96 DPI A4 height (297 mm)
            backgroundColor: '#FFFFFF',
            color: '#000000',
            padding: '40px 30px'
          }}
          className="shadow-2xl relative flex flex-col justify-between"
        >
          {/* Top A4 Sheet Header */}
          <div className="flex items-center justify-between border-b pb-3 mb-6">
            <div className="flex items-center gap-3">
              <img src={company.logoUrl || '/logo.jpg'} alt="Logo" className="w-10 h-10 object-contain" />
              <div>
                <h2 className="text-sm font-extrabold tracking-wide uppercase">{company.name} AUTO HEALTH CARD PRINT SHEET</h2>
                <p className="text-[10px] text-slate-500 font-medium">Standard CR80 PVC Dimensions (85.60 mm × 53.98 mm) • Estd. 2025</p>
              </div>
            </div>
            <div className="text-right text-[9px] text-slate-400 font-mono">
              Date: {new Date().toLocaleDateString('en-IN')}<br />
              Generated via LABMEDIX Studio
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 gap-8 my-auto justify-items-center">
            {displayedItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {/* Front Side Card Container with Cut Marks */}
                {(layoutMode === 'front_and_back' || layoutMode === 'front_only') && (
                  <div className="relative p-2 flex flex-col items-center">
                    {showCutMarks && (
                      <>
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-slate-400" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-400" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-slate-400" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-slate-400" />
                      </>
                    )}
                    <div style={{ width: '320px', height: '201px' }} className="overflow-hidden">
                      <CR80CardFront
                        patient={item.patient}
                        card={item.card}
                        membership={item.membership}
                        company={company}
                        scale={320 / 500}
                      />
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 mt-1">FRONT — {item.card.cardNumber}</span>
                  </div>
                )}

                {/* Back Side Card Container with Cut Marks */}
                {(layoutMode === 'front_and_back' || layoutMode === 'back_only') && (
                  <div className="relative p-2 flex flex-col items-center">
                    {showCutMarks && (
                      <>
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-slate-400" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-400" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-slate-400" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-slate-400" />
                      </>
                    )}
                    <div style={{ width: '320px', height: '201px' }} className="overflow-hidden">
                      <CR80CardBack
                        patient={item.patient}
                        card={item.card}
                        membership={item.membership}
                        company={company}
                        scale={320 / 500}
                      />
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 mt-1">BACK — {item.card.cardNumber}</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Footer Guidelines */}
          <div className="border-t pt-3 mt-6 flex items-center justify-between text-[9px] text-slate-400">
            <div className="flex items-center gap-1">
              <Scissors className="w-3 h-3" />
              <span>Cut along the corner guidelines for standard ISO-7810 CR80 PVC card slot insertion.</span>
            </div>
            <span>Helpline: {company.helpline}</span>
          </div>
        </div>
      </div>

      <CardPrintConfirmationModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onConfirmPrint={(settings) => handlePrint(settings)}
        printType="a4_sheet"
        cardTitle="A4 Multi-Card Print Sheet"
      />
    </div>
  );
};