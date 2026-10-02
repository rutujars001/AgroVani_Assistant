export interface CropInfo {
  id: string;
  nameMr: string;
  nameEn: string;
  category: 'cereal' | 'pulse' | 'oilseed' | 'cash' | 'vegetable' | 'fruit';
  soilType: string;
  sowingSeason: string;
  waterRequirement: string;
  expectedYield: string;
  keyPractices: string[];
  icon: string;
  marathiAudioText: string;
}

export interface MandiPrice {
  id: string;
  cropNameMr: string;
  cropNameEn: string;
  variety: string;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  arrivalQty: string;
  mandiLocation: string;
  date: string;
  priceTrend: 'up' | 'down' | 'stable';
  changeAmount: number;
  audioText: string;
}

export interface WeatherData {
  taluka: string;
  district: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  clouds: number;
  rainForecast: string;
  advisoryMr: string;
  forecast: {
    day: string;
    tempMin: number;
    tempMax: number;
    condition: string;
    icon: string;
  }[];
  audioText: string;
}

export interface GovernmentScheme {
  id: string;
  titleMr: string;
  titleEn: string;
  category: string;
  subsidyAmount: string;
  eligibility: string[];
  documentsRequired: string[];
  applicationPortal: string;
  deadline: string;
  summaryMr: string;
  audioText: string;
}

export interface ChemicalMedicine {
  tradeName: string;
  activeIngredient: string;
  dosagePer15LPump: string;
  instructions: string;
}

export interface PlantixDiseaseDiagnosis {
  id: string;
  crop: string;
  diseaseNameMr: string;
  diseaseNameEn: string;
  scientificName: string;
  pathogenType: 'बुरशीजन्य (Fungal)' | 'जिवाणूजन्य (Bacterial)' | 'विषाणूजन्य (Viral)' | 'कीड / अळी (Pest)' | 'पोषकद्रव्य कमतरता (Nutrient)';
  confidenceScore: number;
  severity: 'low' | 'medium' | 'high';
  symptoms: string[];
  precautions: string[];
  chemicalMedicines: ChemicalMedicine[];
  biologicalRemedies: string[];
  audioSummary: string;
  timestamp: string;
  imageUri?: string;
  cropStage?: string;
}

export interface CropDisease {
  id: string;
  nameMr: string;
  nameEn: string;
  affectedCrops: string[];
  severity: 'low' | 'medium' | 'high';
  symptoms: string[];
  biologicalTreatment: string[];
  chemicalTreatment: string[];
  prevention: string[];
  imagePlaceholder: string;
  audioText: string;
}

export interface DoctorChatMessage {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  timestamp: string;
  audioText?: string;
  diagnosis?: PlantixDiseaseDiagnosis;
}

export interface CropGrowthStage {
  cropName: string;
  stage: string;
  daysPlanted: number;
  healthStatus: 'उत्तम (Healthy)' | 'सावधगिरी (Alert)' | 'रोग प्रादुर्भाव (Infected)';
  riskAdvisory: string;
}

export interface CropCalendarTask {
  id: string;
  cropName: string;
  cropIcon: string;
  stageName: string;
  dayNumber: number;
  taskCategory: 'पाणी (Irrigation)' | 'खत (Fertilizer)' | 'फवारणी (Spray)' | 'मशागत (Field Work)' | 'काढणी (Harvest)';
  taskTitle: string;
  taskDescription: string;
  timing: string;
  priority: 'उच्च (High)' | 'मध्यम (Medium)' | 'नियमित (Regular)';
  audioText: string;
  isCompleted: boolean;
}

export interface FarmerProfile {
  id: string;
  fullName: string;
  mobileNumber: string;
  village: string;
  taluka: string;
  district: string;
  landAreaAcre: number;
  soilType: string;
  irrigationType: string;
  selectedPrimaryCrops: string[];
  cropGrowthStages: CropGrowthStage[];
  isLoggedIn: boolean;
  isPinLocked: boolean;
  pinHash?: string;
  aadhaarMasked: string;
  surveyGatNumber: string;
  dbtAccountMasked: string;
  lastSyncedAt: string;
  diagnosisHistory: PlantixDiseaseDiagnosis[];
}

export interface SyncQueueItem {
  id: string;
  action: 'disease_query' | 'profile_update' | 'voice_log';
  timestamp: string;
  payload: any;
  status: 'pending' | 'synced' | 'failed';
}

// 2. Farm Expense & Profit Tracker Types
export interface FarmTransaction {
  id: string;
  date: string;
  type: 'expense' | 'income';
  crop: string;
  category: 'बियाणे' | 'खते' | 'कीटकनाशके' | 'मजुरी' | 'सिंचन व डिझेल' | 'यंत्रसामग्री' | 'वाहतूक' | 'उत्पन्न / विक्री';
  amount: number;
  note: string;
  audioTranscript?: string;
}

// 3. Early Warning & Weather Hazard Types
export interface WeatherHazardAlert {
  id: string;
  severity: 'warning' | 'critical' | 'advisory';
  titleMr: string;
  messageMr: string;
  affectedCrops: string[];
  advisoryActionMr: string;
  validUntil: string;
  audioText: string;
  source: string;
}

// 4. Soil Health Card & Smart Fertilizer Prescription Types
export interface FertilizerPrescriptionItem {
  fertilizerName: string;
  quantityPerAcre: string;
  timing: string;
  reason: string;
  savingEstimate: string;
}

export interface SoilHealthCard {
  sampleNumber: string;
  testedDate: string;
  labName: string;
  ph: number;
  phStatus: 'आम्लधर्मी (Acidic)' | 'सामू योग्य (Neutral)' | 'अल्कधर्मी / चुनखडीयुक्त (Alkaline)';
  organicCarbon: number; // in %
  ocStatus: 'कमी' | 'मध्यम' | 'उत्तम';
  availableN: number; // kg/ha
  nStatus: 'कमी' | 'मध्यम' | 'जास्त';
  availableP: number; // kg/ha
  pStatus: 'कमी' | 'मध्यम' | 'जास्त';
  availableK: number; // kg/ha
  kStatus: 'कमी' | 'मध्यम' | 'भरपूर';
  electricalConductivity: number; // dS/m
  calciumCarbonate: number; // %
  overallHealthScore: number; // 0-100
  prescriptions: FertilizerPrescriptionItem[];
  audioAdvisory: string;
}

// 5. Mandi Comparison & Price Alert Types
export interface MandiComparisonItem {
  mandiName: string;
  taluka: string;
  distanceKm: number;
  cropName: string;
  variety: string;
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
  transportCostPerQuintal: number;
  marketCessAndHamaliPerQuintal: number;
  netRealizationPerQuintal: number;
  isBestDeal: boolean;
  arrivalTons: number;
  lastUpdated: string;
}

export interface MandiPriceAlert {
  id: string;
  cropName: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isTriggered: boolean;
  createdAt: string;
}

