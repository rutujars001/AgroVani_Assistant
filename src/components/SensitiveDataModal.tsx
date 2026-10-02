import React, { useState } from 'react';
import { Shield, ShieldAlert, Lock, Unlock, Eye, EyeOff, Check, KeyRound, Trash2 } from 'lucide-react';
import { securityService } from '../services/securityService';
import { speechService } from '../services/speechService';
import { FarmerProfile } from '../types';

interface SensitiveDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: FarmerProfile) => void;
}

export const SensitiveDataModal: React.FC<SensitiveDataModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const [profile, setProfile] = useState<FarmerProfile>(securityService.getProfile());
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(securityService.isSensitiveUnlocked());
  const [privacyMode, setPrivacyMode] = useState(securityService.isPrivacyModeActive());
  const [pinError, setPinError] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityService.verifyPin(pinInput)) {
      setIsUnlocked(true);
      setPinError('');
      speechService.playTone('confirm');
      speechService.hapticFeedback(50);
    } else {
      setPinError('चुकीचा पिन! कृपया योग्य ४-अंकी पिन टाका (डीफॉल्ट: 1234)');
      speechService.playTone('error');
      speechService.hapticFeedback(100);
    }
  };

  const handleTogglePrivacy = () => {
    const nextVal = securityService.togglePrivacyMode();
    setPrivacyMode(nextVal);
    speechService.hapticFeedback(30);
  };

  const handleSetNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4 && /^\d+$/.test(newPin)) {
      securityService.setPin(newPin);
      setShowPinSetup(false);
      setNewPin('');
      setPinSuccessMsg('नवीन सुरक्षा पिन यशस्वीरित्या सेव्ह झाला!');
      setTimeout(() => setPinSuccessMsg(''), 3000);
    } else {
      setPinError('पिन ४ अंकी संख्या असावी');
    }
  };

  const handleLockNow = () => {
    securityService.lockSensitiveData();
    setIsUnlocked(false);
    setPinInput('');
  };

  const handleSaveProfile = (updated: Partial<FarmerProfile>) => {
    const newProf = { ...profile, ...updated };
    setProfile(newProf);
    securityService.saveProfile(newProf);
    if (onProfileUpdated) onProfileUpdated(newProf);
  };

  const handleClearData = () => {
    if (window.confirm('तुम्हाला तुमचा सर्व वैयक्तिक डेटा आणि पिन हटवायचा आहे का?')) {
      securityService.clearAllUserData();
      setProfile(securityService.getProfile());
      setIsUnlocked(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl text-stone-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">सुरक्षित शेतकरी डेटा व ओळख</h2>
              <p className="text-xs text-stone-500">७/१२, आधार व थेट बँक अनुदान (DBT) सुरक्षा</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 font-bold text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          {/* Privacy Shield Quick Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2">
              {privacyMode ? <EyeOff className="w-4 h-4 text-emerald-700" /> : <Eye className="w-4 h-4 text-stone-500" />}
              <div>
                <div className="text-xs font-bold text-stone-800">गुप्तता मोड (Privacy Shield)</div>
                <div className="text-[11px] text-stone-500">स्क्रीनवरील सर्व बँक व आधार क्रमांक लपवा</div>
              </div>
            </div>
            <button
              onClick={handleTogglePrivacy}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                privacyMode ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {privacyMode ? 'चालू' : 'बंद'}
            </button>
          </div>

          {!isUnlocked ? (
            /* PIN Locked View */
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-amber-950">संवेदनशील शेती माहिती लॉक आहे</h3>
              <p className="text-xs text-amber-800">
                ७/१२ खाते क्रमांक, आधार व बँक खात्याची माहिती पाहण्यासाठी ४-अंकी सुरक्षा पिन टाका. (डीफॉल्ट पिन: <strong>1234</strong>)
              </p>

              <form onSubmit={handleVerifyPin} className="space-y-3 pt-1">
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="४-अंकी पिन प्रविष्ट करा"
                  className="w-40 mx-auto text-center tracking-widest text-lg font-bold py-2 border-2 border-amber-300 rounded-xl bg-white focus:outline-emerald-600"
                />
                {pinError && <p className="text-xs text-rose-600 font-semibold">{pinError}</p>}
                <div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-sm"
                  >
                    पिन पडताळा व अनलॉक करा
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Unlocked View with Sensitive Data */
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span>माहिती अनलॉक आहे</span>
                </div>
                <button
                  onClick={handleLockNow}
                  className="text-stone-600 hover:text-stone-900 underline text-[11px] font-semibold cursor-pointer"
                >
                  आता लॉक करा
                </button>
              </div>

              {/* Farmer ID & Contact */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="text-xs font-bold text-stone-700">शेतकऱ्याचे नाव व गाव:</div>
                <div className="text-sm font-extrabold text-stone-900">{profile.fullName}</div>
                <div className="text-xs text-stone-600">
                  {profile.village}, तालुका: {profile.taluka}, जिल्हा: {profile.district}
                </div>
              </div>

              {/* 7/12 Land Registry Data */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">७/१२ जमीन नोंदणी (सोलापूर महसूल):</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">सत्यापित</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[10px]">गट / सर्व्हे क्रमांक</span>
                    <span className="font-bold text-stone-900">
                      {privacyMode ? '***/***' : profile.surveyGatNumber}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[10px]">एकूण क्षेत्र (एकर)</span>
                    <span className="font-bold text-stone-900">{profile.landAreaAcre} एकर</span>
                  </div>
                </div>
              </div>

              {/* Aadhaar & DBT Bank Details */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">आधार व थेट अनुदान खाते (DBT):</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">एनपीसीआय लिंक</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-stone-200">
                    <span className="text-stone-500">आधार टोकन:</span>
                    <span className="font-mono font-bold text-stone-900">
                      {privacyMode ? 'XXXX-XXXX-XXXX' : profile.aadhaarMasked}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-stone-200">
                    <span className="text-stone-500">अनुदान बँक खाते:</span>
                    <span className="font-mono font-bold text-stone-900">
                      {privacyMode ? 'XXXX-XXXX-XXXX' : profile.dbtAccountMasked}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security PIN Change */}
              <div className="pt-2">
                {!showPinSetup ? (
                  <button
                    onClick={() => setShowPinSetup(true)}
                    className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>४-अंकी सुरक्षा पिन बदला</span>
                  </button>
                ) : (
                  <form onSubmit={handleSetNewPin} className="p-3 bg-stone-100 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-stone-700">नवीन ४-अंकी पिन:</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        maxLength={4}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="उदा. 5678"
                        className="w-32 text-center text-sm font-bold p-1.5 border rounded-lg bg-white"
                      />
                      <button
                        type="submit"
                        className="bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold"
                      >
                        सेव्ह
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPinSetup(false)}
                        className="text-stone-500 text-xs px-2"
                      >
                        रद्द
                      </button>
                    </div>
                  </form>
                )}
                {pinSuccessMsg && (
                  <div className="text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{pinSuccessMsg}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Privacy and Zero-Trust Disclaimer */}
          <div className="p-3 rounded-2xl bg-stone-100 text-[11px] text-stone-600 space-y-1">
            <div className="font-bold text-stone-800 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
              <span>शेतकरी माहिती सुरक्षा आश्वासन:</span>
            </div>
            <p>
              अ‍ॅग्रोवाणी तुमचा आधार व बँक तपशील सर्व्हरवर उघडा ठेवत नाही. सर्व डेटा AES-GCM एनक्रिप्शनसह फोनमध्ये सुरक्षित राहतो.
            </p>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              onClick={handleClearData}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>डेटा रीसेट करा</span>
            </button>
            <button
              onClick={onClose}
              className="bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-stone-800 cursor-pointer"
            >
              पूर्ण झाले
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
