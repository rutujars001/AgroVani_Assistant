import { SoilHealthCard, FertilizerPrescriptionItem } from '../types';

const STORAGE_KEY_SOIL_CARD = 'agrovani_farmer_soil_card';

export const DEFAULT_SOIL_CARD: SoilHealthCard = {
  sampleNumber: 'SHC-MH-SOL-2026-0482',
  testedDate: '१५ ऑगस्ट २०२६',
  labName: 'जिल्हा मृद चाचणी प्रयोगशाळा, कुर्डूवाडी रोड, सोलापूर',
  ph: 8.2,
  phStatus: 'अल्कधर्मी / चुनखडीयुक्त (Alkaline)',
  organicCarbon: 0.42,
  ocStatus: 'कमी',
  availableN: 185, // kg/ha (Low is <280)
  nStatus: 'कमी',
  availableP: 14.5, // kg/ha (Medium is 10-25)
  pStatus: 'मध्यम',
  availableK: 410, // kg/ha (High is >280)
  kStatus: 'भरपूर',
  electricalConductivity: 0.65, // dS/m (Normal is <1.0)
  calciumCarbonate: 8.5, // % Free Lime / चुनखडी
  overallHealthScore: 68,
  audioAdvisory: 'आपल्या सोलापूरच्या शेतातील मातीचा सामू ८.२ असून चुनखडीचे प्रमाण जास्त आहे. जमिनीत पालाश भरपूर आहे, त्यामुळे पोटॅश खत कमी द्या. सेंद्रिय कर्ब वाढवण्यासाठी शेणखत किंवा गांडूळ खताचा वापर वाढवा आणि सिंगल सुपर फॉस्फेट ऐवजी डीएपी किंवा विद्राव्य खते वापरा, ज्यामुळे एकरी ४ ते ५ हजार रुपयांची बचत होईल.',
  prescriptions: [
    {
      fertilizerName: 'पोटॅश (MOP) खताची बचत',
      quantityPerAcre: 'शिफारशीपेक्षा ५०% कमी (फक्त १५ किलो)',
      timing: 'बेसल डोसच्या वेळी',
      reason: 'माती परीक्षणानुसार जमिनीत नैसर्गिक पालाश (K) ४१० किलो प्रति हेक्टर (भरपूर) आहे.',
      savingEstimate: '₹१,२५० प्रति एकर बचत'
    },
    {
      fertilizerName: 'सेंद्रिय कर्ब व जिप्सम / गंधक (Sulphur)',
      quantityPerAcre: 'एकरी १० किलो बेंटोनाइट सल्फर + ४ ट्रॉली शेणखत',
      timing: 'पेरणीपूर्वी जमिनीत मिसळा',
      reason: 'मातीतील सामू (८.२) संतुलित करण्यासाठी व सूक्ष्म अन्नद्रव्यांची उपलब्धता वाढवण्यासाठी.',
      savingEstimate: 'पिकाची वाढ २०% जोमदार'
    },
    {
      fertilizerName: 'फॉस्फोरिक ॲसिड व विद्राव्य १२:६१:०० (ठिबकद्वारे)',
      quantityPerAcre: 'एकरी ३ लिटर फॉस्फोरिक ॲसिड (महिन्यातून एकदा)',
      timing: 'ठिबक सिंचनातून सोडा',
      reason: 'चुनखडीयुक्त जमिनीत स्फुरद (Phosphorus) मातीत फिक्स होतो, तो विरघळवून मुळांना मिळवून देण्यासाठी.',
      savingEstimate: '₹२,५०० खत बचत व मुळांची जोमदार वाढ'
    },
    {
      fertilizerName: 'नत्र (युरिया) व्यवस्थापन',
      quantityPerAcre: 'एकरी ४० किलो युरिया ३ हप्त्यांत विभागून',
      timing: 'पेरणीनंतर २०, ४० आणि ६० दिवसांनी',
      reason: 'जमिनीत उपलब्ध नत्र कमी असल्याने एकदाच न देता विभागून द्या, जेणेकरून अन्नद्रव्ये वाया जाणार नाहीत.',
      savingEstimate: '१ गोणी युरिया बचत'
    }
  ]
};

class SoilHealthService {
  getSoilCard(): SoilHealthCard {
    if (typeof window === 'undefined') return DEFAULT_SOIL_CARD;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SOIL_CARD);
      if (!stored) {
        this.saveSoilCard(DEFAULT_SOIL_CARD);
        return DEFAULT_SOIL_CARD;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_SOIL_CARD;
    }
  }

  saveSoilCard(card: SoilHealthCard): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_SOIL_CARD, JSON.stringify(card));
    } catch {}
  }

  // Recalculate fertility and recommendations if farmer enters new lab values
  calculateSoilPrescriptions(ph: number, oc: number, n: number, p: number, k: number): SoilHealthCard {
    const isAlkaline = ph > 7.8;
    const isAcidic = ph < 6.5;
    const phStatus = isAlkaline ? 'अल्कधर्मी / चुनखडीयुक्त (Alkaline)' : isAcidic ? 'आम्लधर्मी (Acidic)' : 'सामू योग्य (Neutral)';

    const ocStatus = oc < 0.5 ? 'कमी' : oc <= 0.75 ? 'मध्यम' : 'उत्तम';
    const nStatus = n < 250 ? 'कमी' : n <= 400 ? 'मध्यम' : 'जास्त';
    const pStatus = p < 12 ? 'कमी' : p <= 22 ? 'मध्यम' : 'जास्त';
    const kStatus = k < 150 ? 'कमी' : k <= 300 ? 'मध्यम' : 'भरपूर';

    const prescriptions: FertilizerPrescriptionItem[] = [];

    if (k > 300) {
      prescriptions.push({
        fertilizerName: 'पोटॅश (MOP) बचत सल्ला',
        quantityPerAcre: 'शिफारशीपेक्षा ५०% कमी',
        timing: 'बेसल डोस',
        reason: 'मातीत पालाश अगोदरच भरपूर उपलब्ध असल्याने जास्त पोटॅश टाकणे अनावश्यक आहे.',
        savingEstimate: '₹१,२५० प्रति एकर'
      });
    }

    if (isAlkaline) {
      prescriptions.push({
        fertilizerName: 'सल्फर (गंधक) व शेणखत',
        quantityPerAcre: 'एकरी १० किलो बेंटोनाइट सल्फर',
        timing: 'पूर्वमशागतीच्या वेळी',
        reason: 'सामू कमी करण्यासाठी आणि चुनखडीचा ताण कमी करण्यासाठी.',
        savingEstimate: 'जमिनीची सुपीकता सुधारते'
      });
      prescriptions.push({
        fertilizerName: 'फॉस्फोरिक ॲसिड / १२:६१:००',
        quantityPerAcre: 'एकरी ३ लिटर ड्रिपने',
        timing: 'महिन्यातून एकदा',
        reason: 'स्फुरद मुळांना उपलब्ध करून देण्यासाठी.',
        savingEstimate: '₹२,००० खत बचत'
      });
    }

    if (n < 250) {
      prescriptions.push({
        fertilizerName: 'नत्र (युरिया व निंबोळी पेंड)',
        quantityPerAcre: 'युरिया ३ ते ४ हप्त्यांत विभागून + १०० किलो निंबोळी पेंड',
        timing: 'पिकाच्या वाढीच्या टप्प्यानुसार',
        reason: 'नत्र जमिनीत कमी असल्यामुळे सुरुवातीपासून संतुलित पुरवठा आवश्यक आहे.',
        savingEstimate: 'उत्पादनात १५% वाढ'
      });
    }

    const overallScore = Math.min(100, Math.max(30, Math.round(
      (oc > 0.5 ? 25 : 12) +
      (ph >= 6.5 && ph <= 7.8 ? 25 : 15) +
      (p >= 14 ? 25 : 12) +
      (k >= 200 ? 25 : 15)
    )));

    const newCard: SoilHealthCard = {
      sampleNumber: `SHC-MH-${Date.now().toString().slice(-4)}`,
      testedDate: 'आजची नोंदणी',
      labName: 'सोलापूर कृषी प्रयोगशाळा',
      ph,
      phStatus,
      organicCarbon: oc,
      ocStatus,
      availableN: n,
      nStatus,
      availableP: p,
      pStatus,
      availableK: k,
      kStatus,
      electricalConductivity: 0.6,
      calciumCarbonate: isAlkaline ? 8.0 : 4.0,
      overallHealthScore: overallScore,
      prescriptions,
      audioAdvisory: `माती परीक्षणानुसार सामू ${ph} असून आरोग्य स्कोअर ${overallScore} टक्के आहे. दिलेल्या स्मार्ट खत प्रिस्क्रिप्शननुसार खतांची मात्रा दिल्यास शेती खर्चात बचत होईल.`
    };

    this.saveSoilCard(newCard);
    return newCard;
  }
}

export const soilHealthService = new SoilHealthService();
