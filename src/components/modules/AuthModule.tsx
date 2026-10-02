import React, { useState } from 'react';
import { ArrowLeft, UserPlus, LogIn, Shield, MapPin, CheckCircle2, Smartphone, Lock, Sprout, Droplets, Layers } from 'lucide-react';
import { SOLAPUR_TALUKAS } from '../../data/agriculturalData';
import { FarmerProfile } from '../../types';
import { securityService } from '../../services/securityService';
import { speechService } from '../../services/speechService';

interface AuthModuleProps {
  onBack: () => void;
  onAuthSuccess: (profile: FarmerProfile) => void;
}

export const AuthModule: React.FC<AuthModuleProps> = ({ onBack, onAuthSuccess }) => {
  const [tab, setTab] = useState<'register' | 'login'>('login');
  const currentProfile = securityService.getProfile();

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regTaluka, setRegTaluka] = useState('पंढरपूर');
  const [regVillage, setRegVillage] = useState('');
  const [regLandAcre, setRegLandAcre] = useState('3.0');
  const [regSoil, setRegSoil] = useState('काळी कसदार जमीन');
  const [regIrrigation, setRegIrrigation] = useState('ठिबक सिंचन (Drip)');
  const [regPin, setRegPin] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['ज्वारी', 'कांदा', 'डाळिंब']);
  const [errorMsg, setErrorMsg] = useState('');

  // Login Form State
  const [loginMobile, setLoginMobile] = useState(currentProfile?.mobileNumber || '');
  const [loginPin, setLoginPin] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const AVAILABLE_CROPS = [
    'ज्वारी', 'कांदा', 'डाळिंब', 'ऊस', 'तूर',
    'कापूस', 'हरभरा', 'गहू', 'सोयाबीन', 'टोमॅटो', 'द्राक्षे'
  ];

  const toggleCrop = (crop: string) => {
    speechService.hapticFeedback(25);
    if (selectedCrops.includes(crop)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter(c => c !== crop));
      }
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    speechService.hapticFeedback(50);

    if (!regName.trim()) {
      setErrorMsg('कृपया तुमचे नाव प्रविष्ट करा');
      return;
    }
    if (regMobile.length < 10) {
      setErrorMsg('कृपया १०-अंकी वैध मोबाईल नंबर प्रविष्ट करा');
      return;
    }
    if (regPin.length !== 4) {
      setErrorMsg('कृपया ४-अंकी सुरक्षा पिन सेट करा');
      return;
    }

    const newProfile: FarmerProfile = {
      id: 'farmer_' + Date.now(),
      fullName: regName.trim(),
      mobileNumber: regMobile.trim(),
      village: regVillage.trim() || 'सोलापूर ग्रामीण',
      taluka: regTaluka,
      district: 'सोलापूर',
      landAreaAcre: parseFloat(regLandAcre) || 2.5,
      soilType: regSoil,
      irrigationType: regIrrigation,
      selectedPrimaryCrops: selectedCrops,
      cropGrowthStages: selectedCrops.map(c => ({
        cropName: c,
        stage: c === 'डाळिंब' ? 'फळ विकास टप्पा (Fruit Development)' : c === 'कांदा' ? 'कांदा फुगवणी टप्पा' : 'वाढ अवस्था (Vegetative)',
        daysPlanted: 45,
        healthStatus: 'उत्तम (Healthy)',
        riskAdvisory: `${c} पिकासाठी हवामान अनुकूल आहे. वेळेवर पाणी व निंदणी करा.`
      })),
      isLoggedIn: true,
      isPinLocked: true,
      aadhaarMasked: 'XXXX-XXXX-' + regMobile.slice(-4),
      surveyGatNumber: 'गट क्र. ' + Math.floor(Math.random() * 200 + 1) + '/१',
      dbtAccountMasked: 'SBIN000XXXX-' + regMobile.slice(-4),
      lastSyncedAt: new Date().toISOString(),
      diagnosisHistory: currentProfile.diagnosisHistory || []
    };

    securityService.saveProfile(newProfile);
    securityService.setPin(regPin);
    speechService.playTone('success');
    speechService.speak(`नमस्कार ${regName}, तुमची नोंदणी यशस्वी झाली आहे. अ‍ॅग्रोवाणी मध्ये आपले स्वागत!`);
    onAuthSuccess(newProfile);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    speechService.hapticFeedback(50);

    if (isOtpMode) {
      if (otpCode === '1234' || otpCode.length === 4) {
        // Successful login
        const p = securityService.getProfile();
        p.isLoggedIn = true;
        securityService.saveProfile(p);
        speechService.playTone('success');
        speechService.speak(`स्वागत आहे ${p.fullName}! तुमचे शेत डॅशबोर्ड उघडत आहे.`);
        onAuthSuccess(p);
      } else {
        setErrorMsg('चुकीचा ओटीपी! चाचणीसाठी १२३४ वापरा.');
      }
      return;
    }

    if (securityService.verifyPin(loginPin)) {
      const p = securityService.getProfile();
      p.isLoggedIn = true;
      securityService.saveProfile(p);
      speechService.playTone('success');
      speechService.speak(`स्वागत आहे ${p.fullName}! लॉगिन यशस्वी झाले.`);
      onAuthSuccess(p);
    } else {
      setErrorMsg('चुकीचा पिन! योग्य ४-अंकी पिन टाका (चाचणी पिन: 1234)');
      speechService.playTone('error');
    }
  };

  const handleSendOtp = () => {
    if (loginMobile.length < 10) {
      setErrorMsg('कृपया वैध मोबाईल नंबर टाका');
      return;
    }
    speechService.hapticFeedback(40);
    setOtpSent(true);
    setOtpCode('1234');
    setErrorMsg('');
    speechService.playTone('confirm');
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-stone-50 select-none pb-12 overflow-y-auto">
      {/* Header */}
      <div className="bg-emerald-800 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <button onClick={onBack} className="p-1.5 rounded-full hover:bg-emerald-700 cursor-pointer text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold">शेतकरी खाते व प्रोफाइल</h2>
            <p className="text-xs text-emerald-200">प्लॅन्टिक्स पद्धतीनुसार शेती व्यवस्थापन</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-stone-200 p-1 rounded-2xl mb-4 text-xs font-bold">
        <button
          onClick={() => {
            setTab('login');
            setErrorMsg('');
            speechService.hapticFeedback(20);
          }}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            tab === 'login' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>शेतकरी लॉगिन (Login)</span>
        </button>
        <button
          onClick={() => {
            setTab('register');
            setErrorMsg('');
            speechService.hapticFeedback(20);
          }}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            tab === 'register' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>नवीन नोंदणी (Register)</span>
        </button>
      </div>

      {errorMsg && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Tab 1: LOGIN FORM */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="text-center pb-1">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-stone-900">तुमच्या शेतात प्रवेश करा</h3>
            <p className="text-xs text-stone-500">तुमची पिके, रोग तपासणी व सल्ले पाहण्यासाठी लॉगिन करा</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">मोबाईल नंबर</label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="tel"
                maxLength={10}
                value={loginMobile}
                onChange={(e) => setLoginMobile(e.target.value)}
                placeholder="९८२२xxxxxx"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:outline-emerald-600"
              />
            </div>
          </div>

          {!isOtpMode ? (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">४-अंकी सुरक्षा पिन</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  maxLength={4}
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="पिन टाका (उदा. 1234)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:outline-emerald-600"
                />
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                डीफॉल्ट चाचणी पिन: <strong>1234</strong>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">४-अंकी ओटीपी</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="ओटीपी टाका (1234)"
                  className="flex-1 px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:outline-emerald-600 text-center tracking-widest"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-3 rounded-xl"
                >
                  {otpSent ? 'पुन्हा पाठवा' : 'ओटीपी मिळवा'}
                </button>
              </div>
              {otpSent && <p className="text-[11px] text-emerald-700 font-bold mt-1">✓ ओटीपी पाठवला: १२३४</p>}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md active:scale-98 transition cursor-pointer"
          >
            लॉगिन करा व शेतात जा
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsOtpMode(!isOtpMode);
                setErrorMsg('');
              }}
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-900"
            >
              {isOtpMode ? 'सुरक्षा पिन द्वारे लॉगिन करा' : 'किंवा ओटीपी द्वारे लॉगिन करा'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: REGISTRATION FORM */}
      {tab === 'register' && (
        <form onSubmit={handleRegister} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3.5">
          <div className="text-center pb-1">
            <h3 className="text-base font-extrabold text-stone-900">नवीन शेतकरी नोंदणी</h3>
            <p className="text-xs text-stone-500">प्लॅन्टिक्स प्रमाणे वैयक्तिक पीक सल्ला व रोग ट्रॅकिंग मिळवा</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">शेतकऱ्याचे संपूर्ण नाव *</label>
            <input
              type="text"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="उदा. तुकाराम विठोबा शिंदे"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 focus:outline-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">मोबाईल नंबर *</label>
              <input
                type="tel"
                maxLength={10}
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value)}
                placeholder="९८२२xxxxxx"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">सोलापूर तालुका *</label>
              <select
                value={regTaluka}
                onChange={(e) => setRegTaluka(e.target.value)}
                className="w-full px-2 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 bg-white"
              >
                {SOLAPUR_TALUKAS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">गाव</label>
              <input
                type="text"
                value={regVillage}
                onChange={(e) => setRegVillage(e.target.value)}
                placeholder="उदा. कोर्टी"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">शेतजमीन (एकर)</label>
              <input
                type="number"
                step="0.5"
                value={regLandAcre}
                onChange={(e) => setRegLandAcre(e.target.value)}
                placeholder="उदा. 3.0"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-900"
              />
            </div>
          </div>

          {/* Crops selection (Plantix style) */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              तुमची मुख्य पिके निवडा (Personalized Crops):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_CROPS.map((c) => {
                const isSelected = selectedCrops.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCrop(c)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {c} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Soil & Irrigation */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">जमीन प्रकार</label>
              <select
                value={regSoil}
                onChange={(e) => setRegSoil(e.target.value)}
                className="w-full px-2 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold bg-white"
              >
                <option value="काळी कसदार जमीन">काळी कसदार</option>
                <option value="मध्यम काळी">मध्यम काळी</option>
                <option value="हलकी मुरमाड">हलकी मुरमाड</option>
                <option value="रेताड चुनखडीयुक्त">रेताड चुनखडीयुक्त</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">पाणी सोय</label>
              <select
                value={regIrrigation}
                onChange={(e) => setRegIrrigation(e.target.value)}
                className="w-full px-2 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold bg-white"
              >
                <option value="ठिबक सिंचन (Drip)">ठिबक सिंचन</option>
                <option value="तुषार सिंचन (Sprinkler)">तुषार सिंचन</option>
                <option value="विहीर / बोअरवेल">विहीर / बोअरवेल</option>
                <option value="कालवा / नदी">कालवा / नदी</option>
              </select>
            </div>
          </div>

          {/* PIN Setup */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">४-अंकी सुरक्षा पिन सेट करा *</label>
            <input
              type="password"
              maxLength={4}
              value={regPin}
              onChange={(e) => setRegPin(e.target.value)}
              placeholder="४-अंकी पिन (उदा. 1234)"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 focus:outline-emerald-600 text-center tracking-widest"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md active:scale-98 transition cursor-pointer"
          >
            नोंदणी पूर्ण करा व शेत सुरू करा
          </button>
        </form>
      )}
    </div>
  );
};
