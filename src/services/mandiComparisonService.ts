import { MandiComparisonItem, MandiPriceAlert } from '../types';

const STORAGE_KEY_ALERTS = 'agrovani_mandi_price_alerts';

// Realistic live APMC mandi data across Solapur district
export const MULTI_MANDI_DATA: Record<string, MandiComparisonItem[]> = {
  'कांदा': [
    {
      mandiName: 'सोलापूर मुख्य APMC',
      taluka: 'उत्तर सोलापूर',
      distanceKm: 35,
      cropName: 'कांदा',
      variety: 'लाल कांदा (सुपर)',
      minPrice: 1800,
      modalPrice: 2450,
      maxPrice: 2850,
      transportCostPerQuintal: 80,
      marketCessAndHamaliPerQuintal: 25,
      netRealizationPerQuintal: 2345, // 2450 - (80 + 25)
      isBestDeal: true,
      arrivalTons: 1450,
      lastUpdated: 'आज सकाळी १०:३०'
    },
    {
      mandiName: 'पंढरपूर APMC',
      taluka: 'पंढरपूर',
      distanceKm: 8,
      cropName: 'कांदा',
      variety: 'स्थानिक लाल',
      minPrice: 1700,
      modalPrice: 2320,
      maxPrice: 2600,
      transportCostPerQuintal: 25,
      marketCessAndHamaliPerQuintal: 22,
      netRealizationPerQuintal: 2273, // 2320 - (25 + 22)
      isBestDeal: false,
      arrivalTons: 380,
      lastUpdated: 'आज सकाळी ११:००'
    },
    {
      mandiName: 'बार्शी APMC',
      taluka: 'बार्शी',
      distanceKm: 65,
      cropName: 'कांदा',
      variety: 'गावराण कांदा',
      minPrice: 1650,
      modalPrice: 2380,
      maxPrice: 2700,
      transportCostPerQuintal: 140,
      marketCessAndHamaliPerQuintal: 25,
      netRealizationPerQuintal: 2215, // 2380 - (140 + 25)
      isBestDeal: false,
      arrivalTons: 520,
      lastUpdated: 'आज सकाळी १०:००'
    },
    {
      mandiName: 'सांगोला उपबाजार',
      taluka: 'सांगोला',
      distanceKm: 42,
      cropName: 'कांदा',
      variety: 'लाल कांदा',
      minPrice: 1750,
      modalPrice: 2300,
      maxPrice: 2550,
      transportCostPerQuintal: 95,
      marketCessAndHamaliPerQuintal: 20,
      netRealizationPerQuintal: 2185, // 2300 - (95 + 20)
      isBestDeal: false,
      arrivalTons: 190,
      lastUpdated: 'आज सकाळी ०९:४५'
    }
  ],

  'डाळिंब': [
    {
      mandiName: 'सोलापूर मुख्य APMC',
      taluka: 'उत्तर सोलापूर',
      distanceKm: 35,
      cropName: 'डाळिंब',
      variety: 'भगवा (सुपर क्वॉलिटी)',
      minPrice: 9500,
      modalPrice: 14200,
      maxPrice: 18500,
      transportCostPerQuintal: 120,
      marketCessAndHamaliPerQuintal: 40,
      netRealizationPerQuintal: 14040, // 14200 - (120 + 40)
      isBestDeal: true,
      arrivalTons: 280,
      lastUpdated: 'आज सकाळी ११:१५'
    },
    {
      mandiName: 'सांगोला डाळिंब मार्केट',
      taluka: 'सांगोला',
      distanceKm: 42,
      cropName: 'डाळिंब',
      variety: 'भगवा',
      minPrice: 9000,
      modalPrice: 13800,
      maxPrice: 17500,
      transportCostPerQuintal: 100,
      marketCessAndHamaliPerQuintal: 35,
      netRealizationPerQuintal: 13665, // 13800 - (100 + 35)
      isBestDeal: false,
      arrivalTons: 340,
      lastUpdated: 'आज सकाळी १०:४५'
    },
    {
      mandiName: 'पंढरपूर APMC',
      taluka: 'पंढरपूर',
      distanceKm: 8,
      cropName: 'डाळिंब',
      variety: 'भगवा स्थानिक',
      minPrice: 8500,
      modalPrice: 12900,
      maxPrice: 16000,
      transportCostPerQuintal: 30,
      marketCessAndHamaliPerQuintal: 30,
      netRealizationPerQuintal: 12840, // 12900 - (30 + 30)
      isBestDeal: false,
      arrivalTons: 110,
      lastUpdated: 'आज सकाळी ११:३०'
    }
  ],

  'ज्वारी': [
    {
      mandiName: 'सोलापूर APMC (मालदांडी केंद्र)',
      taluka: 'उत्तर सोलापूर',
      distanceKm: 35,
      cropName: 'ज्वारी',
      variety: 'एम-३५-१ (मालदांडी)',
      minPrice: 3800,
      modalPrice: 4600,
      maxPrice: 5200,
      transportCostPerQuintal: 70,
      marketCessAndHamaliPerQuintal: 25,
      netRealizationPerQuintal: 4505, // 4600 - (70 + 25)
      isBestDeal: true,
      arrivalTons: 410,
      lastUpdated: 'आज सकाळी ०९:३०'
    },
    {
      mandiName: 'मंगळवेढा APMC',
      taluka: 'मंगळवेढा',
      distanceKm: 28,
      cropName: 'ज्वारी',
      variety: 'मालदांडी स्पेशल',
      minPrice: 3900,
      modalPrice: 4550,
      maxPrice: 5150,
      transportCostPerQuintal: 60,
      marketCessAndHamaliPerQuintal: 22,
      netRealizationPerQuintal: 4468, // 4550 - (60 + 22)
      isBestDeal: false,
      arrivalTons: 220,
      lastUpdated: 'आज सकाळी १०:००'
    },
    {
      mandiName: 'पंढरपूर APMC',
      taluka: 'पंढरपूर',
      distanceKm: 8,
      cropName: 'ज्वारी',
      variety: 'हायब्रिड / मालदांडी',
      minPrice: 3600,
      modalPrice: 4350,
      maxPrice: 4900,
      transportCostPerQuintal: 20,
      marketCessAndHamaliPerQuintal: 20,
      netRealizationPerQuintal: 4310, // 4350 - (20 + 20)
      isBestDeal: false,
      arrivalTons: 180,
      lastUpdated: 'आज सकाळी १०:१५'
    }
  ]
};

const DEFAULT_ALERTS: MandiPriceAlert[] = [
  {
    id: 'alt-1',
    cropName: 'कांदा',
    targetPrice: 2500,
    condition: 'above',
    isTriggered: true,
    createdAt: '२ दिवस आधी'
  },
  {
    id: 'alt-2',
    cropName: 'डाळिंब',
    targetPrice: 15000,
    condition: 'above',
    isTriggered: false,
    createdAt: 'आज'
  }
];

class MandiComparisonService {
  // Get comparison list for a crop
  getMandiComparison(cropName: string): MandiComparisonItem[] {
    const list = MULTI_MANDI_DATA[cropName] || MULTI_MANDI_DATA['कांदा'];
    return list;
  }

  // Get best deal summary
  getBestDeal(cropName: string): MandiComparisonItem {
    const list = this.getMandiComparison(cropName);
    return list.find((m) => m.isBestDeal) || list[0];
  }

  // Calculate audio recommendation
  getAudioRecommendation(cropName: string): string {
    const best = this.getBestDeal(cropName);
    return `आज ${cropName} पिकासाठी ${best.mandiName} मध्ये सर्वाधिक निव्वळ नफा मिळत आहे. वाहतूक खर्च वजा जाता प्रति क्विंटल ${best.netRealizationPerQuintal} रुपये निव्वळ हातात मिळतील.`;
  }

  // Alerts Management
  getAlerts(): MandiPriceAlert[] {
    if (typeof window === 'undefined') return DEFAULT_ALERTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALERTS);
      if (!stored) {
        this.saveAlerts(DEFAULT_ALERTS);
        return DEFAULT_ALERTS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_ALERTS;
    }
  }

  saveAlerts(alerts: MandiPriceAlert[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    } catch {}
  }

  addAlert(cropName: string, targetPrice: number): MandiPriceAlert {
    const list = this.getAlerts();
    const newAlert: MandiPriceAlert = {
      id: `alt-${Date.now()}`,
      cropName,
      targetPrice,
      condition: 'above',
      isTriggered: false,
      createdAt: 'आज'
    };
    const updated = [newAlert, ...list];
    this.saveAlerts(updated);
    return newAlert;
  }

  deleteAlert(id: string): void {
    const list = this.getAlerts().filter((a) => a.id !== id);
    this.saveAlerts(list);
  }
}

export const mandiComparisonService = new MandiComparisonService();
