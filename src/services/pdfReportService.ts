/**
 * PDF Report Service for Krushi Doctor
 * Generates an official, printable/downloadable Plantix-style Crop Health & Prescription Report
 */

import { PlantixDiseaseDiagnosis, FarmerProfile } from '../types';

export function generateAndDownloadReportPDF(
  diagnosis: PlantixDiseaseDiagnosis,
  profile: FarmerProfile
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('कृपया पॉपअपला परवानगी द्या जेणेकरून अहवाल डाऊनलोड करता येईल.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="UTF-8">
  <title>AgroVani_Crop_Health_Report_${diagnosis.crop}_${diagnosis.id}.pdf</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: 'Mukta', Arial, sans-serif; color: #1c1917; margin: 0; padding: 20px; line-height: 1.5; font-size: 13px; }
    .header { border-bottom: 3px solid #15803d; padding-bottom: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
    .logo-title h1 { color: #15803d; margin: 0; font-size: 24px; font-weight: 800; }
    .logo-title p { margin: 2px 0 0 0; color: #57534e; font-size: 12px; }
    .report-badge { background: #f0fdf4; border: 1px solid #86efac; color: #166534; padding: 6px 12px; border-radius: 8px; text-align: right; font-size: 11px; }
    
    .section-title { background: #f5f5f4; padding: 6px 10px; font-weight: 700; color: #292524; font-size: 13px; border-left: 4px solid #15803d; margin: 14px 0 8px 0; border-radius: 4px; }
    
    .grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
    .col { flex: 1; min-width: 45%; background: #fafaf9; border: 1px solid #e7e5e4; padding: 8px 12px; border-radius: 6px; }
    .label { color: #78716c; font-size: 11px; font-weight: 600; }
    .value { font-weight: 700; color: #1c1917; font-size: 13px; margin-top: 2px; }
    
    .diagnosis-box { background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 12px; margin-bottom: 15px; }
    .diag-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .diag-name { font-size: 18px; font-weight: 800; color: #991b1b; }
    .conf-score { background: #15803d; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .scientific { font-style: italic; color: #7f1d1d; font-size: 12px; }
    
    table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px; font-size: 12px; }
    th { background: #15803d; color: white; text-align: left; padding: 8px 10px; font-weight: 700; }
    td { border: 1px solid #e7e5e4; padding: 8px 10px; vertical-align: top; }
    tr:nth-child(even) { background: #fafaf9; }
    
    .bullet-list { margin: 4px 0; padding-left: 20px; }
    .bullet-list li { margin-bottom: 4px; color: #292524; }
    
    .footer { margin-top: 25px; padding-top: 12px; border-top: 1px dashed #d6d3d1; font-size: 10px; color: #78716c; text-align: center; }
    
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 15px; background: #e0f2fe; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-weight: bold; color: #0369a1;">📄 पीक आरोग्य अहवाल तयार आहे</span>
    <button onclick="window.print()" style="background: #15803d; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
      प्रिंट किंवा PDF सेव्ह करा (Print / Save as PDF)
    </button>
  </div>

  <div class="header">
    <div class="logo-title">
      <h1>🌱 अ‍ॅग्रोवाणी कृषी डॉक्टर अहवाल</h1>
      <p>सोलापूर शेतकरी डिजिटल वनस्पती रोग निदान व औषध शिफारस पत्र</p>
    </div>
    <div class="report-badge">
      <div>तपासणी क्र: <strong>#${diagnosis.id.slice(-6)}</strong></div>
      <div>दिनांक: <strong>${diagnosis.timestamp}</strong></div>
      <div>अचूकता: <strong>${diagnosis.confidenceScore}%</strong></div>
    </div>
  </div>

  <!-- Farmer & Field Details -->
  <div class="section-title">१. शेतकरी व शेताचा तपशील (Farmer & Field Information)</div>
  <div class="grid">
    <div class="col">
      <div class="label">शेतकऱ्याचे नाव</div>
      <div class="value">${profile.fullName || 'शेतकरी मित्र'}</div>
    </div>
    <div class="col">
      <div class="label">मोबाईल नंबर</div>
      <div class="value">${profile.mobileNumber || 'नोंदणीकृत नाही'}</div>
    </div>
    <div class="col">
      <div class="label">गाव व तालुका</div>
      <div class="value">${profile.village || 'कोर्टी'}, ता. ${profile.taluka || 'पंढरपूर'}, जि. सोलापूर</div>
    </div>
    <div class="col">
      <div class="label">तपासलेले पीक व क्षेत्र</div>
      <div class="value">${diagnosis.crop} (${profile.landAreaAcre || 2.5} एकर)</div>
    </div>
  </div>

  <!-- Disease Diagnosis Section -->
  <div class="section-title">२. रोग निदान व ओळख (Plantix AI Disease Diagnosis)</div>
  <div class="diagnosis-box">
    <div class="diag-header">
      <div>
        <div class="diag-name">${diagnosis.diseaseNameMr} (${diagnosis.diseaseNameEn})</div>
        <div class="scientific">शास्त्रीय नाव: <i>${diagnosis.scientificName}</i> • प्रकार: ${diagnosis.pathogenType}</div>
      </div>
      <div class="conf-score">${diagnosis.confidenceScore}% अचूकता</div>
    </div>
    <div style="font-size: 12px; margin-top: 6px; color: #7f1d1d;">
      <strong>गांभीर्य पातळी: </strong>${diagnosis.severity === 'high' ? '⚠️ तीव्र (तातडीने फवारणी आवश्यक)' : 'मध्यम'}
    </div>
  </div>

  <!-- Symptoms -->
  <div class="section-title">३. रोगाची मुख्य लक्षणे (Identified Symptoms)</div>
  <ul class="bullet-list">
    ${diagnosis.symptoms.map(s => `<li>${s}</li>`).join('')}
  </ul>

  <!-- Chemical Prescription Table -->
  <div class="section-title">४. रासायनिक फवारणी शिफारस व १५ लिटर पंपासाठी प्रमाण (Chemical Prescription)</div>
  <table>
    <thead>
      <tr>
        <th style="width: 30%;">औषधाचे व्यापारी नाव</th>
        <th style="width: 30%;">रासायनिक घटक</th>
        <th style="width: 25%;">१५ लिटर पंपासाठी प्रमाण</th>
        <th style="width: 15%;">सूचना</th>
      </tr>
    </thead>
    <tbody>
      ${diagnosis.chemicalMedicines.map(m => `
        <tr>
          <td><strong>${m.tradeName}</strong></td>
          <td style="color: #44403c;">${m.activeIngredient}</td>
          <td style="color: #15803d; font-weight: 700;">${m.dosagePer15LPump}</td>
          <td>${m.instructions}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Biological & Organic Remedies -->
  <div class="section-title">५. सेंद्रिय व जैविक उपचार (Biological & Organic Control)</div>
  <ul class="bullet-list">
    ${diagnosis.biologicalRemedies.map(r => `<li>${r}</li>`).join('')}
  </ul>

  <!-- Precautions -->
  <div class="section-title">६. खबरदारी व प्रतिबंधात्मक उपाय (Preventive Precautions)</div>
  <ul class="bullet-list">
    ${diagnosis.precautions.map(p => `<li>${p}</li>`).join('')}
  </ul>

  <!-- Signature & Seal -->
  <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div style="font-size: 11px; color: #78716c;">
      * हे शिफारस पत्र कृषी केंद्र दुकानदारास (Agro-Dealer) दाखवून योग्य औषध खरेदी करू शकता.<br>
      * फवारणी करताना मास्क व हातमोजे वापरा.
    </div>
    <div style="text-align: center; border-top: 1px solid #1c1917; padding-top: 6px; width: 160px; font-weight: 700; font-size: 12px;">
      कृषी डॉक्टर डिजिटल स्वाक्षरी<br>
      <span style="font-size: 10px; color: #15803d; font-weight: normal;">AgroVani AI Specialist</span>
    </div>
  </div>

  <div class="footer">
    AgroVani Digital Agriculture Platform • Solapur Region, Maharashtra • संपर्कासाठी: 1800-180-1551 (किसान कॉल सेंटर)
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
