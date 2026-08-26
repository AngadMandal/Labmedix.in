import { LabTestItem, HealthPackageItem, CatalogService } from './catalogService';

export interface AISymptomTestItem {
  name: string;
  priority: 'must_do_urgent' | 'secondary_supporting' | 'confirmatory_special';
  sampleTube: string;
  fasting: boolean;
  indication: string;
}

export interface AISymptomMapping {
  symptomKey: string;
  label: string;
  icon: string;
  color: string;
  organSystem: string;
  keywords: string[];
  recommendedTestNames: string[];
  detailedTests: AISymptomTestItem[];
  sampleTubesRequired: string[];
  fastingGuidelines: string;
  clinicalRationale: string;
  suggestedPackageName: string;
  category: string;
}

export const AI_SYMPTOM_KNOWLEDGE_BASE: AISymptomMapping[] = [
  {
    symptomKey: 'fever_infection',
    label: 'Fever, Chills & Acute Infection',
    icon: 'Thermometer',
    color: 'rose',
    organSystem: 'Immune & Hematologic System',
    keywords: ['fever', 'chills', 'temperature', 'dengue', 'malaria', 'typhoid', 'body ache', 'headache', 'shivering', 'sweating', 'sepsis'],
    recommendedTestNames: [
      'Complete Blood Count (CBC) with ESR & Platelets',
      'Platelet Count',
      'DENGUE NS1 ANTIGEN',
      'DENGUE IgM & IgG Antibody',
      'Malaria Antigen Serology (P.Vivax/Falciparum)',
      'TYPHI DOT IgG IgM',
      'Widal (Slide Agglutination)',
      'CRP (C-Reactive Protein)-Quantitative',
      'Blood Culture & Sensitivity',
      'Urine Routine Examination'
    ],
    detailedTests: [
      { name: 'Complete Blood Count (CBC) with ESR & Platelets', priority: 'must_do_urgent', sampleTube: 'EDTA Lavender (2ml)', fasting: false, indication: 'Detects Leukocytosis, Neutrophilia, and Dengue thrombocytopenia.' },
      { name: 'Platelet Count', priority: 'must_do_urgent', sampleTube: 'EDTA Lavender (2ml)', fasting: false, indication: 'Critical for hemorrhagic risk in Dengue / Viral fevers.' },
      { name: 'DENGUE NS1 ANTIGEN', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Early Dengue virus detection (Day 1 to 5 of fever).' },
      { name: 'DENGUE IgM & IgG Antibody', priority: 'secondary_supporting', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Subacute Dengue serology from Day 5 onwards.' },
      { name: 'Malaria Antigen Serology (P.Vivax/Falciparum)', priority: 'must_do_urgent', sampleTube: 'EDTA / Whole Blood', fasting: false, indication: 'Rapid detection of Plasmodium falciparum / vivax.' },
      { name: 'TYPHI DOT IgG IgM', priority: 'secondary_supporting', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Early Typhoid / Enteric fever detection.' },
      { name: 'Widal (Slide Agglutination)', priority: 'secondary_supporting', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Confirmatory Salmonella Typhi and Paratyphi titers.' },
      { name: 'CRP (C-Reactive Protein)-Quantitative', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Quantitative measure of systemic bacterial/viral inflammation.' },
      { name: 'Blood Culture & Sensitivity', priority: 'confirmatory_special', sampleTube: 'Blood Culture Bottles (10ml)', fasting: false, indication: 'Gold standard for septicemia and antibiotic susceptibility.' },
      { name: 'Urine Routine Examination', priority: 'must_do_urgent', sampleTube: 'Sterile Urine Container', fasting: false, indication: 'Screens for urinary tract infection (UTI) causing fever.' }
    ],
    sampleTubesRequired: ['EDTA Lavender Top (CBC, Platelets, Malaria)', 'SST Gold Top (Dengue, Typhidot, Widal, CRP)', 'Sterile Container (Urine Routine, Blood Culture)'],
    fastingGuidelines: 'Routine non-fasting sample. Drink adequate water before blood collection.',
    clinicalRationale: 'Evaluates bacterial, vector-borne (Dengue/Malaria), or enteric (Typhoid) etiology, monitors platelet crash, and quantifies systemic inflammation.',
    suggestedPackageName: 'Acute Fever & Viral Vector Infection Shield',
    category: 'Infection'
  },
  {
    symptomKey: 'cardiac_chest_pain',
    label: 'Chest Pain, Palpitations & Heart Risk',
    icon: 'HeartPulse',
    color: 'red',
    organSystem: 'Cardiovascular & Vascular System',
    keywords: ['chest pain', 'heart', 'palpitations', 'cardiac', 'blood pressure', 'hypertension', 'breathlessness', 'angina', 'cholesterol'],
    recommendedTestNames: [
      'Troponin - I',
      'CPK - MB',
      'Lipid Profile',
      'C.R.P. - HIGH SENSITIVE (Hs-CRP)',
      'D- DIMER',
      'B-Type Natriuretic Peptide (BNP) - Miscellaneous',
      'Serum Homocysteine (Cardio Marker)',
      'Electrolytes (Na+ K+ Cl-),Serum',
      'Blood Glucose Fasting'
    ],
    detailedTests: [
      { name: 'Troponin - I', priority: 'must_do_urgent', sampleTube: 'Serum Gold / Heparin', fasting: false, indication: 'Gold standard biomarker for Acute Myocardial Infarction (Heart Attack).' },
      { name: 'CPK - MB', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Cardiac-specific isoenzyme for acute myocardial necrosis.' },
      { name: 'Lipid Profile', priority: 'secondary_supporting', sampleTube: 'Serum Gold (3ml)', fasting: true, indication: 'Total Cholesterol, HDL, LDL, VLDL & Triglycerides atherogenic index.' },
      { name: 'C.R.P. - HIGH SENSITIVE (Hs-CRP)', priority: 'secondary_supporting', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Coronary artery micro-vascular inflammation and plaque rupture risk.' },
      { name: 'D- DIMER', priority: 'must_do_urgent', sampleTube: 'Citrate Blue (2ml)', fasting: false, indication: 'Rules out Pulmonary Embolism (PE) and Deep Vein Thrombosis.' },
      { name: 'B-Type Natriuretic Peptide (BNP) - Miscellaneous', priority: 'confirmatory_special', sampleTube: 'EDTA Lavender (2ml)', fasting: false, indication: 'Detects Congestive Heart Failure (CHF) and ventricular wall stress.' },
      { name: 'Serum Homocysteine (Cardio Marker)', priority: 'confirmatory_special', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Independent biomarker for premature arterial thrombosis.' },
      { name: 'Electrolytes (Na+ K+ Cl-),Serum', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Rules out Potassium-induced cardiac arrhythmias and palpitations.' },
      { name: 'Blood Glucose Fasting', priority: 'secondary_supporting', sampleTube: 'Fluoride Gray (2ml)', fasting: true, indication: 'Screens for silent diabetic coronary artery disease.' }
    ],
    sampleTubesRequired: ['SST Gold Top (Troponin-I, CPK-MB, Lipid, hs-CRP, Electrolytes)', 'Citrate Blue Top (D-Dimer Coagulation)', 'EDTA Lavender (BNP)', 'Fluoride Gray (Fasting Sugar)'],
    fastingGuidelines: '⚠️ 10-12 Hours overnight fasting required for Lipid Profile and Fasting Glucose. Troponin-I and CPK-MB are STAT emergency tests.',
    clinicalRationale: 'Detects acute myocardial infarction, evaluates coronary plaque rupture risk, rules out pulmonary embolism, and assesses heart strain.',
    suggestedPackageName: 'Comprehensive Cardiovascular & Heart Risk Panel',
    category: 'Cardiac'
  },
  {
    symptomKey: 'diabetes_glycemic',
    label: 'Diabetes, Thirst, Fatigue & High Sugar',
    icon: 'Activity',
    color: 'amber',
    organSystem: 'Endocrine & Metabolic System',
    keywords: ['diabetes', 'sugar', 'glucose', 'thirst', 'frequent urination', 'hba1c', 'weight loss', 'insulin', 'blurred vision', 'diabetic'],
    recommendedTestNames: [
      'HbA1c (Glycosylated Haemoglobin)',
      'Blood Glucose Fasting',
      'Blood Glucose Post Prandial (PP)',
      'Microalbumin Creatinine Ratio',
      'Creatinine with eGFR(Estimated Glomerular Filtration Rate)',
      'Lipid Profile',
      'C-Peptide',
      'Insulin (Fasting)'
    ],
    detailedTests: [
      { name: 'HbA1c (Glycosylated Haemoglobin)', priority: 'must_do_urgent', sampleTube: 'EDTA Lavender (2ml)', fasting: false, indication: '3-Month average glycemic control (HPLC Gold Standard).' },
      { name: 'Blood Glucose Fasting', priority: 'must_do_urgent', sampleTube: 'Fluoride Gray (2ml)', fasting: true, indication: 'Baseline 8-hour fasting blood glucose for diabetic diagnosis.' },
      { name: 'Blood Glucose Post Prandial (PP)', priority: 'must_do_urgent', sampleTube: 'Fluoride Gray (2ml)', fasting: false, indication: '2-Hour post-prandial glycemic surge and insulin response.' },
      { name: 'Microalbumin Creatinine Ratio', priority: 'must_do_urgent', sampleTube: 'Spot Urine (20ml)', fasting: false, indication: 'Detects early Diabetic Nephropathy before kidney damage manifests.' },
      { name: 'Creatinine with eGFR(Estimated Glomerular Filtration Rate)', priority: 'secondary_supporting', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Assesses renal filtration staging in chronic diabetes.' },
      { name: 'Lipid Profile', priority: 'secondary_supporting', sampleTube: 'Serum Gold (3ml)', fasting: true, indication: 'Diabetic dyslipidemia (high triglycerides, low HDL).' },
      { name: 'C-Peptide', priority: 'confirmatory_special', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Measures endogenous pancreatic beta-cell insulin secretory reserve.' },
      { name: 'Insulin (Fasting)', priority: 'confirmatory_special', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Detects Insulin Resistance (HOMA-IR) in Type 2 Diabetes.' }
    ],
    sampleTubesRequired: ['Fluoride Gray Top (FBS & PPBS Glucose)', 'EDTA Lavender Top (HbA1c)', 'SST Gold Top (Lipid Profile, Creatinine, Insulin, C-Peptide)', 'Sterile Container (Urine Microalbumin/Creatinine)'],
    fastingGuidelines: '⚠️ 8-10 Hours overnight fasting for FBS, Lipid, and Insulin. Exactly 2 hours after breakfast for PPBS.',
    clinicalRationale: 'Provides a complete 3-month glycemic history, acute sugar spikes, pancreatic beta-cell reserve, and screens for early diabetic kidney damage.',
    suggestedPackageName: 'Advanced Diabetic & Nephro-Shield Profile',
    category: 'Diabetes'
  },
  {
    symptomKey: 'jaundice_liver',
    label: 'Jaundice, Yellow Eyes & Liver Dysfunction',
    icon: 'Eye',
    color: 'yellow',
    organSystem: 'Hepato-Biliary System',
    keywords: ['jaundice', 'yellow eyes', 'dark urine', 'liver', 'bilirubin', 'alcohol', 'hepatitis', 'sgpt', 'sgot', 'fatty liver', 'cirrhosis'],
    recommendedTestNames: [
      'Liver Function Test',
      'LIVER FUNCTION TEST WITH GGT',
      'Bilirubin Total, Direct Indirect',
      'SGPT/ALT (Alanine Amino-transferase)',
      'SGOT/AST (Aspartate Amino-transferase)',
      'HBSAG QUANTITATIVE',
      'HCV',
      'HEPATITIS A VIRUS IGM',
      'Anti HEV IgM',
      'Alkaline Phosphatase'
    ],
    detailedTests: [
      { name: 'Liver Function Test', priority: 'must_do_urgent', sampleTube: 'Serum Gold (3ml)', fasting: true, indication: 'Total/Direct Bilirubin, SGOT, SGPT, ALP, Total Protein, Albumin, Globulin & A:G Ratio.' },
      { name: 'LIVER FUNCTION TEST WITH GGT', priority: 'must_do_urgent', sampleTube: 'Serum Gold (3ml)', fasting: true, indication: 'Adds Gamma-Glutamyl Transferase to evaluate alcohol-induced liver injury and biliary obstruction.' },
      { name: 'Bilirubin Total, Direct Indirect', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Differentiates pre-hepatic (hemolytic), hepatic, and post-hepatic (obstructive) jaundice.' },
      { name: 'SGPT/ALT (Alanine Amino-transferase)', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Most specific marker for acute hepatocellular injury and viral hepatitis.' },
      { name: 'SGOT/AST (Aspartate Amino-transferase)', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Evaluates AST/ALT De Ritis ratio for alcoholic hepatitis vs viral hepatitis.' },
      { name: 'HBSAG QUANTITATIVE', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Screens for Hepatitis B viral surface antigen in acute/chronic hepatitis.' },
      { name: 'HCV', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Detects Hepatitis C viral infection causing chronic liver fibrosis.' },
      { name: 'HEPATITIS A VIRUS IGM', priority: 'secondary_supporting', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Screens for water-borne Acute Hepatitis A in young patients.' },
      { name: 'Anti HEV IgM', priority: 'secondary_supporting', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Acute Hepatitis E detection, especially critical in pregnancy.' },
      { name: 'Alkaline Phosphatase', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Biliary tree obstruction, gallstones, and cholestatic jaundice.' }
    ],
    sampleTubesRequired: ['SST Gold Top (LFT, GGT, Bilirubin, SGOT, SGPT, ALP, Hepatitis Serology A/B/C/E)'],
    fastingGuidelines: '⚠️ 8-10 Hours overnight fasting recommended. Avoid alcohol 48 hours prior to test.',
    clinicalRationale: 'Pinpoints hepatocellular necrosis, biliary obstruction, viral hepatitis etiology (A, B, C, E), and liver synthesis capability.',
    suggestedPackageName: 'Complete Hepatic Health & Viral Hepatitis Profile',
    category: 'Liver'
  },
  {
    symptomKey: 'kidney_renal_stone',
    label: 'Kidney Health, Swelling & Flank Pain',
    icon: 'Layers',
    color: 'blue',
    organSystem: 'Renal & Urological System',
    keywords: ['kidney', 'creatinine', 'urea', 'swelling', 'edema', 'flank pain', 'renal', 'stone', 'blood in urine', 'nephropathy', 'uric acid'],
    recommendedTestNames: [
      'Creatinine Serum',
      'Creatinine with eGFR(Estimated Glomerular Filtration Rate)',
      'Urea Serum',
      'Blood Urea Nitrogen (BUN)',
      'Uric Acid, Serum',
      'Electrolytes (Na+ K+ Cl-),Serum',
      'Microalbumin Creatinine Ratio',
      'URINE ANALYSIS REPORT',
      'Urine Culture & Sensitivity'
    ],
    detailedTests: [
      { name: 'Creatinine Serum', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Primary diagnostic benchmark for glomerular filtration and renal clearance.' },
      { name: 'Creatinine with eGFR(Estimated Glomerular Filtration Rate)', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'CKD staging and renal functional capacity calculation.' },
      { name: 'Urea Serum', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Measures nitrogenous waste accumulation in uremia and renal failure.' },
      { name: 'Blood Urea Nitrogen (BUN)', priority: 'secondary_supporting', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Calculates BUN/Creatinine ratio to differentiate pre-renal dehydration from intrinsic renal disease.' },
      { name: 'Uric Acid, Serum', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Hyperuricemia, gouty arthritis, and uric acid renal calculi formation.' },
      { name: 'Electrolytes (Na+ K+ Cl-),Serum', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Critical for Hyperkalemia (high potassium) monitoring in renal dysfunction.' },
      { name: 'Microalbumin Creatinine Ratio', priority: 'must_do_urgent', sampleTube: 'Spot Urine (20ml)', fasting: false, indication: 'Detects microscopic glomerular protein leakage in early nephropathy.' },
      { name: 'URINE ANALYSIS REPORT', priority: 'must_do_urgent', sampleTube: 'Sterile Urine Container', fasting: false, indication: 'Detects microscopic hematuria (blood in urine), proteinuria, pus cells, and casts.' },
      { name: 'Urine Culture & Sensitivity', priority: 'confirmatory_special', sampleTube: 'Sterile Urine Container (Midstream)', fasting: false, indication: 'Identifies uropathogens in pyelonephritis and urinary tract infection.' }
    ],
    sampleTubesRequired: ['SST Gold Top (Creatinine, Urea, BUN, Uric Acid, Electrolytes)', 'Sterile Urine Container (Urine Routine, Microalbumin/Creatinine, Culture)'],
    fastingGuidelines: 'Routine non-fasting sample. Collect clean-catch midstream urine in sterile container.',
    clinicalRationale: 'Calculates true glomerular filtration rate, detects nitrogenous metabolite retention, checks electrolyte safety, and screens for proteinuria.',
    suggestedPackageName: 'Renal Function & Uro-Health Master Panel',
    category: 'Kidney'
  },
  {
    symptomKey: 'fatigue_anemia',
    label: 'Chronic Fatigue, Weakness & Pale Skin',
    icon: 'Zap',
    color: 'purple',
    organSystem: 'Hematology & Nutritional Reserve',
    keywords: ['fatigue', 'weakness', 'tired', 'dizzy', 'pale', 'anemia', 'low blood', 'hair loss', 'iron', 'vitamin b12', 'vitamin d'],
    recommendedTestNames: [
      'Complete Haemogram (CBC + ESR + PS)',
      'Haemoglobin (Hb)',
      'Iron Studies',
      'Ferritin',
      'Vitamin B12',
      'VITAMIN D3 25 Hydroxy',
      'Thyroid Profile Total',
      'Peripheral Blood Smear',
      'Reticulocyte Count'
    ],
    detailedTests: [
      { name: 'Complete Haemogram (CBC + ESR + PS)', priority: 'must_do_urgent', sampleTube: 'EDTA Lavender (2ml)', fasting: false, indication: 'Evaluates Hemoglobin, MCV, MCH, MCHC, RDW, and WBC count for microcytic vs macrocytic anemia.' },
      { name: 'Haemoglobin (Hb)', priority: 'must_do_urgent', sampleTube: 'EDTA Lavender (2ml)', fasting: false, indication: 'Quantitative blood oxygen-carrying capacity benchmark.' },
      { name: 'Iron Studies', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Serum Iron, Total Iron Binding Capacity (TIBC), and % Transferrin Saturation.' },
      { name: 'Ferritin', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'True cellular bone marrow iron storage level.' },
      { name: 'Vitamin B12', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Neuropathy, cognitive sluggishness, and megaloblastic macrocytic anemia.' },
      { name: 'VITAMIN D3 25 Hydroxy', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Bone mineral density, muscle fatigue, and immune regulation.' },
      { name: 'Thyroid Profile Total', priority: 'secondary_supporting', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Screens for subclinical hypothyroidism causing chronic lethargy.' },
      { name: 'Peripheral Blood Smear', priority: 'secondary_supporting', sampleTube: 'EDTA Lavender (2ml)', fasting: false, indication: 'Microscopic morphology of RBCs (Hypochromia, Microcytes, Target cells).' },
      { name: 'Reticulocyte Count', priority: 'confirmatory_special', sampleTube: 'EDTA Lavender (2ml)', fasting: false, indication: 'Bone marrow erythropoietic response in anemia.' }
    ],
    sampleTubesRequired: ['EDTA Lavender Top (CBC, Peripheral Smear, Reticulocyte)', 'SST Gold Top (Iron Studies, Ferritin, Vitamin B12, Vitamin D3, Thyroid Profile)'],
    fastingGuidelines: '⚠️ 8-10 Hours overnight fasting recommended for Iron Studies and Thyroid Profile.',
    clinicalRationale: 'Screens for nutritional deficiencies (Iron, B12, D3), microcytic/macrocytic anemia, and subclinical hypothyroidism causing chronic fatigue.',
    suggestedPackageName: 'Vital Energy, Anemia & Micronutrient Screen',
    category: 'Vitamins'
  },
  {
    symptomKey: 'joint_arthritis_autoimmune',
    label: 'Joint Pain, Swelling & Autoimmune Signs',
    icon: 'Shield',
    color: 'indigo',
    organSystem: 'Musculoskeletal & Autoimmune System',
    keywords: ['joint pain', 'arthritis', 'stiffness', 'swelling', 'knee pain', 'rheumatoid', 'lupus', 'ana', 'autoimmune', 'uric acid', 'gout'],
    recommendedTestNames: [
      'RA Factor Quantitative',
      'Anti CCP (Anti Cyclic Citrullinated Peptide)',
      'Uric Acid, Serum',
      'ANA (Anti Nuclear Antibody)',
      'ANA IFA (HEP 2)',
      'Anti ds DNA Antibody',
      'HLA B-27 by Real Time PCR',
      'ESR (Erythrocyte Sedimentation Rate)-Westergrens Method',
      'CRP (C-Reactive Protein)-Quantitative',
      'Calcium'
    ],
    detailedTests: [
      { name: 'RA Factor Quantitative', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Quantitative Rheumatoid Factor for rheumatoid arthritis.' },
      { name: 'Anti CCP (Anti Cyclic Citrullinated Peptide)', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'High-specificity (98%) biomarker for early erosive Rheumatoid Arthritis.' },
      { name: 'Uric Acid, Serum', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Detects hyperuricemia and crystal-induced acute Gouty Arthritis.' },
      { name: 'ANA (Anti Nuclear Antibody)', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Primary screen for Systemic Lupus Erythematosus (SLE) and systemic autoimmune diseases.' },
      { name: 'ANA IFA (HEP 2)', priority: 'confirmatory_special', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Gold-standard immunofluorescence pattern analysis (Homogeneous, Speckled, Nucleolar).' },
      { name: 'Anti ds DNA Antibody', priority: 'confirmatory_special', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Highly specific biomarker for Lupus Nephritis and active SLE disease.' },
      { name: 'HLA B-27 by Real Time PCR', priority: 'confirmatory_special', sampleTube: 'EDTA Lavender (3ml)', fasting: false, indication: 'Genetic PCR assay for Ankylosing Spondylitis and seronegative spondyloarthropathies.' },
      { name: 'ESR (Erythrocyte Sedimentation Rate)-Westergrens Method', priority: 'must_do_urgent', sampleTube: 'EDTA Lavender (2ml)', fasting: false, indication: 'Monitors ongoing joint synovial inflammation and flare-ups.' },
      { name: 'CRP (C-Reactive Protein)-Quantitative', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Acute phase inflammatory reactant in active arthritis.' },
      { name: 'Calcium', priority: 'secondary_supporting', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Screens for osteopenia, osteoporosis, and mineral balance in joint pain.' }
    ],
    sampleTubesRequired: ['SST Gold Top (RA Factor, Anti-CCP, Uric Acid, ANA, Anti-dsDNA, CRP, Calcium)', 'EDTA Lavender Top (ESR, HLA-B27 PCR)'],
    fastingGuidelines: 'Routine non-fasting sample.',
    clinicalRationale: 'Differentiates inflammatory rheumatoid arthritis from metabolic gout, systemic lupus (SLE), and HLA-B27 spondyloarthritis.',
    suggestedPackageName: 'Autoimmune & Bone-Joint Rheumatology Panel',
    category: 'Immunology'
  },
  {
    symptomKey: 'thyroid_hormonal',
    label: 'Thyroid, Weight Fluctuations & Mood',
    icon: 'Sparkles',
    color: 'teal',
    organSystem: 'Endocrine & Thyroid Gland',
    keywords: ['thyroid', 'tsh', 'weight gain', 'weight loss', 'cold intolerance', 'heat intolerance', 'hair thinning', 'goiter', 'hormone'],
    recommendedTestNames: [
      'Thyroid Profile Total',
      'FREE THYROID PROFILE (FT3, FT4, TSH)',
      'TSH (Thyroid Stimulating Hormone)',
      'Anti - Thyroid Peroxidase Antibody',
      'ANTI THYROGLOBULIN ANTIBODY',
      'Lipid Profile'
    ],
    detailedTests: [
      { name: 'Thyroid Profile Total', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Total Triiodothyronine (T3), Total Thyroxine (T4), and Ultrasensitive TSH.' },
      { name: 'FREE THYROID PROFILE (FT3, FT4, TSH)', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Free, biologically active unbound fractions of T3 and T4 unaffected by protein binding.' },
      { name: 'TSH (Thyroid Stimulating Hormone)', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'First-line ultra-sensitive screen for primary hypothyroidism and hyperthyroidism.' },
      { name: 'Anti - Thyroid Peroxidase Antibody', priority: 'confirmatory_special', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Detects Hashimoto Autoimmune Thyroiditis causing hypothyroidism.' },
      { name: 'ANTI THYROGLOBULIN ANTIBODY', priority: 'confirmatory_special', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Autoimmune thyroid antibody assessment and monitoring.' },
      { name: 'Lipid Profile', priority: 'secondary_supporting', sampleTube: 'Serum Gold (3ml)', fasting: true, indication: 'Screens for secondary dyslipidemia and elevated LDL caused by thyroid deficiency.' }
    ],
    sampleTubesRequired: ['SST Gold Top (Total T3/T4/TSH, Free T3/T4, Anti-TPO, Anti-TG, Lipid Profile)'],
    fastingGuidelines: '⚠️ Morning fasting sample recommended. Take thyroid medication (Thyroxine) after blood sampling.',
    clinicalRationale: 'Detects overt and subclinical primary/secondary thyroid abnormalities and Hashimoto autoimmune thyroiditis.',
    suggestedPackageName: 'Endocrine & Thyroid Autoimmune Master Profile',
    category: 'Hormones'
  },
  {
    symptomKey: 'womens_pcos_fertility',
    label: 'Women Wellness, PCOS & Hormonal Balance',
    icon: 'Heart',
    color: 'pink',
    organSystem: 'Female Reproductive & Endocrine System',
    keywords: ['pcos', 'pcod', 'irregular period', 'periods', 'fertility', 'pregnancy', 'acne', 'facial hair', 'prolactin', 'amh', 'ovary'],
    recommendedTestNames: [
      'AMH (Anti Mullerian Hormone)',
      'FSH (Follicle Stimulating Hormone)',
      'LH (Leutinizing Hormone)',
      'PROLACTIN',
      'TOTAL TESTOSTERONE',
      'DHEA Sulphate (DHEA-S)',
      'Thyroid Profile Total',
      'Fast Blood Sugar',
      'Insulin (Fasting)',
      'Beta -HCG SERUM'
    ],
    detailedTests: [
      { name: 'AMH (Anti Mullerian Hormone)', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Assesses Ovarian Reserve and high antral follicle count in PCOS.' },
      { name: 'FSH (Follicle Stimulating Hormone)', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Pituitary gonadotropin evaluating ovarian folliculogenesis (Best on Day 2-3 of cycle).' },
      { name: 'LH (Leutinizing Hormone)', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Evaluates reversed LH:FSH ratio (>2:1) characteristic of PCOS.' },
      { name: 'PROLACTIN', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Screens for Hyperprolactinemia causing anovulation and menstrual irregularity.' },
      { name: 'TOTAL TESTOSTERONE', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Evaluates hyperandrogenism, hirsutism, and cystic acne.' },
      { name: 'DHEA Sulphate (DHEA-S)', priority: 'secondary_supporting', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Rules out adrenal androgen excess in virilization.' },
      { name: 'Thyroid Profile Total', priority: 'secondary_supporting', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Screens for hypothyroidism which often mimics PCOS symptoms.' },
      { name: 'Fast Blood Sugar', priority: 'secondary_supporting', sampleTube: 'Fluoride Gray (2ml)', fasting: true, indication: 'Screens for impaired fasting glucose in metabolic syndrome.' },
      { name: 'Insulin (Fasting)', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: true, indication: 'Calculates Insulin Resistance which drives ovarian androgen overproduction.' },
      { name: 'Beta -HCG SERUM', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Quantitative pregnancy confirmation and ectopic pregnancy evaluation.' }
    ],
    sampleTubesRequired: ['SST Gold Top (AMH, FSH, LH, Prolactin, Testosterone, DHEA-S, Thyroid, Insulin, Beta-hCG)', 'Fluoride Gray Top (Fasting Glucose)'],
    fastingGuidelines: '⚠️ Morning fasting sample recommended. Best collected on Day 2 to Day 4 of menstrual cycle.',
    clinicalRationale: 'Assesses LH/FSH ratio, ovarian reserve, hyperandrogenism, insulin resistance, and hyperprolactinemia in PCOS and fertility workup.',
    suggestedPackageName: 'Women Hormonal Shield & PCOS Comprehensive Panel',
    category: 'Women'
  },
  {
    symptomKey: 'pre_operative',
    label: 'Pre-Operative Surgery Fitness',
    icon: 'Briefcase',
    color: 'slate',
    organSystem: 'Surgical Fitness & Hemostasis System',
    keywords: ['surgery', 'operation', 'fitness', 'pre-op', 'anesthesia', 'bleeding time', 'clotting time', 'blood group'],
    recommendedTestNames: [
      'Complete Haemogram (CBC + ESR + PS)',
      'Blood Group (ABO & Rh Factor)',
      'Bleeding Time & Clotting Time (BT/CT)',
      'PROTHROMBIN TIME WITH INR',
      'ACTIVATED PARTIAL THROMBOPLASTIN TIME (APTT)',
      'Blood Glucose Fasting',
      'Creatinine Serum',
      'Urea Serum',
      'HIV I/II Antibody',
      'HBSAG QUANTITATIVE',
      'HCV',
      'URINE ANALYSIS REPORT'
    ],
    detailedTests: [
      { name: 'Complete Haemogram (CBC + ESR + PS)', priority: 'must_do_urgent', sampleTube: 'EDTA Lavender (2ml)', fasting: false, indication: 'Screens for baseline anemia, infection, and platelet hemostasis.' },
      { name: 'Blood Group (ABO & Rh Factor)', priority: 'must_do_urgent', sampleTube: 'EDTA Lavender (2ml)', fasting: false, indication: 'Mandatory pre-operative blood grouping and cross-matching readiness.' },
      { name: 'Bleeding Time & Clotting Time (BT/CT)', priority: 'must_do_urgent', sampleTube: 'Capillary Blood', fasting: false, indication: 'Primary surgical screening for vascular and platelet plug integrity.' },
      { name: 'PROTHROMBIN TIME WITH INR', priority: 'must_do_urgent', sampleTube: 'Citrate Blue (2ml)', fasting: false, indication: 'Evaluates extrinsic coagulation pathway to prevent intra-operative hemorrhage.' },
      { name: 'ACTIVATED PARTIAL THROMBOPLASTIN TIME (APTT)', priority: 'must_do_urgent', sampleTube: 'Citrate Blue (2ml)', fasting: false, indication: 'Evaluates intrinsic clotting factors before major surgery.' },
      { name: 'Blood Glucose Fasting', priority: 'must_do_urgent', sampleTube: 'Fluoride Gray (2ml)', fasting: true, indication: 'Monitors peri-operative hyperglycemia and surgical wound healing risk.' },
      { name: 'Creatinine Serum', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Ensures safe renal clearance of anesthetic and surgical drugs.' },
      { name: 'Urea Serum', priority: 'secondary_supporting', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Evaluates kidney nitrogenous function.' },
      { name: 'HIV I/II Antibody', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Mandatory viral safety panel for surgical theatre protocol.' },
      { name: 'HBSAG QUANTITATIVE', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Mandatory Hepatitis B screening before operative procedures.' },
      { name: 'HCV', priority: 'must_do_urgent', sampleTube: 'Serum Gold (2ml)', fasting: false, indication: 'Mandatory Hepatitis C viral screening.' },
      { name: 'URINE ANALYSIS REPORT', priority: 'must_do_urgent', sampleTube: 'Sterile Urine Container', fasting: false, indication: 'Rules out asymptomatic bacteruria or urinary tract infection prior to surgery.' }
    ],
    sampleTubesRequired: ['EDTA Lavender Top (CBC, Blood Group)', 'Citrate Blue Top (PT/INR, APTT)', 'Fluoride Gray Top (Fasting Glucose)', 'SST Gold Top (Creatinine, Urea, HIV, HBsAg, HCV)', 'Sterile Container (Urine Routine)'],
    fastingGuidelines: '⚠️ 8-10 Hours fasting recommended for Fasting Glucose and baseline anesthesia clearance.',
    clinicalRationale: 'Essential surgical safety panel ensuring hemostatic competence, organ fitness, and viral transmission safety.',
    suggestedPackageName: 'Standard Pre-Operative Surgical Clearance Panel',
    category: 'Pre-Operative'
  }
];

export interface AIPackageRecommendation {
  packageName: string;
  tag: string;
  category: string;
  targetGroup: string;
  matchedSymptoms: string[];
  recommendedTests: LabTestItem[];
  totalMrp: number;
  aiOfferPrice: number;
  discountPercentage: number;
  fastingRequired: boolean;
  clinicalSummary: string;
  lifestyleAdvice: string[];
}

export class DiagnosticAIService {
  /**
   * Smart Semantic AI Search across master lab test catalog
   */
  public static searchTestsSmart(query: string, allTests: LabTestItem[]): {
    matchedTests: LabTestItem[];
    detectedSymptoms: AISymptomMapping[];
    aiInsights: string[];
  } {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) {
      return { matchedTests: allTests, detectedSymptoms: [], aiInsights: [] };
    }

    const matchedSymptoms = AI_SYMPTOM_KNOWLEDGE_BASE.filter(s =>
      s.keywords.some(k => cleanQuery.includes(k)) ||
      s.label.toLowerCase().includes(cleanQuery) ||
      s.category.toLowerCase().includes(cleanQuery) ||
      s.organSystem.toLowerCase().includes(cleanQuery)
    );

    const scoredTests: Array<{ test: LabTestItem; score: number }> = [];
    const symptomTargetNames = new Set(
      matchedSymptoms.flatMap(s => s.recommendedTestNames.map(n => n.toLowerCase()))
    );

    for (const test of allTests) {
      let score = 0;
      const testName = test.name.toLowerCase();
      const testCode = test.code.toLowerCase();
      const testCat = test.category.toLowerCase();
      const testDept = test.department.toLowerCase();

      if (testName.includes(cleanQuery)) score += 100;
      if (testCode.includes(cleanQuery)) score += 80;
      if (testCat.includes(cleanQuery)) score += 40;
      if (testDept.includes(cleanQuery)) score += 30;

      if (symptomTargetNames.has(testName)) {
        score += 60;
      }

      const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 2);
      for (const token of queryTokens) {
        if (testName.includes(token)) score += 20;
        if (test.description.toLowerCase().includes(token)) score += 10;
      }

      if (score > 0) {
        scoredTests.push({ test, score });
      }
    }

    scoredTests.sort((a, b) => b.score - a.score);
    const matchedTests = scoredTests.map(st => st.test);

    const aiInsights: string[] = [];
    if (matchedSymptoms.length > 0) {
      matchedSymptoms.forEach(s => {
        aiInsights.push(`AI Diagnostic Focus [${s.label}]: ${s.clinicalRationale}`);
      });
    }

    return {
      matchedTests,
      detectedSymptoms: matchedSymptoms,
      aiInsights
    };
  }

  /**
   * AI Auto-Prescription & Diagnostic Package Generator
   */
  public static generateAIPackageFromClinicalProfile(params: {
    age: number;
    gender: 'male' | 'female' | 'other';
    chiefComplaints: string;
    coMorbidities?: string[];
    allTests: LabTestItem[];
  }): AIPackageRecommendation {
    const { age, gender, chiefComplaints, coMorbidities = [], allTests } = params;
    const inputStr = `${chiefComplaints} ${coMorbidities.join(' ')}`.toLowerCase();

    const matchedMappings = AI_SYMPTOM_KNOWLEDGE_BASE.filter(m =>
      m.keywords.some(k => inputStr.includes(k)) ||
      (m.symptomKey === 'womens_pcos_fertility' && gender === 'female' && (inputStr.includes('period') || inputStr.includes('hormone') || inputStr.includes('acne'))) ||
      (m.symptomKey === 'fatigue_anemia' && (age > 50 || inputStr.includes('tired') || inputStr.includes('weak')))
    );

    const activeMappings = matchedMappings.length > 0 ? matchedMappings : [AI_SYMPTOM_KNOWLEDGE_BASE[0], AI_SYMPTOM_KNOWLEDGE_BASE[2]];

    const targetTestNames = new Set<string>();
    activeMappings.forEach(m => {
      m.recommendedTestNames.forEach(name => targetTestNames.add(name.toLowerCase()));
    });

    const recommendedTests: LabTestItem[] = [];
    const addedIds = new Set<string>();

    const cbcTest = allTests.find(t => t.name.toLowerCase().includes('complete') || t.name.toLowerCase().includes('cbc'));
    if (cbcTest && !addedIds.has(cbcTest.id)) {
      recommendedTests.push(cbcTest);
      addedIds.add(cbcTest.id);
    }

    for (const test of allTests) {
      const lower = test.name.toLowerCase();
      const isTargeted = Array.from(targetTestNames).some(tName => lower.includes(tName) || tName.includes(lower));

      if (isTargeted && !addedIds.has(test.id)) {
        recommendedTests.push(test);
        addedIds.add(test.id);
      }

      if (recommendedTests.length >= 10) break;
    }

    const totalMrp = recommendedTests.reduce((sum, t) => sum + (t.mrp || 0), 0);
    const discountPercentage = 45;
    const aiOfferPrice = Math.round(totalMrp * (1 - discountPercentage / 100));
    const fastingRequired = recommendedTests.some(t => t.fastingRequired);

    const primaryMapping = activeMappings[0];
    const packageName = `AI Smart ${primaryMapping.suggestedPackageName} (${age}Y ${gender.toUpperCase()})`;
    const category = primaryMapping.category || 'Full Body';
    const targetGroup = `${gender === 'male' ? 'Men' : gender === 'female' ? 'Women' : 'Adults'} (${age >= 50 ? 'Senior 50+' : 'Adults 18-50'})`;

    const clinicalSummary = `Curated AI diagnostic workup for ${age}Y ${gender} presenting with "${chiefComplaints || 'routine preventive checkup'}". Bundles ${recommendedTests.length} high-yield laboratory biomarkers for comprehensive risk stratification.`;

    const lifestyleAdvice: string[] = [
      fastingRequired ? '⚠️ 8-10 Hours overnight fasting required (Water permitted).' : 'Routine sample collection (Fasting not mandatory).',
      'Do not consume high-fat meal or alcohol 24 hours prior to sampling.',
      'Bring recent medical prescriptions and health card for cashless processing.'
    ];

    return {
      packageName,
      tag: `🤖 AI CLINICAL BUNDLE • ${recommendedTests.length} INVESTIGATIONS (45% OFF)`,
      category,
      targetGroup,
      matchedSymptoms: activeMappings.map(m => m.label),
      recommendedTests,
      totalMrp,
      aiOfferPrice,
      discountPercentage,
      fastingRequired,
      clinicalSummary,
      lifestyleAdvice
    };
  }

  /**
   * AI Step-by-Step Doctor Prescription & Clinical Requisition Generator
   */
  public static generateDoctorPrescriptionTextDraft(params: {
    patientName?: string;
    patientAge: number;
    patientGender: 'male' | 'female' | 'other';
    symptomKey?: string;
    customComplaints?: string;
    selectedTests?: LabTestItem[];
  }): {
    patientName: string;
    patientAge: number;
    patientGender: string;
    chiefComplaintsText: string;
    clinicalImpressionText: string;
    advisedInvestigationsList: Array<{
      name: string;
      sampleTube: string;
      fasting: boolean;
      priority: string;
      mrp?: number;
    }>;
    phlebotomyInstructionsText: string;
    emergencyRedFlagsText: string;
    formattedPrescriptionFullText: string;
  } {
    const {
      patientName = 'Patient / Cardholder',
      patientAge,
      patientGender,
      symptomKey,
      customComplaints,
      selectedTests = []
    } = params;

    const mapping = symptomKey ? AI_SYMPTOM_KNOWLEDGE_BASE.find(s => s.symptomKey === symptomKey) : null;

    // 1. Chief Complaints Formulation
    const complaints = customComplaints || (mapping ? `Presenting with acute symptoms of ${mapping.label.toLowerCase()} along with generalized malaise and fatigue.` : 'Routine clinical consultation and health risk assessment.');
    const chiefComplaintsText = `${patientAge}Y ${patientGender.toUpperCase()} - ${complaints}`;

    // 2. Clinical Working Impression Formulation
    let clinicalImpressionText = '';
    if (mapping) {
      clinicalImpressionText = `Clinical Impression: High suspicion of ${mapping.label} (${mapping.organSystem}). Advised baseline and differential pathology workup.`;
    } else {
      clinicalImpressionText = `Clinical Impression: Symptomatic clinical evaluation requiring diagnostic laboratory correlation.`;
    }

    // 3. Advised Investigations List
    const advisedList: Array<{
      name: string;
      sampleTube: string;
      fasting: boolean;
      priority: string;
      mrp?: number;
    }> = [];

    if (mapping && mapping.detailedTests.length > 0) {
      mapping.detailedTests.forEach(dt => {
        advisedList.push({
          name: dt.name,
          sampleTube: dt.sampleTube,
          fasting: dt.fasting,
          priority: dt.priority === 'must_do_urgent' ? 'STAT / Must-Do' : dt.priority === 'secondary_supporting' ? 'Secondary / Differential' : 'Confirmatory Special',
        });
      });
    } else if (selectedTests.length > 0) {
      selectedTests.forEach(t => {
        advisedList.push({
          name: t.name,
          sampleTube: t.specimen,
          fasting: t.fastingRequired,
          priority: t.fastingRequired ? 'Fasting Protocol' : 'Routine',
          mrp: t.mrp
        });
      });
    } else {
      advisedList.push(
        { name: 'Complete Blood Count (CBC) with ESR', sampleTube: 'EDTA Lavender (2ml)', fasting: false, priority: 'STAT / Baseline' },
        { name: 'Blood Glucose Fasting (FBS)', sampleTube: 'Fluoride Gray (2ml)', fasting: true, priority: 'Metabolic Baseline' },
        { name: 'Lipid Profile Comprehensive', sampleTube: 'Serum Gold (3ml)', fasting: true, priority: 'Cardiovascular' },
        { name: 'Liver Function Test (LFT)', sampleTube: 'Serum Gold (2ml)', fasting: true, priority: 'Hepatic' },
        { name: 'Kidney Function Test (Creatinine, Urea)', sampleTube: 'Serum Gold (2ml)', fasting: false, priority: 'Renal' }
      );
    }

    // 4. Phlebotomy & Fasting Guidelines
    const hasFasting = advisedList.some(t => t.fasting);
    const phlebotomyInstructionsText = hasFasting
      ? '⚠️ 8-10 Hours overnight fasting required before morning blood sample collection. Plain water is permitted. Avoid high-fat meal or alcohol 24h prior.'
      : '🌿 Routine non-fasting sample collection. Drink adequate water before blood withdrawal.';

    // 5. Emergency Red-Flag Warnings
    const emergencyRedFlagsText = mapping
      ? `Review urgently or visit emergency ER if sudden shortness of breath, severe dizziness, persistent vomiting, high fever >103°F, or active bleeding occurs.`
      : `Follow up immediately with test reports for clinical correlation and prescription review.`;

    // 6. Complete Formatted Rx Slip Text
    const fullSlipLines = [
      `=============================================================`,
      `               LABMEDIX CLINICAL EMR PRESCRIPTION            `,
      `            Automated AI Diagnostic Requisition Slip         `,
      `=============================================================`,
      `PATIENT: ${patientName.toUpperCase()}`,
      `AGE / GENDER: ${patientAge} Years / ${patientGender.toUpperCase()}`,
      `DATE: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      `-------------------------------------------------------------`,
      `CHIEF COMPLAINTS & HISTORY:`,
      `  • ${chiefComplaintsText}`,
      ``,
      `PROVISIONAL DIAGNOSIS & IMPRESSION:`,
      `  • ${clinicalImpressionText}`,
      ``,
      `Rx / ADVISED DIAGNOSTIC INVESTIGATIONS (${advisedList.length} Tests):`,
      ...advisedList.map((t, i) => `  ${i + 1}. ${t.name} [${t.priority}] - Tube: ${t.sampleTube}${t.fasting ? ' (Fasting 8-10H)' : ''}`),
      ``,
      `PATIENT PREPARATION GUIDELINES:`,
      `  • ${phlebotomyInstructionsText}`,
      ``,
      `RED-FLAG WARNINGS & FOLLOW-UP ADVICE:`,
      `  • ${emergencyRedFlagsText}`,
      `=============================================================`,
      `DOCTOR SIGNATURE: _______________________ (LabMedix Clinical)`
    ];

    const formattedPrescriptionFullText = fullSlipLines.join('\n');

    return {
      patientName,
      patientAge,
      patientGender,
      chiefComplaintsText,
      clinicalImpressionText,
      advisedInvestigationsList: advisedList,
      phlebotomyInstructionsText,
      emergencyRedFlagsText,
      formattedPrescriptionFullText
    };
  }
}
