/**
 * AgroVani Natural Language Understanding (NLU) Engine
 * Solapur dialect (Mayboli) intent parsing and entity recognition
 */

export interface ParsedIntent {
  intent: 'crop_info' | 'weather' | 'mandi_prices' | 'government_schemes' | 'krushi_doctor' | 'my_farm' | 'crop_calendar' | 'farm_finance' | 'soil_health' | 'mandi_comparison' | 'unknown';
  targetCrop?: string;
  targetTaluka?: string;
  confidence: number;
  confirmationQuestion: string; // The auditory confirmation question in Marathi
  suggestedActionTitle: string;
}

export function parseFarmerQuery(transcript: string): ParsedIntent {
  const query = transcript.toLowerCase().trim();

  // 0. Farm Finance & Expense Tracker Intent
  if (
    query.includes('जमा खर्च') ||
    query.includes('हिशोब') ||
    query.includes('खर्च वही') ||
    query.includes('खर्च किती') ||
    query.includes('नफा किती') ||
    query.includes('नफा तोटा') ||
    query.includes('हिशेब')
  ) {
    return {
      intent: 'farm_finance',
      confidence: 0.96,
      confirmationQuestion: 'तुम्हाला शेतीचा जमा-खर्च हिशोब व नफा-तोटा पहायचा आहे का?',
      suggestedActionTitle: 'शेतकरी जमा-खर्च वही'
    };
  }

  // 0.1 Soil Health Card Intent
  if (
    query.includes('माती परीक्षण') ||
    query.includes('सॉईल कार्ड') ||
    query.includes('सामू') ||
    query.includes('ph') ||
    query.includes('जमीन तपासणी') ||
    query.includes('चुनखडी') ||
    query.includes('खत प्रिस्क्रिप्शन')
  ) {
    return {
      intent: 'soil_health',
      confidence: 0.95,
      confirmationQuestion: 'तुम्हाला आपल्या शेताचे डिजिटल माती परीक्षण कार्ड व स्मार्ट खत प्रिस्क्रिप्शन पहायचे आहे का?',
      suggestedActionTitle: 'माती परीक्षण कार्ड'
    };
  }

  // 0.2 Multi-Mandi Comparison Intent
  if (
    query.includes('तुलना') ||
    query.includes('कुठे जास्त भाव') ||
    query.includes('कोणत्या बाजारात') ||
    query.includes('कोणत्या मार्केटला') ||
    query.includes('भाव अलर्ट') ||
    query.includes('जास्त दर कुठे')
  ) {
    let crop = detectCrop(query) || 'कांदा';
    return {
      intent: 'mandi_comparison',
      targetCrop: crop,
      confidence: 0.95,
      confirmationQuestion: `तुम्हाला ${crop} पिकासाठी सोलापूर, पंढरपूर व बार्शी बाजार समित्यांचे तुलनात्मक दर पहायचे आहेत का?`,
      suggestedActionTitle: `${crop} बाजारभाव तुलना`
    };
  }

  // 0.3 Crop Calendar / Daily Tasks Intent
  if (
    query.includes('दिनदर्शिका') ||
    query.includes('कॅलेंडर') ||
    query.includes('आजचे काम') ||
    query.includes('आजची कामे') ||
    query.includes('कामे काय') ||
    query.includes('काय काम') ||
    query.includes('शेड्युल') ||
    query.includes('वाढीचा टप्पा')
  ) {
    let crop = detectCrop(query);
    return {
      intent: 'crop_calendar',
      targetCrop: crop,
      confidence: 0.96,
      confirmationQuestion: crop
        ? `तुम्हाला ${crop} पिकाची आजची दैनिक कामे व पीक दिनदर्शिका पहायची आहे का?`
        : 'तुम्हाला आपल्या सर्व पिकांची आजची कामे व पीक दिनदर्शिका पहायची आहे का?',
      suggestedActionTitle: crop ? `${crop} आजची कामे` : 'पीक दिनदर्शिका'
    };
  }

  // 1. Mandi Prices Intent
  if (
    query.includes('भाव') ||
    query.includes('दर') ||
    query.includes('बाजार') ||
    query.includes('मंडी') ||
    query.includes('किंमत') ||
    query.includes('कितीला') ||
    query.includes('चालू हाय')
  ) {
    let crop = detectCrop(query);
    return {
      intent: 'mandi_prices',
      targetCrop: crop,
      confidence: 0.95,
      confirmationQuestion: crop
        ? `तुम्हाला ${crop} चा सोलापूर बाजारभाव जाणून घ्यायचा आहे का?`
        : 'तुम्हाला सोलापूर कृषी उत्पन्न बाजार समितीचे आजचे बाजारभाव पहायचे आहेत का?',
      suggestedActionTitle: crop ? `${crop} बाजारभाव` : 'सोलापूर बाजारभाव'
    };
  }

  // 2. Weather Intent
  if (
    query.includes('हवामान') ||
    query.includes('पाऊस') ||
    query.includes('ऊन') ||
    query.includes('तापमान') ||
    query.includes('ढगाळ') ||
    query.includes('गारपीट') ||
    query.includes('वारा')
  ) {
    let taluka = detectTaluka(query) || 'सोलापूर';
    return {
      intent: 'weather',
      targetTaluka: taluka,
      confidence: 0.92,
      confirmationQuestion: `तुम्हाला ${taluka} परिसराचा हवामान अंदाज जाणून घ्यायचा आहे का?`,
      suggestedActionTitle: `${taluka} हवामान अंदाज`
    };
  }

  // 3. Fertilizer / Crop Health Advice -> Krushi Doctor
  if (
    query.includes('खत') ||
    query.includes('युरिया') ||
    query.includes('डीएपी') ||
    query.includes('dap') ||
    query.includes('मात्रा') ||
    query.includes('डोस') ||
    query.includes('शेती सल्ला') ||
    query.includes('माझे शेत')
  ) {
    let crop = detectCrop(query) || 'ऊस';
    return {
      intent: 'krushi_doctor',
      targetCrop: crop,
      confidence: 0.91,
      confirmationQuestion: `तुम्हाला ${crop} पिकासाठी कृषी डॉक्टरचा सल्ला हवा आहे का?`,
      suggestedActionTitle: `${crop} कृषी डॉक्टर सल्ला`
    };
  }

  // 4. Disease / Krushi Doctor Intent
  if (
    query.includes('रोग') ||
    query.includes('कीड') ||
    query.includes('अळी') ||
    query.includes('करपा') ||
    query.includes('तेल्या') ||
    query.includes('औषध') ||
    query.includes('फवारणी') ||
    query.includes('पिवळे') ||
    query.includes('वाळले') ||
    query.includes('डॉक्टर')
  ) {
    let crop = detectCrop(query);
    return {
      intent: 'krushi_doctor',
      targetCrop: crop,
      confidence: 0.94,
      confirmationQuestion: crop
        ? `तुम्हाला ${crop} वरील रोग व फवारणी उपाय जाणून घ्यायचे आहेत का?`
        : 'तुम्हाला कृषी डॉक्टरकडून पिकावरील रोग निदान हवे आहे का?',
      suggestedActionTitle: crop ? `${crop} रोग निदान` : 'कृषी डॉक्टर'
    };
  }

  // 5. Government Schemes Intent
  if (
    query.includes('योजना') ||
    query.includes('विमा') ||
    query.includes('अनुदान') ||
    query.includes('सबसिडी') ||
    query.includes('पीएम किसान') ||
    query.includes('नमो शेतकरी') ||
    query.includes('शेततळे') ||
    query.includes('ठिबक') ||
    query.includes('पैसे')
  ) {
    return {
      intent: 'government_schemes',
      confidence: 0.90,
      confirmationQuestion: 'तुम्हाला शासकीय योजना व अनुदानांची माहिती हवी आहे का?',
      suggestedActionTitle: 'शासकीय योजना'
    };
  }

  // 6. Crop Info Intent
  const matchedCrop = detectCrop(query);
  if (
    matchedCrop ||
    query.includes('पीक') ||
    query.includes('माहिती') ||
    query.includes('पेरणी') ||
    query.includes('वाण') ||
    query.includes('सांगा') ||
    query.includes('बद्दल') ||
    query.includes('बद्दल सांगा') ||
    query.includes('विषयी') ||
    query.includes('कसे करावे') ||
    query.includes('कसं करायचं') ||
    query.includes('लागवड') ||
    query.includes('उत्पादन')
  ) {
    return {
      intent: 'crop_info',
      targetCrop: matchedCrop || 'ज्वारी',
      confidence: 0.88,
      confirmationQuestion: matchedCrop
        ? `तुम्हाला ${matchedCrop} पिकाची लागवड व व्यवस्थापन माहिती पहायची आहे का?`
        : 'तुम्हाला पिकांची सुधारित शेती पद्धती माहिती हवी आहे का?',
      suggestedActionTitle: matchedCrop ? `${matchedCrop} संपूर्ण माहिती` : 'पीक माहिती'
    };
  }

  // Fallback — try to detect crop and open crop info
  const fallbackCrop = detectCrop(query);
  return {
    intent: fallbackCrop ? 'crop_info' : 'crop_info',
    targetCrop: fallbackCrop,
    confidence: 0.5,
    confirmationQuestion: fallbackCrop
      ? `तुम्ही "${transcript}" असे विचारले. ${fallbackCrop} ची माहिती उघडू का?`
      : `तुम्ही "${transcript}" असे विचारले आहे. पीक माहिती उघडू का?`,
    suggestedActionTitle: fallbackCrop ? `${fallbackCrop} माहिती` : 'कृषी सहाय्यक'
  };
}

function detectCrop(text: string): string | undefined {
  const map: Record<string, string> = {
    'ज्वारी': 'ज्वारी',
    'मालदांडी': 'ज्वारी',
    'तूर': 'तूर',
    'तुरी': 'तूर',
    'तुराची': 'तूर',
    'हरभरा': 'हरभरा',
    'चना': 'हरभरा',
    'कांदा': 'कांदा',
    'कांद्या': 'कांदा',
    'कांद्याच': 'कांदा',
    'कांद्यावर': 'कांदा',
    'सोयाबीन': 'सोयाबीन',
    'शेंगदाणा': 'शेंगदाणे',
    'शेंगदाण्या': 'शेंगदाणे',
    'भुईमूग': 'शेंगदाणे',
    'कापूस': 'कापूस',
    'कपाशी': 'कापूस',
    'कापसाच': 'कापूस',
    'मका': 'मका',
    'बाजरी': 'बाजरी',
    'ऊस': 'ऊस',
    'उसा': 'ऊस',
    'उसाच': 'ऊस',
    'टोमॅटो': 'टोमॅटो',
    'टमाटे': 'टोमॅटो',
    'डाळिंब': 'डाळिंब',
    'डाळिंबा': 'डाळिंब',
    'डाळिंबाच': 'डाळिंब',
    'डाळिंबावर': 'डाळिंब',
    'द्राक्ष': 'द्राक्षे',
    'द्राक्षे': 'द्राक्षे',
    'सूर्यफूल': 'सूर्यफूल',
    'गहू': 'गहू',
    'गव्हाच': 'गहू',
  };

  for (const [key, crop] of Object.entries(map)) {
    if (text.includes(key)) {
      return crop;
    }
  }
  return undefined;
}

function detectTaluka(text: string): string | undefined {
  const talukas = [
    'पंढरपूर',
    'बार्शी',
    'सांगोला',
    'करमाळा',
    'माढा',
    'माळशिरस',
    'मंगळवेढा',
    'मोहोळ',
    'अक्कलकोट',
    'उत्तर सोलापूर',
    'दक्षिण सोलापूर',
    'सोलापूर'
  ];

  for (const t of talukas) {
    if (text.includes(t)) {
      return t;
    }
  }
  return undefined;
}
