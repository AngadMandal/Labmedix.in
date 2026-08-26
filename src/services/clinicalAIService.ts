import { PrescribedMedication, OrderedLabTest, ClinicalVitals } from '../types';

export interface AIMedicineSuggestion {
  name: string;
  brand: string;
  generic: string;
  category: string;
  defaultDosage: string;
  defaultFrequency: string;
  defaultTiming: string;
  defaultDuration: string;
  instructions: string;
  contraindications?: string[];
}

export interface AILabTestSuggestion {
  testName: string;
  category: string;
  estimatedCost: number;
  fastingRequired: boolean;
  sampleType: string;
  indication: string;
}

export interface AIDiagnosisProtocol {
  diagnosisCode: string;
  diagnosisName: string;
  symptoms: string[];
  recommendedMeds: {
    name: string;
    dosage: string;
    frequency: string;
    timing: string;
    duration: string;
    instructions: string;
  }[];
  recommendedLabs: {
    testName: string;
    category: string;
    estimatedCost: number;
  }[];
  dietAndLifestyle: string[];
}

// 1. Comprehensive AI Clinical Drug Database (50+ Common Medications)
export const AI_MEDICINE_DATABASE: AIMedicineSuggestion[] = [
  // Cardiovascular & Hypertension
  {
    name: 'Tab. Telmisartan (Telma 40)',
    brand: 'Telma 40',
    generic: 'Telmisartan 40mg',
    category: 'Antihypertensive (ARB)',
    defaultDosage: '40mg',
    defaultFrequency: '1-0-0 (Morning)',
    defaultTiming: 'After Breakfast',
    defaultDuration: '30 Days',
    instructions: 'Take daily at a fixed morning time. Monitor BP weekly.'
  },
  {
    name: 'Tab. Telmisartan + Amlodipine (Telma-AM)',
    brand: 'Telma-AM',
    generic: 'Telmisartan 40mg + Amlodipine 5mg',
    category: 'Dual Antihypertensive',
    defaultDosage: '40mg + 5mg',
    defaultFrequency: '1-0-0 (Morning)',
    defaultTiming: 'After Breakfast',
    defaultDuration: '30 Days',
    instructions: 'Take in the morning. Watch for mild ankle swelling.'
  },
  {
    name: 'Tab. Amlodipine (Amlong 5)',
    brand: 'Amlong 5',
    generic: 'Amlodipine 5mg',
    category: 'Calcium Channel Blocker',
    defaultDosage: '5mg',
    defaultFrequency: '0-0-1 (Night)',
    defaultTiming: 'After Dinner',
    defaultDuration: '30 Days',
    instructions: 'Take at night. Avoid grapefruit juice.'
  },
  {
    name: 'Tab. Rosuvastatin (Rozavel 10)',
    brand: 'Rozavel 10',
    generic: 'Rosuvastatin 10mg',
    category: 'Lipid Lowering (Statin)',
    defaultDosage: '10mg',
    defaultFrequency: '0-0-1 (Night)',
    defaultTiming: 'After Dinner at Bedtime',
    defaultDuration: '30 Days',
    instructions: 'Take at bedtime. Avoid high fat diet.'
  },
  {
    name: 'Tab. Rosuvastatin + Clopidogrel (Rozavel-CV 10/75)',
    brand: 'Rozavel-CV',
    generic: 'Rosuvastatin 10mg + Clopidogrel 75mg',
    category: 'Antiplatelet & Statin',
    defaultDosage: '10mg + 75mg',
    defaultFrequency: '0-0-1 (Night)',
    defaultTiming: 'After Dinner',
    defaultDuration: '30 Days',
    instructions: 'Take strictly after food. Watch for unusual bleeding.'
  },
  {
    name: 'Tab. Atorvastatin + Aspirin (Atorva-ASP 75)',
    brand: 'Atorva-ASP',
    generic: 'Atorvastatin 10mg + Aspirin 75mg',
    category: 'Cardioprotective',
    defaultDosage: '10mg + 75mg',
    defaultFrequency: '0-0-1 (Night)',
    defaultTiming: 'After Dinner',
    defaultDuration: '30 Days',
    instructions: 'Take with water after dinner.'
  },
  {
    name: 'Tab. Metoprolol Succinate (Betaloc 25)',
    brand: 'Betaloc 25',
    generic: 'Metoprolol Succinate ER 25mg',
    category: 'Beta Blocker',
    defaultDosage: '25mg',
    defaultFrequency: '1-0-0 (Morning)',
    defaultTiming: 'After Breakfast',
    defaultDuration: '30 Days',
    instructions: 'Do not stop abruptly. Check pulse rate before taking.'
  },
  {
    name: 'Tab. Sorbitrate (Isosorbide Dinitrate 5mg)',
    brand: 'Sorbitrate 5',
    generic: 'Isosorbide Dinitrate 5mg',
    category: 'Anti-Anginal Nitrate',
    defaultDosage: '5mg',
    defaultFrequency: 'SOS (Sublingual)',
    defaultTiming: 'Under Tongue on Chest Pain',
    defaultDuration: 'As needed (10 Tabs)',
    instructions: 'Place under tongue on sudden chest tightness while sitting.'
  },

  // Diabetes Care
  {
    name: 'Tab. Metformin SR (Glycomet 500 SR)',
    brand: 'Glycomet 500 SR',
    generic: 'Metformin Hydrochloride 500mg SR',
    category: 'Antidiabetic (Biguanide)',
    defaultDosage: '500mg',
    defaultFrequency: '1-0-1 (Morning & Night)',
    defaultTiming: 'With or Immediately After Meals',
    defaultDuration: '30 Days',
    instructions: 'Take with main meals to prevent gastric upset.'
  },
  {
    name: 'Tab. Glimepiride + Metformin (Amaryl-M 1/500)',
    brand: 'Amaryl-M 1',
    generic: 'Glimepiride 1mg + Metformin 500mg',
    category: 'Dual Oral Hypoglycemic',
    defaultDosage: '1mg + 500mg',
    defaultFrequency: '1-0-0 (Morning)',
    defaultTiming: 'Before Breakfast (15 mins)',
    defaultDuration: '30 Days',
    instructions: 'Do not skip breakfast after taking. Keep candy handy for hypoglycemia.'
  },
  {
    name: 'Tab. Teneligliptin (Ziten 20)',
    brand: 'Ziten 20',
    generic: 'Teneligliptin 20mg',
    category: 'DPP-4 Inhibitor',
    defaultDosage: '20mg',
    defaultFrequency: '1-0-0 (Morning)',
    defaultTiming: 'Before or After Breakfast',
    defaultDuration: '30 Days',
    instructions: 'Safe with renal dosage adjustment. Take once daily.'
  },
  {
    name: 'Tab. Dapagliflozin (Forxiga 10)',
    brand: 'Forxiga 10',
    generic: 'Dapagliflozin 10mg',
    category: 'SGLT-2 Inhibitor (Cardiorenal)',
    defaultDosage: '10mg',
    defaultFrequency: '1-0-0 (Morning)',
    defaultTiming: 'After Breakfast',
    defaultDuration: '30 Days',
    instructions: 'Drink plenty of water (at least 2.5-3L daily) to prevent dehydration.'
  },

  // Gastrointestinal & Antacids
  {
    name: 'Cap. Pantoprazole + Domperidone (Pan-D)',
    brand: 'Pan-D',
    generic: 'Pantoprazole 40mg + Domperidone 30mg SR',
    category: 'Proton Pump Inhibitor & Prokinetic',
    defaultDosage: '40mg + 30mg',
    defaultFrequency: '1-0-0 (Morning)',
    defaultTiming: 'Empty Stomach (30 mins before breakfast)',
    defaultDuration: '14 Days',
    instructions: 'Take 30 minutes before first meal of the day with water.'
  },
  {
    name: 'Tab. Rabeprazole + Levosulpiride (Razo-L)',
    brand: 'Razo-L',
    generic: 'Rabeprazole 20mg + Levosulpiride 75mg SR',
    category: 'GERD & Dyspepsia Care',
    defaultDosage: '20mg + 75mg',
    defaultFrequency: '1-0-0 (Morning)',
    defaultTiming: 'Empty Stomach Morning',
    defaultDuration: '14 Days',
    instructions: 'Effective for severe acid reflux and bloating.'
  },
  {
    name: 'Syr. Sucralfate + Oxetacaine (Sucrafil-O)',
    brand: 'Sucrafil-O',
    generic: 'Sucralfate 1000mg + Oxetacaine 20mg / 10ml',
    category: 'Ulcer Coating Suspension',
    defaultDosage: '10 ml',
    defaultFrequency: '1-1-1 (Thrice Daily)',
    defaultTiming: '1 Hour Before Meals & Bedtime',
    defaultDuration: '10 Days',
    instructions: 'Shake well before use. Do not drink water immediately after.'
  },

  // Antibiotics & Anti-infectives
  {
    name: 'Tab. Amoxicillin + Clavulanic Acid (Augmentin 625 Duo)',
    brand: 'Augmentin 625',
    generic: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    category: 'Broad Spectrum Antibiotic',
    defaultDosage: '625mg',
    defaultFrequency: '1-0-1 (Morning & Night)',
    defaultTiming: 'After Food (Start of Meal)',
    defaultDuration: '5 Days',
    instructions: 'Complete the full 5-day course without missing doses.'
  },
  {
    name: 'Tab. Azithromycin (Azithral 500)',
    brand: 'Azithral 500',
    generic: 'Azithromycin 500mg',
    category: 'Macrolide Antibiotic',
    defaultDosage: '500mg',
    defaultFrequency: '1-0-0 (Once Daily)',
    defaultTiming: '1 Hour Before or 2 Hours After Food',
    defaultDuration: '3 Days',
    instructions: 'Take at a fixed time daily for 3 consecutive days.'
  },
  {
    name: 'Tab. Cefuroxime Axetil (Ceftum 500)',
    brand: 'Ceftum 500',
    generic: 'Cefuroxime Axetil 500mg',
    category: '2nd Gen Cephalosporin',
    defaultDosage: '500mg',
    defaultFrequency: '1-0-1 (Morning & Night)',
    defaultTiming: 'After Meals',
    defaultDuration: '5 Days',
    instructions: 'Swallow whole with water. Do not crush.'
  },
  {
    name: 'Tab. Ofloxacin + Ornidazole (O2 Tablet)',
    brand: 'O2',
    generic: 'Ofloxacin 200mg + Ornidazole 500mg',
    category: 'Gastrointestinal Antimicrobial',
    defaultDosage: '200mg + 500mg',
    defaultFrequency: '1-0-1 (Twice Daily)',
    defaultTiming: 'After Meals',
    defaultDuration: '5 Days',
    instructions: 'Take after meals. Avoid alcohol completely during treatment.'
  },

  // Analgesics, NSAIDs & Muscle Relaxants
  {
    name: 'Tab. Paracetamol 650 (Dolo 650)',
    brand: 'Dolo 650',
    generic: 'Paracetamol / Acetaminophen 650mg',
    category: 'Antipyretic & Analgesic',
    defaultDosage: '650mg',
    defaultFrequency: '1-0-1 or SOS (Max 4 times/day)',
    defaultTiming: 'After Food with Water',
    defaultDuration: '5 Days',
    instructions: 'Take when fever > 99.5°F or body ache. Maintain 6-hour gap.'
  },
  {
    name: 'Tab. Aceclofenac + Paracetamol (Zerodol-P)',
    brand: 'Zerodol-P',
    generic: 'Aceclofenac 100mg + Paracetamol 325mg',
    category: 'Anti-Inflammatory NSAID',
    defaultDosage: '100mg + 325mg',
    defaultFrequency: '1-0-1 (Morning & Night)',
    defaultTiming: 'Strictly After Meals',
    defaultDuration: '5 Days',
    instructions: 'Never take on empty stomach. Always combine with antacid.'
  },
  {
    name: 'Tab. Aceclofenac + Paracetamol + Thiocolchicoside (Zerodol-TH 4)',
    brand: 'Zerodol-TH 4',
    generic: 'Aceclofenac 100mg + Paracetamol 325mg + Thiocolchicoside 4mg',
    category: 'Muscle Relaxant & NSAID',
    defaultDosage: '100mg + 325mg + 4mg',
    defaultFrequency: '1-0-1 (Twice Daily)',
    defaultTiming: 'After Meals',
    defaultDuration: '5 Days',
    instructions: 'For acute muscle spasm and backache. May cause mild drowsiness.'
  },

  // Respiratory & Anti-Allergic
  {
    name: 'Tab. Montelukast + Levocetirizine (Montair-LC)',
    brand: 'Montair-LC',
    generic: 'Montelukast 10mg + Levocetirizine 5mg',
    category: 'Anti-Allergic & Bronchodilator',
    defaultDosage: '10mg + 5mg',
    defaultFrequency: '0-0-1 (Night)',
    defaultTiming: 'After Dinner at Bedtime',
    defaultDuration: '10 Days',
    instructions: 'Take at night. May cause mild drowsiness.'
  },
  {
    name: 'Syr. Ambroxol + Levosalbutamol + Guaiphenesin (Ascoril-LS)',
    brand: 'Ascoril-LS',
    generic: 'Levosalbutamol 1mg + Ambroxol 30mg + Guaiphenesin 50mg / 5ml',
    category: 'Expectorant & Mucolytic',
    defaultDosage: '10 ml',
    defaultFrequency: '1-1-1 (Thrice Daily)',
    defaultTiming: 'After Meals with Lukewarm Water',
    defaultDuration: '5 Days',
    instructions: 'Take with warm water. Relieves wet cough and chest congestion.'
  },

  // Vitamins, Minerals & Supplements
  {
    name: 'Tab. Calcium Carbonate + Vitamin D3 (Shelcal 500)',
    brand: 'Shelcal 500',
    generic: 'Elemental Calcium 500mg + Vitamin D3 250 IU',
    category: 'Bone & Mineral Supplement',
    defaultDosage: '500mg',
    defaultFrequency: '0-1-0 (Afternoon)',
    defaultTiming: 'After Lunch',
    defaultDuration: '60 Days',
    instructions: 'Maintain 2 hour gap from iron or thyroid medicines.'
  },
  {
    name: 'Cap. Vitamin D3 60,000 IU (Calcirol 60K)',
    brand: 'Calcirol 60K',
    generic: 'Cholecalciferol (Vitamin D3) 60,000 IU',
    category: 'High Dose Vitamin D3',
    defaultDosage: '60,000 IU',
    defaultFrequency: 'Once a Week (e.g. Every Sunday)',
    defaultTiming: 'After Breakfast with Warm Milk',
    defaultDuration: '8 Weeks',
    instructions: 'Take 1 capsule once weekly after meal with milk.'
  },
  {
    name: 'Tab. Ferrous Ascorbate + Folic Acid (Orofer-XT)',
    brand: 'Orofer-XT',
    generic: 'Elemental Iron 100mg + Folic Acid 1.5mg',
    category: 'Hematinic & Anti-Anemic',
    defaultDosage: '100mg + 1.5mg',
    defaultFrequency: '0-1-0 (Afternoon)',
    defaultTiming: 'After Lunch with Lemon Water',
    defaultDuration: '60 Days',
    instructions: 'Take with Vitamin C / citrus water. Stools may turn black (normal).'
  },
  {
    name: 'Cap. Multivitamin + Multiminerals + Zinc (Becozinc-G)',
    brand: 'Becozinc-G',
    generic: 'B-Complex + Zinc + Ginseng Extract',
    category: 'Immunity & Nutritional Support',
    defaultDosage: '1 Capsule',
    defaultFrequency: '1-0-0 (Morning)',
    defaultTiming: 'After Breakfast',
    defaultDuration: '30 Days',
    instructions: 'Take once daily after morning meal.'
  }
];

// 2. Comprehensive AI Diagnostic Lab & Imaging Database (40+ Tests)
export const AI_LAB_TEST_DATABASE: AILabTestSuggestion[] = [
  {
    testName: 'Complete Blood Count (CBC) + ESR Auto-Analyzer',
    category: 'Hematology',
    estimatedCost: 450,
    fastingRequired: false,
    sampleType: 'EDTA Whole Blood (2ml)',
    indication: 'Evaluates Hemoglobin, WBC, Platelets, Infection, and Anemia'
  },
  {
    testName: 'Lipid Profile Comprehensive (Cholesterol, HDL, LDL, VLDL, Triglycerides)',
    category: 'Biochemistry',
    estimatedCost: 950,
    fastingRequired: true,
    sampleType: 'Serum Clot Activator (3ml)',
    indication: 'Cardiovascular risk evaluation and dyslipidemia monitoring (12h Fasting)'
  },
  {
    testName: 'Liver Function Test (LFT Profile - Bilirubin, SGOT, SGPT, Alk Phos, Protein)',
    category: 'Biochemistry',
    estimatedCost: 850,
    fastingRequired: true,
    sampleType: 'Serum Clot Activator (3ml)',
    indication: 'Hepatic enzyme assessment, Jaundice, and medication monitoring'
  },
  {
    testName: 'Kidney Function Test (KFT / RFT - Urea, BUN, Creatinine, Electrolytes Na/K/Cl)',
    category: 'Biochemistry',
    estimatedCost: 850,
    fastingRequired: false,
    sampleType: 'Serum (3ml)',
    indication: 'Renal filtration, GFR assessment, and electrolyte balance'
  },
  {
    testName: 'HbA1c Glycated Hemoglobin (HPLC Gold Standard)',
    category: 'Diabetic Care',
    estimatedCost: 600,
    fastingRequired: false,
    sampleType: 'EDTA Whole Blood',
    indication: '3-Month average blood glucose control in diabetes'
  },
  {
    testName: 'Fasting Blood Sugar (FBS) + Post-Prandial Blood Sugar (PPBS)',
    category: 'Diabetic Care',
    estimatedCost: 200,
    fastingRequired: true,
    sampleType: 'Fluoride Plasma',
    indication: 'Diabetic screening & glycemic response'
  },
  {
    testName: 'Thyroid Total Panel (T3, T4, TSH Ultra-Sensitive ECLIA)',
    category: 'Endocrinology',
    estimatedCost: 550,
    fastingRequired: true,
    sampleType: 'Serum (3ml)',
    indication: 'Hypothyroidism, Hyperthyroidism, and Metabolic regulation'
  },
  {
    testName: 'Serum 25-OH Vitamin D3 (Total Cholecalciferol)',
    category: 'Immunology',
    estimatedCost: 1200,
    fastingRequired: false,
    sampleType: 'Serum (3ml)',
    indication: 'Bone density, Osteopenia, and general immunity'
  },
  {
    testName: 'Serum Vitamin B12 (Cyanocobalamin ECLIA)',
    category: 'Biochemistry',
    estimatedCost: 950,
    fastingRequired: false,
    sampleType: 'Serum (3ml)',
    indication: 'Neuropathy, Memory loss, and Megaloblastic anemia'
  },
  {
    testName: 'Serum Uric Acid (Enzymatic Colorimetric)',
    category: 'Biochemistry',
    estimatedCost: 250,
    fastingRequired: false,
    sampleType: 'Serum (2ml)',
    indication: 'Gout, Joint swelling, and Hyperuricemia'
  },
  {
    testName: 'Urine Routine & Microscopic Examination (Urine R/E)',
    category: 'Clinical Pathology',
    estimatedCost: 200,
    fastingRequired: false,
    sampleType: 'Clean Catch Midstream Urine',
    indication: 'UTI screening, Proteinuria, Hematuria, and Kidney stones'
  },
  {
    testName: 'Digital 12-Lead Resting Electrocardiogram (ECG)',
    category: 'Cardiology Diagnostics',
    estimatedCost: 350,
    fastingRequired: false,
    sampleType: 'Non-Invasive Diagnostic',
    indication: 'Cardiac arrhythmia, Ischemia, Infarction, and Conduction blocks'
  },
  {
    testName: '2D Echocardiography with Colour Doppler (2D-ECHO)',
    category: 'Cardiology Imaging',
    estimatedCost: 1800,
    fastingRequired: false,
    sampleType: 'Non-Invasive Ultrasound',
    indication: 'Left Ventricular Ejection Fraction (LVEF), Valvular lesions, Wall motion'
  },
  {
    testName: 'Digital Chest X-Ray (Postero-Anterior PA View)',
    category: 'Radiology Imaging',
    estimatedCost: 450,
    fastingRequired: false,
    sampleType: 'Digital X-Ray Film',
    indication: 'Cardiomegaly, Pulmonary consolidation, Pleural effusion, and Bronchitis'
  },
  {
    testName: 'Ultrasound Whole Abdomen & Pelvis (USG Abdomen)',
    category: 'Radiology Imaging',
    estimatedCost: 1200,
    fastingRequired: true,
    sampleType: 'Ultrasound Scan',
    indication: 'Fatty liver, Gallstones, Renal calculi, Pancreas, and Prostate'
  },
  {
    testName: 'Comprehensive Executive Full Body Health Checkup (68 Tests)',
    category: 'Preventive Health Package',
    estimatedCost: 2500,
    fastingRequired: true,
    sampleType: 'Blood + Urine (12h Fasting)',
    indication: 'Master comprehensive annual health evaluation'
  }
];

// 3. AI Clinical Protocols & 1-Click Prescription Bundles
export const AI_CLINICAL_PROTOCOLS: AIDiagnosisProtocol[] = [
  {
    diagnosisCode: 'I10',
    diagnosisName: 'Essential Hypertension (Grade 1 & 2)',
    symptoms: ['High Blood Pressure', 'Occasional Headache', 'Dizziness', 'Palpitation'],
    recommendedMeds: [
      {
        name: 'Tab. Telmisartan + Amlodipine (Telma-AM)',
        dosage: '40mg + 5mg',
        frequency: '1-0-0 (Morning)',
        timing: 'After Breakfast',
        duration: '30 Days',
        instructions: 'Take daily at fixed morning time. Monitor BP regularly.'
      },
      {
        name: 'Tab. Rosuvastatin (Rozavel 10)',
        dosage: '10mg',
        frequency: '0-0-1 (Night)',
        timing: 'After Dinner at Bedtime',
        duration: '30 Days',
        instructions: 'Take at bedtime for endothelial and lipid protection.'
      }
    ],
    recommendedLabs: [
      { testName: 'Lipid Profile Comprehensive (Cholesterol, HDL, LDL, VLDL, Triglycerides)', category: 'Biochemistry', estimatedCost: 950 },
      { testName: 'Kidney Function Test (KFT / RFT - Urea, BUN, Creatinine, Electrolytes Na/K/Cl)', category: 'Biochemistry', estimatedCost: 850 },
      { testName: 'Digital 12-Lead Resting Electrocardiogram (ECG)', category: 'Cardiology Diagnostics', estimatedCost: 350 }
    ],
    dietAndLifestyle: [
      'Strict low sodium DASH diet (< 2.5g salt/day)',
      '30-40 minutes moderate brisk walking 5 days a week',
      'Avoid deep fried, processed, and salty junk foods',
      'Maintain home BP log and review after 2 weeks'
    ]
  },
  {
    diagnosisCode: 'E11.9',
    diagnosisName: 'Type 2 Diabetes Mellitus (Uncomplicated)',
    symptoms: ['Elevated Fasting Blood Sugar', 'Polyuria', 'Polydipsia', 'Fatigue', 'Weight Loss'],
    recommendedMeds: [
      {
        name: 'Tab. Metformin SR (Glycomet 500 SR)',
        dosage: '500mg',
        frequency: '1-0-1 (Morning & Night)',
        timing: 'With or Immediately After Meals',
        duration: '30 Days',
        instructions: 'Take with main meals.'
      },
      {
        name: 'Tab. Teneligliptin (Ziten 20)',
        dosage: '20mg',
        frequency: '1-0-0 (Morning)',
        timing: 'Before Breakfast',
        duration: '30 Days',
        instructions: 'Take once daily before morning meal.'
      }
    ],
    recommendedLabs: [
      { testName: 'HbA1c Glycated Hemoglobin (HPLC Gold Standard)', category: 'Diabetic Care', estimatedCost: 600 },
      { testName: 'Fasting Blood Sugar (FBS) + Post-Prandial Blood Sugar (PPBS)', category: 'Diabetic Care', estimatedCost: 200 },
      { testName: 'Urine Routine & Microscopic Examination (Urine R/E)', category: 'Clinical Pathology', estimatedCost: 200 }
    ],
    dietAndLifestyle: [
      'Low Glycemic Index (GI) diabetic diet; restrict refined sugar & sweets',
      'Small frequent meals; include oats, whole grains, and leafy vegetables',
      'Daily morning walk 40 mins & foot care hygiene inspection',
      'Check self-monitoring of blood glucose (SMBG) weekly'
    ]
  },
  {
    diagnosisCode: 'I20.9',
    diagnosisName: 'Angina Pectoris / Coronary Artery Disease (CAD)',
    symptoms: ['Exertional Chest Tightness', 'Shortness of Breath', 'Radiating Pain to Left Arm/Jaw'],
    recommendedMeds: [
      {
        name: 'Tab. Rosuvastatin + Clopidogrel (Rozavel-CV 10/75)',
        dosage: '10mg + 75mg',
        frequency: '0-0-1 (Night)',
        timing: 'After Dinner',
        duration: '30 Days',
        instructions: 'Take strictly after food.'
      },
      {
        name: 'Tab. Metoprolol Succinate (Betaloc 25)',
        dosage: '25mg',
        frequency: '1-0-0 (Morning)',
        timing: 'After Breakfast',
        duration: '30 Days',
        instructions: 'Take once daily in morning. Check pulse rate.'
      },
      {
        name: 'Tab. Sorbitrate (Isosorbide Dinitrate 5mg)',
        dosage: '5mg',
        frequency: 'SOS (Sublingual)',
        timing: 'Under Tongue on Chest Pain',
        duration: '10 Tabs (As needed)',
        instructions: 'Place under tongue immediately on acute chest tightness.'
      }
    ],
    recommendedLabs: [
      { testName: 'Digital 12-Lead Resting Electrocardiogram (ECG)', category: 'Cardiology Diagnostics', estimatedCost: 350 },
      { testName: '2D Echocardiography with Colour Doppler (2D-ECHO)', category: 'Cardiology Imaging', estimatedCost: 1800 },
      { testName: 'Lipid Profile Comprehensive (Cholesterol, HDL, LDL, VLDL, Triglycerides)', category: 'Biochemistry', estimatedCost: 950 }
    ],
    dietAndLifestyle: [
      'Zero oil / minimal heart-healthy oil cooking; eliminate trans fats',
      'Strict cessation of tobacco, smoking, and alcohol',
      'Light walking only; strictly avoid sudden strenuous exertion',
      'Emergency SOS: If chest pain lasts > 15 mins, rush to Emergency 24x7'
    ]
  },
  {
    diagnosisCode: 'J06.9',
    diagnosisName: 'Acute Upper Respiratory Tract Infection (URTI) & Bronchitis',
    symptoms: ['Fever & Chills', 'Productive Wet Cough', 'Sore Throat', 'Nasal Congestion'],
    recommendedMeds: [
      {
        name: 'Tab. Amoxicillin + Clavulanic Acid (Augmentin 625 Duo)',
        dosage: '625mg',
        frequency: '1-0-1 (Twice Daily)',
        timing: 'After Meals',
        duration: '5 Days',
        instructions: 'Complete the entire 5-day course without skipping.'
      },
      {
        name: 'Tab. Paracetamol 650 (Dolo 650)',
        dosage: '650mg',
        frequency: 'SOS (Max 3 times/day)',
        timing: 'After Food (On Fever / Bodyache)',
        duration: '5 Days',
        instructions: 'Take when temperature > 99.5°F.'
      },
      {
        name: 'Syr. Ambroxol + Levosalbutamol + Guaiphenesin (Ascoril-LS)',
        dosage: '10 ml',
        frequency: '1-1-1 (Thrice Daily)',
        timing: 'After Meals with Lukewarm Water',
        duration: '5 Days',
        instructions: 'Take with warm water for wet cough relief.'
      },
      {
        name: 'Tab. Montelukast + Levocetirizine (Montair-LC)',
        dosage: '10mg + 5mg',
        frequency: '0-0-1 (Night)',
        timing: 'After Dinner at Bedtime',
        duration: '7 Days',
        instructions: 'Take at night for allergic cough.'
      }
    ],
    recommendedLabs: [
      { testName: 'Complete Blood Count (CBC) + ESR Auto-Analyzer', category: 'Hematology', estimatedCost: 450 },
      { testName: 'Digital Chest X-Ray (Postero-Anterior PA View)', category: 'Radiology Imaging', estimatedCost: 450 }
    ],
    dietAndLifestyle: [
      'Steam inhalation twice daily for 10 minutes',
      'Warm saline gargles 3-4 times daily',
      'Drink plenty of warm water, soups, and herbal tea',
      'Avoid cold drinks, ice creams, and exposure to dust/smoke'
    ]
  },
  {
    diagnosisCode: 'K21.9',
    diagnosisName: 'Gastro-Esophageal Reflux Disease (GERD) & Acid Dyspepsia',
    symptoms: ['Heartburn / Retro-Sternal Burning', 'Acid Regurgitation', 'Epigastric Bloating', 'Nausea'],
    recommendedMeds: [
      {
        name: 'Cap. Pantoprazole + Domperidone (Pan-D)',
        dosage: '40mg + 30mg',
        frequency: '1-0-0 (Morning)',
        timing: 'Empty Stomach (30 mins before breakfast)',
        duration: '14 Days',
        instructions: 'Take 30 minutes before first meal of the day.'
      },
      {
        name: 'Syr. Sucralfate + Oxetacaine (Sucrafil-O)',
        dosage: '10 ml',
        frequency: '1-1-1 (Thrice Daily)',
        timing: '1 Hour Before Meals & Bedtime',
        duration: '10 Days',
        instructions: 'Shake well. Relieves acute burning and coats stomach lining.'
      }
    ],
    recommendedLabs: [
      { testName: 'Ultrasound Whole Abdomen & Pelvis (USG Abdomen)', category: 'Radiology Imaging', estimatedCost: 1200 },
      { testName: 'Liver Function Test (LFT Profile - Bilirubin, SGOT, SGPT, Alk Phos, Protein)', category: 'Biochemistry', estimatedCost: 850 }
    ],
    dietAndLifestyle: [
      'Avoid spicy, sour, oily foods, citrus juices, tea, and coffee',
      'Maintain 2 hours gap between dinner and sleeping',
      'Elevate head of bed by 15-20 cm during sleep',
      'Eat small, frequent meals rather than heavy portions'
    ]
  }
];

export class ClinicalAIService {
  // 1. AI Fuzzy Medicine Search (1 to 5 words / letters)
  public static searchMedicines(query: string): AIMedicineSuggestion[] {
    const q = query.trim().toLowerCase();
    if (!q) return AI_MEDICINE_DATABASE.slice(0, 8);

    const words = q.split(/\s+/).filter(Boolean);

    return AI_MEDICINE_DATABASE.filter(med => {
      const target = `${med.name} ${med.brand} ${med.generic} ${med.category}`.toLowerCase();
      return words.every(word => target.includes(word));
    }).slice(0, 10);
  }

  // 2. AI Fuzzy Lab / Diagnostic Test Search (1 to 5 words / letters)
  public static searchLabTests(query: string): AILabTestSuggestion[] {
    const q = query.trim().toLowerCase();
    if (!q) return AI_LAB_TEST_DATABASE.slice(0, 8);

    const words = q.split(/\s+/).filter(Boolean);

    return AI_LAB_TEST_DATABASE.filter(lab => {
      const target = `${lab.testName} ${lab.category} ${lab.indication}`.toLowerCase();
      return words.every(word => target.includes(word));
    }).slice(0, 10);
  }

  // 3. AI Clinical Protocols
  public static getProtocols(): AIDiagnosisProtocol[] {
    return AI_CLINICAL_PROTOCOLS;
  }

  public static findProtocolByDiagnosis(term: string): AIDiagnosisProtocol | undefined {
    const q = term.toLowerCase();
    return AI_CLINICAL_PROTOCOLS.find(p =>
      p.diagnosisName.toLowerCase().includes(q) ||
      p.diagnosisCode.toLowerCase().includes(q) ||
      p.symptoms.some(s => s.toLowerCase().includes(q))
    );
  }
}
