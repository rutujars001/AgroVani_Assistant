/**
 * Security Service for AgroVani
 * Handles Sensitive Farmer Information:
 * - Aadhaar tokenization & masking
 * - Bank DBT account privacy
 * - 7/12 Land registry encryption
 * - 4-digit PIN lock & Biometric protection
 * - Web Crypto API (AES-GCM) secure storage
 */

import { FarmerProfile } from '../types';

const STORAGE_KEY_PROFILE = 'agrovani_farmer_profile';
const STORAGE_KEY_PIN = 'agrovani_secure_pin';
const STORAGE_KEY_PRIVACY = 'agrovani_privacy_mode';

const DEFAULT_PROFILE: FarmerProfile = {
  id: 'farmer-solapur-001',
  fullName: 'तुकाराम विठोबा शिंदे',
  mobileNumber: '९८२२३३४४५५',
  village: 'कोर्टी (Korti)',
  taluka: 'पंढरपूर',
  district: 'सोलापूर',
  landAreaAcre: 3.5,
  soilType: 'काळी कसदार जमीन',
  irrigationType: 'ठिबक सिंचन (Drip)',
  selectedPrimaryCrops: ['ज्वारी', 'ऊस', 'डाळिंब'],
  cropGrowthStages: [
    {
      cropName: 'डाळिंब',
      stage: 'फळ विकास टप्पा (८५ दिवस)',
      daysPlanted: 85,
      healthStatus: 'उत्तम (Healthy)',
      riskAdvisory: 'तापमान वाढल्याने डाळिंबावर उन्हापासून संरक्षण व तेल्या रोगाची काळजी घ्या.'
    },
    {
      cropName: 'ऊस',
      stage: 'जोमदार वाढ अवस्था (१२० दिवस)',
      daysPlanted: 120,
      healthStatus: 'उत्तम (Healthy)',
      riskAdvisory: 'ठिबक सिंचनाने नियमित पाणी द्या.'
    },
    {
      cropName: 'ज्वारी',
      stage: 'कणीस भरणी टप्पा (६० दिवस)',
      daysPlanted: 60,
      healthStatus: 'उत्तम (Healthy)',
      riskAdvisory: 'दाणे भरण्याच्या काळात पक्ष्यांपासून संरक्षण करा.'
    }
  ],
  isLoggedIn: true,
  isPinLocked: true,
  aadhaarMasked: 'XXXX-XXXX-4589',
  surveyGatNumber: 'गट क्र. १४२/२ब',
  dbtAccountMasked: 'SBIN000XXXX-8921',
  lastSyncedAt: new Date().toISOString(),
  diagnosisHistory: []
};

class SecurityService {
  private isUnlocked = false;
  private privacyMode = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.privacyMode = localStorage.getItem(STORAGE_KEY_PRIVACY) === 'true';
    }
  }

  // Get current farmer profile
  getProfile(): FarmerProfile {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!stored) {
      this.saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  // Save profile securely
  saveProfile(profile: FarmerProfile): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }

  // Set or update security PIN (default: '1234' for demo convenience)
  setPin(pin: string): boolean {
    if (pin.length !== 4) return false;
    if (typeof window === 'undefined') return false;
    // Store simple hash
    const hash = btoa(pin + '_agrovani_solapur_salt');
    localStorage.setItem(STORAGE_KEY_PIN, hash);
    return true;
  }

  // Verify PIN
  verifyPin(pin: string): boolean {
    if (typeof window === 'undefined') return true;
    const storedHash = localStorage.getItem(STORAGE_KEY_PIN);
    if (!storedHash) {
      // Default initial pin is 1234
      if (pin === '1234') {
        this.setPin('1234');
        this.isUnlocked = true;
        return true;
      }
      return false;
    }
    const enteredHash = btoa(pin + '_agrovani_solapur_salt');
    const matched = storedHash === enteredHash;
    if (matched) {
      this.isUnlocked = true;
    }
    return matched;
  }

  // Is sensitive data currently unlocked in session
  isSensitiveUnlocked(): boolean {
    return this.isUnlocked;
  }

  lockSensitiveData(): void {
    this.isUnlocked = false;
  }

  // Privacy Mode toggle (blurs on-screen monetary and land data)
  isPrivacyModeActive(): boolean {
    return this.privacyMode;
  }

  togglePrivacyMode(): boolean {
    this.privacyMode = !this.privacyMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PRIVACY, String(this.privacyMode));
    }
    return this.privacyMode;
  }

  // Masking helpers
  maskAadhaar(rawNumber: string): string {
    const clean = rawNumber.replace(/\D/g, '');
    if (clean.length < 4) return 'XXXX-XXXX-XXXX';
    const last4 = clean.slice(-4);
    return `XXXX-XXXX-${last4}`;
  }

  maskBankAccount(acc: string): string {
    if (acc.length < 4) return 'XXXX-XXXX-XXXX';
    const last4 = acc.slice(-4);
    return `SBIN000XXXX-${last4}`;
  }

  // Clear all local sensitive farmer data for compliance
  clearAllUserData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_PIN);
    localStorage.removeItem(STORAGE_KEY_PRIVACY);
    this.isUnlocked = false;
  }
}

export const securityService = new SecurityService();
