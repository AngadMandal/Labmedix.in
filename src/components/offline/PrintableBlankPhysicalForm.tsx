import React, { useRef } from 'react';
import { StorageService } from '../../services/storage';
import { Printer, Download, ArrowLeft, ShieldCheck, Heart, Stethoscope, Award, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '../common/Button';

interface PrintableBlankPhysicalFormProps {
  onBack?: () => void;
  campNamePreset?: string;
}

export const PrintableBlankPhysicalForm: React.FC<PrintableBlankPhysicalFormProps> = ({
  onBack,
  campNamePreset
}) => {
  const company = StorageService.getCompanyProfile();
  const printContainerRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Printable Physical Application Form</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                A4 Standard Format
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-resolution blank hardcopy form for rural health camps, on-ground field workers, and front-desk physical enrollment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
            className="shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Print Blank Form (A4)
          </Button>
        </div>
      </div>

      {/* Printable Sheet Container (Styled for Screen & Paper) */}
      <div className="flex justify-center bg-slate-100 dark:bg-slate-950 p-2 sm:p-6 rounded-2xl overflow-x-auto print:p-0 print:bg-white print:m-0">
        <div
          ref={printContainerRef}
          className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-10 shadow-2xl border border-slate-300 print:shadow-none print:border-none print:p-6 print:m-0 print:max-w-none print:w-full font-sans text-xs leading-tight"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Header Section */}
          <div className="border-b-2 border-slate-900 pb-3 mb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-black text-2xl border-2 border-blue-900 shrink-0">
                  LM
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                    {company.name || 'LABMEDIX HEALTHCARE & DIAGNOSTIC SERVICES'}
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-700">
                    {company.tagline || 'Automated Smart Health Card & Clinical Diagnostic Network'}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {company.address || 'Central Healthcare Campus, Medical College Road'} | Phone: {company.phone || '+91 98765 43210'} | Email: {company.email || 'support@labmedix.com'}
                  </p>
                </div>
              </div>

              {/* Photo Box */}
              <div className="w-24 h-28 border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-center p-1 shrink-0 bg-slate-50">
                <div className="text-[9px] font-bold text-slate-600 uppercase">Affix Passport Size Photo Here</div>
                <div className="text-[8px] text-slate-400 mt-1">(3.5cm × 4.5cm)</div>
              </div>
            </div>

            {/* Form Title Banner */}
            <div className="mt-2.5 py-1 px-3 bg-slate-900 text-white flex items-center justify-between rounded">
              <span className="font-black text-xs uppercase tracking-wider">
                PATIENT ENROLLMENT & HEALTH CARD APPLICATION FORM (অফলাইন আবেদনপত্র)
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-300">
                FORM NO: LM-APP-{new Date().getFullYear()}-___________
              </span>
            </div>
          </div>

          {/* Section 1: Personal & Demographics */}
          <div className="mb-3">
            <div className="bg-slate-200 px-2 py-0.5 font-black text-[10px] uppercase tracking-wider text-slate-900 border-l-4 border-blue-700 mb-1.5 flex justify-between">
              <span>1. PRIMARY PATIENT INFORMATION (ব্যক্তিগত বিবরণ)</span>
              <span className="text-[9px] font-normal text-slate-600">Please fill in BLOCK LETTERS</span>
            </div>

            <div className="grid grid-cols-12 gap-1.5">
              <div className="col-span-8 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Full Name of Applicant (রোগীর পুরো নাম):</span>
                <div className="h-5 border-b border-dotted border-slate-400 mt-1"></div>
              </div>

              <div className="col-span-4 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Date of Birth / Age (জন্ম তারিখ / বয়স):</span>
                <div className="h-5 flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>DD / MM / YYYY</span>
                  <span className="border-l border-slate-300 pl-2">Age: _____ Yrs</span>
                </div>
              </div>

              <div className="col-span-7 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Father / Mother / Spouse Name (অভিভাবকের নাম):</span>
                <div className="h-5 border-b border-dotted border-slate-400 mt-1"></div>
              </div>

              <div className="col-span-5 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Gender (লিঙ্গ):</span>
                <div className="flex items-center gap-3 text-[10px] mt-1 font-semibold">
                  <label className="flex items-center gap-1"><span className="w-3.5 h-3.5 border border-slate-600 inline-block rounded-xs"></span> Male</label>
                  <label className="flex items-center gap-1"><span className="w-3.5 h-3.5 border border-slate-600 inline-block rounded-xs"></span> Female</label>
                  <label className="flex items-center gap-1"><span className="w-3.5 h-3.5 border border-slate-600 inline-block rounded-xs"></span> Other</label>
                </div>
              </div>

              <div className="col-span-3 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Blood Group (রক্তের গ্রুপ):</span>
                <div className="text-[10px] font-bold mt-1 text-slate-800">
                  [ ] A+ [ ] B+ [ ] O+ [ ] AB+ [ ] Other
                </div>
              </div>

              <div className="col-span-3 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Marital Status (বৈবাহিক স্থিতি):</span>
                <div className="text-[10px] mt-1 text-slate-800">
                  [ ] Married [ ] Single
                </div>
              </div>

              <div className="col-span-3 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Govt ID Type (পরিচয়পত্র):</span>
                <div className="text-[9px] mt-1 text-slate-800">
                  [ ] Aadhaar [ ] Voter [ ] Ration
                </div>
              </div>

              <div className="col-span-3 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Govt ID Number (নম্বর):</span>
                <div className="h-5 border-b border-dotted border-slate-400 mt-1"></div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Postal Address */}
          <div className="mb-3">
            <div className="bg-slate-200 px-2 py-0.5 font-black text-[10px] uppercase tracking-wider text-slate-900 border-l-4 border-blue-700 mb-1.5">
              2. CONTACT DETAILS & POSTAL ADDRESS (যোগাযোগ ও স্থায়ী ঠিকানা)
            </div>

            <div className="grid grid-cols-12 gap-1.5">
              <div className="col-span-4 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Primary Mobile No (মোবাইল নম্বর):</span>
                <div className="h-5 flex items-center gap-1 text-[11px] font-mono font-bold mt-1">
                  <span className="text-slate-500">+91</span>
                  <div className="flex-1 flex gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i} className="w-4 h-4 border border-slate-400 inline-block text-center text-[10px]"></span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-4 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">WhatsApp / Alternate No:</span>
                <div className="h-5 border-b border-dotted border-slate-400 mt-1"></div>
              </div>

              <div className="col-span-4 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Email Address (ঐচ্ছিক):</span>
                <div className="h-5 border-b border-dotted border-slate-400 mt-1"></div>
              </div>

              <div className="col-span-5 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Village / Street / House No:</span>
                <div className="h-5 border-b border-dotted border-slate-400 mt-1"></div>
              </div>

              <div className="col-span-3 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Post Office (ডাকঘর):</span>
                <div className="h-5 border-b border-dotted border-slate-400 mt-1"></div>
              </div>

              <div className="col-span-4 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Police Station (থানা):</span>
                <div className="h-5 border-b border-dotted border-slate-400 mt-1"></div>
              </div>

              <div className="col-span-4 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">District (জেলা):</span>
                <div className="h-5 border-b border-dotted border-slate-400 mt-1"></div>
              </div>

              <div className="col-span-4 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">State (রাজ্য):</span>
                <div className="h-5 border-b border-dotted border-slate-400 mt-1"></div>
              </div>

              <div className="col-span-4 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase">Postal PIN Code (পিন কোড):</span>
                <div className="h-5 flex gap-1 mt-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} className="w-5 h-4 border border-slate-500 inline-block text-center text-[10px]"></span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Baseline Clinical Vitals & Medical History */}
          <div className="mb-3">
            <div className="bg-slate-200 px-2 py-0.5 font-black text-[10px] uppercase tracking-wider text-slate-900 border-l-4 border-blue-700 mb-1.5">
              3. MEDICAL HISTORY & FIELD BASELINE VITALS (চিকিৎসা ইতিহাস ও ভাইটালস)
            </div>

            <div className="grid grid-cols-12 gap-1.5">
              <div className="col-span-7 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase mb-1">Pre-Existing Conditions (রোগের ইতিহাস):</span>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
                  <label className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-600 inline-block rounded-xs"></span> Diabetes (মধুমেহ)</label>
                  <label className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-600 inline-block rounded-xs"></span> Hypertension (উচ্চ রক্তচাপ)</label>
                  <label className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-600 inline-block rounded-xs"></span> Cardiac / Heart Disease</label>
                  <label className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-600 inline-block rounded-xs"></span> Asthma / Respiratory (হাঁপানি)</label>
                  <label className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-600 inline-block rounded-xs"></span> Known Drug Allergies (অ্যালার্জি)</label>
                  <label className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-600 inline-block rounded-xs"></span> Thyroid Disorder</label>
                </div>
              </div>

              <div className="col-span-5 border border-slate-400 p-1.5 rounded">
                <span className="text-[9px] font-bold text-slate-700 block uppercase mb-1">On-Spot Field Vitals (ক্যাম্প ভাইটালস):</span>
                <div className="grid grid-cols-2 gap-1 text-[9px]">
                  <div>BP: _______ / _______ mmHg</div>
                  <div>Pulse: _______ bpm</div>
                  <div>Blood Sugar: _____ mg/dL</div>
                  <div>SpO2: _______ %</div>
                  <div>Weight: _____ kg | Ht: ___ cm</div>
                  <div>Temp: _______ °F</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Membership Tier & Family Members */}
          <div className="mb-3">
            <div className="bg-slate-200 px-2 py-0.5 font-black text-[10px] uppercase tracking-wider text-slate-900 border-l-4 border-blue-700 mb-1.5 flex justify-between">
              <span>4. HEALTH CARD MEMBERSHIP & FAMILY ENROLLMENT (মেম্বারশিপ ও পরিবার)</span>
              <span className="text-[9px] font-bold text-slate-700">Select Plan: [ ] Gold [ ] Silver [ ] Platinum [ ] NGO Welfare Free</span>
            </div>

            <table className="w-full border-collapse border border-slate-400 text-[9px] mb-1">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-800">
                  <th className="border border-slate-400 p-1 text-center w-8">Sl.</th>
                  <th className="border border-slate-400 p-1 text-left">Family Member Full Name (পরিবারের সদস্যের নাম)</th>
                  <th className="border border-slate-400 p-1 text-center w-24">Relation (সম্পর্ক)</th>
                  <th className="border border-slate-400 p-1 text-center w-16">Age / Sex</th>
                  <th className="border border-slate-400 p-1 text-center w-16">Blood Grp</th>
                  <th className="border border-slate-400 p-1 text-center w-20">Card Required?</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(num => (
                  <tr key={num} className="h-6">
                    <td className="border border-slate-400 text-center font-bold">{num}</td>
                    <td className="border border-slate-400 px-1"></td>
                    <td className="border border-slate-400 px-1"></td>
                    <td className="border border-slate-400 px-1"></td>
                    <td className="border border-slate-400 px-1"></td>
                    <td className="border border-slate-400 text-center">[ ] Yes  [ ] No</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 5: Field Camp & Payment Section */}
          <div className="mb-3">
            <div className="bg-slate-200 px-2 py-0.5 font-black text-[10px] uppercase tracking-wider text-slate-900 border-l-4 border-blue-700 mb-1.5">
              5. FIELD CAMP / AGENT DETAILS & PAYMENT (ক্যাম্প ও পেমেন্ট বিবরণ)
            </div>

            <div className="grid grid-cols-12 gap-1.5 text-[9px]">
              <div className="col-span-5 border border-slate-400 p-1.5 rounded">
                <span className="font-bold text-slate-700 block uppercase">Camp Name / Location (ক্যাম্পের নাম):</span>
                <div className="h-5 text-[10px] font-semibold text-slate-800 mt-1">
                  {campNamePreset || '_____________________________________________'}
                </div>
              </div>

              <div className="col-span-4 border border-slate-400 p-1.5 rounded">
                <span className="font-bold text-slate-700 block uppercase">Field Worker / Agent Name:</span>
                <div className="h-5 border-b border-dotted border-slate-400 mt-1"></div>
              </div>

              <div className="col-span-3 border border-slate-400 p-1.5 rounded">
                <span className="font-bold text-slate-700 block uppercase">Fee Paid / Mode:</span>
                <div className="mt-1 font-bold">
                  ₹ _________ [ ] Cash [ ] UPI [ ] Free
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Declarations & Signatures */}
          <div className="mb-4 border border-slate-400 p-2 rounded bg-slate-50">
            <p className="text-[8px] text-slate-600 leading-tight mb-2">
              <strong>Declaration (ঘোষণা):</strong> I hereby declare that all the information provided above is true and accurate to the best of my knowledge. I authorize LabMedix Healthcare to issue my Health Card and maintain my clinical diagnostic records in accordance with standard medical confidentiality policies.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-3">
              <div className="text-center">
                <div className="h-8 border-b border-slate-500"></div>
                <div className="text-[9px] font-bold text-slate-800 mt-1">Signature / Thumb Impression of Applicant</div>
                <div className="text-[8px] text-slate-500">(আবেদনকারীর স্বাক্ষর / টিপসই)</div>
              </div>

              <div className="text-center">
                <div className="h-8 border-b border-slate-500"></div>
                <div className="text-[9px] font-bold text-slate-800 mt-1">Authorized Camp Officer / Registrar Seal</div>
                <div className="text-[8px] text-slate-500">(অনুমোদিত রেজিস্ট্রারের স্বাক্ষর ও সিল)</div>
              </div>
            </div>
          </div>

          {/* Tear-Off Bottom Acknowledgment Slip */}
          <div className="border-t-2 border-dashed border-slate-800 pt-2.5 mt-3">
            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-600 mb-1">
              <span>✂ ----------------- TEAR-OFF PATIENT ACKNOWLEDGMENT SLIP (গ্রাহক প্রাপ্তি স্বীকার রসিদ) ----------------- ✂</span>
              <span>24/7 Helpline: 1800-123-HEALTH</span>
            </div>

            <div className="border border-slate-400 p-2 rounded bg-blue-50/50 flex items-center justify-between gap-4">
              <div>
                <div className="font-black text-[11px] text-slate-900">
                  {company.name || 'LABMEDIX HEALTHCARE'} - TEMPORARY ENROLLMENT RECEIPT
                </div>
                <div className="text-[9px] text-slate-700 mt-0.5">
                  Patient Name: ________________________________ | Mobile: _____________________
                </div>
                <div className="text-[9px] text-slate-700">
                  Application Token: <strong>LM-OFF-{new Date().getFullYear()}-______</strong> | Date: ____ / ____ / 2026 | Amount Received: ₹ _________
                </div>
                <div className="text-[8px] text-slate-500 mt-1">
                  * Bring this slip to collect your physical PVC CR80 Smart Health Card or visit our portal at labmedix.health
                </div>
              </div>

              <div className="w-14 h-14 border border-slate-600 rounded flex flex-col items-center justify-center text-center p-1 bg-white shrink-0">
                <span className="text-[7px] font-bold text-slate-700 uppercase">OFFICIAL STAMP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
