import { PrescriptionLayoutProps, SmartPrescriptionLayoutMode } from './smartLayoutTypes';
import { THEME_CONFIGS } from './themeConfigs';
import { formatDateTime, formatDate } from '../../../utils/formatters';
import { PrescribedMedication, OrderedLabTest } from '../../../types';

export function generatePrescriptionPrintHtml(
  props: PrescriptionLayoutProps,
  layoutMode: SmartPrescriptionLayoutMode
): string {
  const {
    encounter,
    patient,
    activeMembership,
    securityHash,
    qrCodeUrl,
    theme,
    options,
    appointmentSlotLabel,
    preferredTimeLabel,
    helplineNumber,
    hospitalName,
    hospitalTagline,
    hospitalAddress
  } = props;

  // 1. THERMAL SLIP PRINT HTML (POS 80mm / 58mm Receipt Roll)
  if (layoutMode === 'thermal_slip') {
    const is58mm = options.thermalWidth === '58mm';
    const rollWidth = is58mm ? '58mm' : '80mm';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Thermal Prescription - ${encounter.encounterNo}</title>
          <style>
            @page { size: ${rollWidth} auto; margin: 2mm; }
            body {
              font-family: 'Courier New', Courier, monospace, sans-serif;
              font-size: 10.5px;
              line-height: 1.25;
              color: #000;
              background: #FFF;
              margin: 0;
              padding: 4px;
              width: ${is58mm ? '52mm' : '74mm'};
              -webkit-print-color-adjust: exact !important;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 4px 0; }
            .row { display: flex; justify-content: space-between; }
            .med-block { margin-bottom: 4px; padding-bottom: 2px; border-bottom: 1px dotted #888; }
            .med-name { font-weight: bold; font-size: 11px; }
            .med-salt { font-size: 8.5px; font-style: italic; }
            .med-freq { font-size: 9.5px; font-weight: bold; }
            .qr-code { width: 70px; height: 70px; margin: 4px auto; display: block; border: 1px solid #000; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="bold" style="font-size: 12px;">${hospitalName}</div>
            <div style="font-size: 8.5px;">${hospitalTagline}</div>
            <div style="font-size: 8px;">${hospitalAddress}</div>
            <div style="font-size: 9px;" class="bold">24x7 HELPLINE: ${helplineNumber}</div>
          </div>

          <div class="divider"></div>

          <div class="row">
            <div><strong>OPD PRESCRIPTION</strong></div>
            <div>#${encounter.encounterNo}</div>
          </div>
          <div class="row" style="font-size: 9px;">
            <div>Date: ${formatDateTime(encounter.date)}</div>
            <div>Room #104</div>
          </div>

          <div class="divider"></div>

          <div><strong>Dr. ${encounter.doctorName}</strong></div>
          <div style="font-size: 9px;">${encounter.doctorSpeciality} (${encounter.department})</div>
          <div style="font-size: 8.5px;">Reg: ${encounter.doctorRegNo}</div>

          <div class="divider"></div>

          <div class="row">
            <div>Pt: <strong>${encounter.patientName}</strong></div>
            <div>${patient?.age || '54'}Y / ${patient?.gender || 'M'}</div>
          </div>
          <div class="row" style="font-size: 8.5px;">
            <div>UHID: ${encounter.patientId}</div>
            <div>Blood: ${patient?.bloodGroup || 'O+'}</div>
          </div>
          ${activeMembership ? `<div style="font-size: 8px;" class="bold">TIER: ${activeMembership.name.toUpperCase()}</div>` : ''}

          ${options.showVitals && encounter.vitals ? `
            <div class="divider"></div>
            <div style="font-size: 8.5px;" class="bold">VITALS:</div>
            <div style="font-size: 8.5px;">BP: ${encounter.vitals.bpSystolic || 120}/${encounter.vitals.bpDiastolic || 80} | Pulse: ${encounter.vitals.pulseRate || 74} | SpO2: ${encounter.vitals.spo2 || 99}%</div>
          ` : ''}

          ${options.includeDiagnosisICD && encounter.diagnoses && encounter.diagnoses.length > 0 ? `
            <div class="divider"></div>
            <div style="font-size: 8.5px;" class="bold">DX (ICD-10): ${encounter.diagnoses.join(', ')}</div>
          ` : ''}

          <div class="divider"></div>
          <div class="bold" style="font-size: 11px; margin-bottom: 2px;">℞ MEDICATIONS:</div>

          ${encounter.medications.map((m: PrescribedMedication, idx: number) => `
            <div class="med-block">
              <div class="row">
                <span class="med-name">${idx + 1}. ${m.name}</span>
                <span class="bold">${m.dosage}</span>
              </div>
              ${options.showSalts && m.composition ? `<div class="med-salt">${m.composition}</div>` : ''}
              <div class="row med-freq">
                <span>${m.frequency} (${m.timing})</span>
                <span>${m.duration}</span>
              </div>
              ${m.instructions ? `<div style="font-size: 8px;">Note: ${m.instructions}</div>` : ''}
            </div>
          `).join('')}

          ${encounter.labOrders && encounter.labOrders.length > 0 ? `
            <div class="divider"></div>
            <div class="bold" style="font-size: 9px;">LABS ADVISED:</div>
            ${encounter.labOrders.map((lo: OrderedLabTest) => `<div style="font-size: 8.5px;">• ${lo.testName}</div>`).join('')}
          ` : ''}

          ${options.showAdvice && encounter.dietAndAdvice && encounter.dietAndAdvice.length > 0 ? `
            <div class="divider"></div>
            <div class="bold" style="font-size: 8.5px;">ADVICE:</div>
            ${encounter.dietAndAdvice.map((a: string) => `<div style="font-size: 8.5px;">- ${a}</div>`).join('')}
          ` : ''}

          ${options.includeFollowupSlot ? `
            <div class="divider"></div>
            <div style="font-size: 9px;"><strong>NEXT VISIT:</strong> ${formatDate(encounter.followUpDate || '')} (${encounter.followUpDays || 14}D)</div>
            <div style="font-size: 8.5px;">Slot: ${appointmentSlotLabel}</div>
          ` : ''}

          <div class="divider"></div>
          <div class="center" style="font-size: 8px;">
            ${options.showQrCode && qrCodeUrl ? `<img src="${qrCodeUrl}" class="qr-code" />` : ''}
            <div>Hash: ${securityHash.slice(0, 20)}</div>
            <div class="bold" style="margin-top: 2px;">*** PHARMACY DISPENSING SLIP ***</div>
            <div>Signed by Dr. ${encounter.doctorName}</div>
          </div>

          <script>
            setTimeout(() => { window.print(); window.close(); }, 300);
          </script>
        </body>
      </html>
    `;
  }

  // 2. COMPACT A5 PRINT HTML
  if (layoutMode === 'compact_a5') {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Compact Prescription - ${encounter.encounterNo}</title>
          <style>
            @page { size: A5 portrait; margin: 6mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 10px;
              color: #0F172A;
              margin: 0;
              padding: 4px;
              line-height: 1.35;
              -webkit-print-color-adjust: exact !important;
            }
            .header-bar { background: #0F766E; color: #FFF; padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; }
            .header-bar h1 { margin: 0; font-size: 14px; text-transform: uppercase; }
            .pat-doc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 8px 10px; border-radius: 8px; margin-bottom: 8px; }
            .vitals-bar { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 4px 6px; border-radius: 6px; text-align: center; font-size: 9px; margin-bottom: 8px; }
            table.rx-tbl { width: 100%; border-collapse: collapse; margin-bottom: 8px; border: 1px solid #CBD5E1; }
            table.rx-tbl th { background: #0F766E; color: #FFF; font-size: 9.5px; padding: 5px 6px; text-align: left; }
            table.rx-tbl td { padding: 5px 6px; border-bottom: 1px solid #E2E8F0; font-size: 9.5px; }
            .footer-grid { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #CBD5E1; padding-top: 6px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h1>${hospitalName}</h1>
                <div style="font-size: 9px; opacity: 0.9;">${hospitalTagline} • Helpline: ${helplineNumber}</div>
              </div>
              <div style="text-align: right; font-size: 9.5px; font-family: monospace;">
                <strong>${encounter.encounterNo}</strong><br>
                <span>${formatDateTime(encounter.date)}</span>
              </div>
            </div>
          </div>

          <div class="pat-doc-grid">
            <div>
              <span style="font-size:8px; color:#64748B; font-weight:bold;">CONSULTANT:</span><br>
              <strong>Dr. ${encounter.doctorName}</strong><br>
              <span style="color:#0F766E;">${encounter.doctorSpeciality} (${encounter.department})</span>
            </div>
            <div>
              <span style="font-size:8px; color:#64748B; font-weight:bold;">PATIENT:</span><br>
              <strong>${encounter.patientName}</strong> (${patient?.age || '54'}Y / ${patient?.gender || 'M'})<br>
              <span>UHID: ${encounter.patientId} • Blood: ${patient?.bloodGroup || 'O+'}</span>
            </div>
          </div>

          ${options.showVitals && encounter.vitals ? `
            <div class="vitals-bar">
              <div>BP: <strong>${encounter.vitals.bpSystolic || 120}/${encounter.vitals.bpDiastolic || 80}</strong></div>
              <div>Pulse: <strong>${encounter.vitals.pulseRate || 74}</strong></div>
              <div>Temp: <strong>${encounter.vitals.temperature || 98.4}°F</strong></div>
              <div>SpO2: <strong>${encounter.vitals.spo2 || 99}%</strong></div>
              <div>Sugar: <strong>${encounter.vitals.bloodSugar || 110}</strong></div>
              <div>BMI: <strong>${encounter.vitals.bmi || '24.2'}</strong></div>
            </div>
          ` : ''}

          <table class="rx-tbl">
            <thead>
              <tr>
                <th>Rx Drug Name</th>
                <th>Dose</th>
                <th>Frequency &amp; Timing</th>
                <th>Duration</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${encounter.medications.map((m: PrescribedMedication) => `
                <tr>
                  <td>
                    <strong>${m.name}</strong>
                    ${options.showSalts && m.composition ? `<div style="font-size:8px; color:#64748B;">${m.composition}</div>` : ''}
                  </td>
                  <td style="font-family: monospace; font-weight: bold;">${m.dosage}</td>
                  <td><strong>${m.frequency}</strong> (${m.timing})</td>
                  <td style="font-family: monospace;">${m.duration}</td>
                  <td style="font-size: 8.5px;">${m.instructions || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${options.includeFollowupSlot ? `
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 5px 8px; border-radius: 6px; font-size: 9.5px; margin-bottom: 6px;">
              <strong>Next Follow-up:</strong> ${formatDate(encounter.followUpDate || '')} (${encounter.followUpDays || 14}D) • Slot: ${appointmentSlotLabel}
            </div>
          ` : ''}

          <div class="footer-grid">
            <div>
              ${options.showQrCode && qrCodeUrl ? `<img src="${qrCodeUrl}" style="width:40px; height:40px;" />` : ''}
              <div style="font-size: 8px; color: #64748B;">Hash: ${securityHash}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-family: cursive; font-size: 14px;">Dr. ${encounter.doctorName}</div>
              <div style="border-top: 1px solid #000; padding-top: 2px; font-size: 8.5px;">Reg No: ${encounter.doctorRegNo}</div>
            </div>
          </div>

          <script>
            setTimeout(() => { window.print(); window.close(); }, 300);
          </script>
        </body>
      </html>
    `;
  }

  // 3. DETAILED A4 & CLINICAL SUMMARY PRINT HTML
  const curTheme = THEME_CONFIGS[theme] || THEME_CONFIGS.apollo_modern;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Prescription - ${encounter.encounterNo} - ${encounter.patientName}</title>
        <style>
          @page { size: A4 portrait; margin: 8mm; }
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif;
            font-size: 11px;
            margin: 0;
            padding: 8px;
            color: #0F172A;
            line-height: 1.4;
            -webkit-print-color-adjust: exact !important;
          }
          .hdr-band {
            background: linear-gradient(135deg, ${curTheme.primaryColor} 0%, ${curTheme.secondaryColor} 100%);
            color: #FFF;
            border-radius: 12px;
            padding: 14px 18px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .hdr-band h1 { margin: 0; font-size: 16px; font-weight: 900; text-transform: uppercase; }
          .hdr-band p { margin: 2px 0; font-size: 10.5px; opacity: 0.9; }
          .doc-box {
            background: #F8FAFC;
            border: 1.5px solid #CBD5E1;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            padding: 8px 14px;
            margin-bottom: 8px;
          }
          .patient-strip {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            background: #F8FAFC;
            border: 1.5px solid #E2E8F0;
            padding: 8px 12px;
            border-radius: 10px;
            margin-bottom: 8px;
            font-size: 11px;
          }
          .vitals-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 6px;
            margin-bottom: 8px;
          }
          .vital-card {
            background: #FFF;
            border: 1.5px solid #CBD5E1;
            border-radius: 8px;
            padding: 5px 6px;
            text-align: center;
            font-size: 10px;
          }
          .vital-val { font-weight: 800; font-size: 12.5px; font-family: monospace; display: block; }
          .body-layout { display: grid; grid-template-columns: 200px 1fr; gap: 12px; }
          .left-sidebar { display: flex; flex-direction: column; gap: 8px; }
          .sidebar-card { border-radius: 10px; padding: 8px 10px; }
          .sidebar-card-title { font-size: 10.5px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px; }
          .sidebar-card ul { margin: 0; padding-left: 14px; font-size: 10.5px; line-height: 1.5; }
          .sec-head {
            font-size: 11.5px;
            font-weight: 900;
            text-transform: uppercase;
            padding-bottom: 3px;
            margin-bottom: 6px;
            border-bottom: 2px solid #E2E8F0;
            display: flex;
            justify-content: space-between;
          }
          table.rx-tbl { width: 100%; border-collapse: collapse; margin-bottom: 8px; border: 1.5px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
          table.rx-tbl th { background: ${curTheme.primaryColor}; color: #FFF; font-size: 10.5px; padding: 7px 8px; text-align: left; }
          table.rx-tbl td { padding: 6px 8px; border-bottom: 1px solid #F1F5F9; font-size: 11px; }
          .appointment-box { margin-top: 8px; padding: 7px 10px; background: #FEF3C7; border: 1.5px solid #F59E0B; border-radius: 8px; font-size: 10.5px; }
          .signature-area { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 12px; padding-top: 8px; border-top: 1.5px solid #E2E8F0; }
        </style>
      </head>
      <body>
        <div class="hdr-band">
          <div>
            <h1>${hospitalName}</h1>
            <p>${hospitalTagline}</p>
            <p>${hospitalAddress} • 24x7 Helpline: ${helplineNumber}</p>
          </div>
          <div style="text-align: right;">
            <span style="background: rgba(0,0,0,0.4); padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; font-family: monospace;">
              ${layoutMode === 'clinical_summary' ? 'DISCHARGE & CASE SUMMARY' : 'OFFICIAL CLINICAL Rx'}
            </span>
            <div style="font-family: monospace; font-size: 12px; font-weight: 900; margin-top: 2px;">${encounter.encounterNo}</div>
            <div style="font-size: 9.5px; opacity: 0.9;">Date: ${formatDateTime(encounter.date)}</div>
          </div>
        </div>

        <div class="doc-box">
          <div>
            <strong style="font-size: 13px; color: #0F172A; display: block;">Dr. ${encounter.doctorName}</strong>
            <span style="font-weight: bold; font-size: 11px; color: ${curTheme.primaryColor};">${encounter.doctorSpeciality} (${encounter.department})</span>
          </div>
          <div style="text-align: right; font-size: 10px;">
            <div>OPD Room #104</div>
            <div style="font-family: monospace;">Reg No: <strong>${encounter.doctorRegNo}</strong></div>
          </div>
        </div>

        <div class="patient-strip">
          <div><span style="color:#64748B; font-weight:700;">Patient:</span><br><strong>${encounter.patientName}</strong></div>
          <div><span style="color:#64748B; font-weight:700;">UHID:</span><br><span style="font-family:monospace;">${encounter.patientId}</span></div>
          <div><span style="color:#64748B; font-weight:700;">Age/Sex:</span><br><strong>${patient?.age || '54'}Y / ${patient?.gender || 'Male'}</strong> (${patient?.bloodGroup || 'O+'})</div>
          <div><span style="color:#64748B; font-weight:700;">Tier:</span><br><strong style="color:${curTheme.primaryColor};">${activeMembership?.name || 'Gold Privilege'}</strong></div>
        </div>

        ${options.showVitals && encounter.vitals ? `
          <div class="vitals-grid">
            <div class="vital-card">
              <span style="color:#64748B; font-weight:bold;">BP</span>
              <span class="vital-val">${encounter.vitals.bpSystolic || 120}/${encounter.vitals.bpDiastolic || 80}</span>
            </div>
            <div class="vital-card">
              <span style="color:#64748B; font-weight:bold;">Pulse</span>
              <span class="vital-val">${encounter.vitals.pulseRate || 74}</span>
            </div>
            <div class="vital-card">
              <span style="color:#64748B; font-weight:bold;">Temp</span>
              <span class="vital-val">${encounter.vitals.temperature || 98.4}°F</span>
            </div>
            <div class="vital-card">
              <span style="color:#64748B; font-weight:bold;">SpO2</span>
              <span class="vital-val">${encounter.vitals.spo2 || 99}%</span>
            </div>
            <div class="vital-card">
              <span style="color:#64748B; font-weight:bold;">Sugar</span>
              <span class="vital-val">${encounter.vitals.bloodSugar || 110}</span>
            </div>
            <div class="vital-card">
              <span style="color:#64748B; font-weight:bold;">BMI</span>
              <span class="vital-val">${encounter.vitals.bmi || '24.2'}</span>
            </div>
          </div>
        ` : ''}

        <div class="body-layout">
          <div class="left-sidebar">
            <div class="sidebar-card" style="background: #FAF5FF; border: 1.5px solid #DDD6FE;">
              <div class="sidebar-card-title" style="color: #6D28D9;">🩺 Symptoms</div>
              <ul>
                ${encounter.chiefComplaints && encounter.chiefComplaints.length > 0
                  ? encounter.chiefComplaints.map((c: string) => `<li>${c}</li>`).join('')
                  : '<li style="list-style:none; color:#94A3B8;">Routine review</li>'}
              </ul>
            </div>

            ${options.includeDiagnosisICD ? `
              <div class="sidebar-card" style="background: #ECFDF5; border: 1.5px solid #6EE7B7;">
                <div class="sidebar-card-title" style="color: #065F46;">🏥 Diagnoses (ICD-10)</div>
                <ul style="font-weight: bold; color: #064E3B;">
                  ${encounter.diagnoses && encounter.diagnoses.length > 0
                    ? encounter.diagnoses.map((d: string) => `<li>${d}</li>`).join('')
                    : '<li style="list-style:none; color:#94A3B8;">-</li>'}
                </ul>
              </div>
            ` : ''}

            <div style="font-size: 9.5px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px; text-align: center;">
              <strong>Summary:</strong> ${encounter.medications.length} Drugs • ${encounter.labOrders?.length || 0} Labs
            </div>
          </div>

          <div>
            <div class="sec-head">
              <span>℞ Prescribed Therapeutic Regimen</span>
              <span style="font-size: 9.5px; font-weight: normal; color: #64748B;">Take as directed</span>
            </div>

            <table class="rx-tbl">
              <thead>
                <tr>
                  <th style="width: 40%;">Medicine &amp; Salt</th>
                  <th style="width: 12%;">Dosage</th>
                  <th style="width: 25%;">Frequency</th>
                  <th style="width: 11%;">Duration</th>
                  <th style="width: 12%;">Advice</th>
                </tr>
              </thead>
              <tbody>
                ${encounter.medications.map((m: PrescribedMedication, idx: number) => `
                  <tr style="background: ${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
                    <td>
                      <strong>${m.name}</strong>
                      ${options.showSalts && m.composition ? `<div style="font-size:9px; color:#64748B; font-style:italic;">${m.composition}</div>` : ''}
                    </td>
                    <td style="font-family: monospace; font-weight: bold;">${m.dosage}</td>
                    <td><strong>${m.frequency}</strong> <span style="font-size:9px; color:${curTheme.primaryColor};">(${m.timing})</span></td>
                    <td style="font-family: monospace;">${m.duration}</td>
                    <td style="font-size: 9.5px;">${m.instructions || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            ${encounter.labOrders && encounter.labOrders.length > 0 ? `
              <div class="sec-head" style="margin-top: 6px;">
                <span>🔬 Diagnostic Investigations Advised</span>
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom: 6px;">
                ${encounter.labOrders.map((lo: OrderedLabTest) => `
                  <span style="padding: 3px 6px; background: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 4px; font-size: 9.5px; font-weight: bold;">
                    ${lo.testName} (${lo.category})
                  </span>
                `).join('')}
              </div>
            ` : ''}

            ${options.showAdvice && encounter.dietAndAdvice && encounter.dietAndAdvice.length > 0 ? `
              <div class="sec-head" style="margin-top: 6px;">
                <span>🥗 Dietary &amp; Lifestyle Advice</span>
              </div>
              <ul style="margin: 0; padding-left: 16px; font-size: 10px;">
                ${encounter.dietAndAdvice.map((a: string) => `<li>${a}</li>`).join('')}
              </ul>
            ` : ''}

            ${options.includeFollowupSlot ? `
              <div class="appointment-box">
                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 2px;">
                  <span>📅 NEXT FOLLOW-UP APPOINTMENT</span>
                  <span>PATIENT WISH CONFIRMED</span>
                </div>
                <div>Date: <strong>${formatDate(encounter.followUpDate || '')}</strong> (${encounter.followUpDays || 14} Days) • Slot: ${appointmentSlotLabel} (${preferredTimeLabel}) • Room #104</div>
              </div>
            ` : ''}

            <div class="signature-area">
              <div style="display: flex; align-items: center; gap: 8px;">
                ${options.showQrCode && qrCodeUrl ? `<img src="${qrCodeUrl}" style="width: 48px; height: 48px; border: 1px solid #CBD5E1; padding: 2px;" />` : ''}
                <div>
                  <strong style="font-size: 9.5px; display: block; color: ${curTheme.primaryColor};">LABMEDIX EMR VERIFIED SEAL</strong>
                  <span style="font-family: monospace; font-size: 8.5px; color: #64748B;">Hash: ${securityHash}</span>
                </div>
              </div>

              <div style="text-align: right; width: 180px;">
                <div style="font-family: cursive; font-size: 18px; color: ${curTheme.primaryColor};">Dr. ${encounter.doctorName}</div>
                <div style="border-top: 1.5px solid #0F172A; padding-top: 2px; font-size: 9.5px;">
                  <strong>Dr. ${encounter.doctorName}</strong><br>
                  <span>Reg: ${encounter.doctorRegNo} • ${encounter.doctorSpeciality}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <script>
          setTimeout(() => { window.print(); window.close(); }, 300);
        </script>
      </body>
    </html>
  `;
}
