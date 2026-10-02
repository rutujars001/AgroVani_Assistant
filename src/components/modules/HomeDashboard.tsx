import React, { useState, useEffect } from 'react';
import { Mic, Shield, MapPin, Volume2, CloudSun, TrendingUp, FileText, Stethoscope, Sprout, Sparkles, User, Radio, Camera, Wallet, FlaskConical, Scale, Calendar } from 'lucide-react';
import { speechService } from '../../services/speechService';
import { SOLAPUR_TALUKAS } from '../../data/agriculturalData';
import { OfflineSyncBadge } from '../OfflineSyncBadge';
import { PWAInstallButton } from '../PWAInstallButton';
import { realtimeDataService } from '../../services/realtimeDataService';
import { FarmerProfile } from '../../types';
import { securityService } from '../../services/securityService';

interface HomeDashboardProps {
  onOpenVoice: () => void;
  onSelectModule: (module: 'crops' | 'weather' | 'mandi' | 'schemes' | 'doctor' | 'myfarm' | 'auth' | 'finance' | 'soil' | 'mandicomparison' | 'calendar') => void;
  onOpenSensitiveData: () => void;
  selectedTaluka: string;
  onSelectTaluka: (taluka: string) => void;
  lastTranscript?: string;
  profile?: FarmerProfile;
  onDoctorCheckCrop?: (crop: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onOpenVoice,
  onSelectModule,
  onOpenSensitiveData,
  selectedTaluka,
  onSelectTaluka,
  lastTranscript,
  profile: propProfile,
  onDoctorCheckCrop,
}) => {
  const [profile, setProfile] = useState<FarmerProfile>(propProfile || securityService.getProfile());
  const [voiceGender, setVoiceGender] = useState<'Kore' | 'Puck'>('Kore');
  const [liveTicker, setLiveTicker] = useState<string>('सोलापूर थेट APMC व उपग्रह हवामान कनेक्टेड');

  useEffect(() => {
    setProfile(propProfile || securityService.getProfile());
    realtimeDataService.getLiveWeather(selectedTaluka).then((w) => {
      setLiveTicker(`${selectedTaluka}: ${w.temp}°C ${w.condition} • सोलापूर APMC चालू`);
    }).catch(() => {});
  }, [selectedTaluka, propProfile]);

  // Clean, fast navigation with NO starter speech lag
  const handleCardClick = (module: 'crops' | 'weather' | 'mandi' | 'schemes' | 'doctor' | 'myfarm' | 'auth' | 'finance' | 'soil' | 'mandicomparison' | 'calendar') => {
    speechService.stopSpeaking();
    speechService.hapticFeedback(30);
    onSelectModule(module);
  };

  const toggleVoice = () => {
    speechService.stopSpeaking();
    const next = voiceGender === 'Kore' ? 'Puck' : 'Kore';
    setVoiceGender(next);
    speechService.setVoiceType(next);
    speechService.hapticFeedback(30);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-stone-50 select-none pb-8 overflow-y-auto">
      {/* Top Header Banner */}
      <div className="bg-emerald-800 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-emerald-700/80 border border-emerald-500/50 flex items-center justify-center font-bold text-lg">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold tracking-wide">
                {profile.fullName ? `नमस्कार ${profile.fullName.split(' ')[0]}!` : 'नमस्कार शेतकरी मित्र!'}
              </h2>
              {profile.isLoggedIn && (
                <span className="text-[10px] bg-emerald-600 px-1.5 py-0.2 rounded-md font-bold">
                  लॉगिन
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-200 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              <select
                value={selectedTaluka}
                onChange={(e) => onSelectTaluka(e.target.value)}
                className="bg-emerald-900/60 text-white text-xs font-bold rounded-md px-1.5 py-0.5 border border-emerald-600 focus:outline-none cursor-pointer"
              >
                {SOLAPUR_TALUKAS.map((t) => (
                  <option key={t} value={t} className="bg-stone-900 text-white">
                    {t}, सोलापूर
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Profile / Auth & Voice Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleCardClick('auth')}
            className="flex items-center gap-1 bg-emerald-900/80 hover:bg-emerald-900 text-emerald-100 p-2 rounded-xl border border-emerald-600/50 shadow-xs cursor-pointer active:scale-95"
            title="शेतकरी खाते व नोंदणी"
          >
            <User className="w-4 h-4 text-emerald-200" />
            <span className="text-[11px] font-bold hidden sm:inline">
              {profile.isLoggedIn ? 'खाते' : 'नोंदणी'}
            </span>
          </button>

          <button
            onClick={toggleVoice}
            className="flex items-center gap-1 bg-emerald-900/70 hover:bg-emerald-900 text-emerald-200 px-2 py-2 rounded-xl border border-emerald-600/50 text-[10px] font-bold cursor-pointer"
            title="आवाज टोन"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>

          <button
            onClick={onOpenSensitiveData}
            className="flex items-center gap-1 bg-emerald-900/80 hover:bg-emerald-900 text-emerald-100 p-2 rounded-xl border border-emerald-600/50 shadow-xs cursor-pointer active:scale-95"
            title="७/१२ व आधार सुरक्षा"
          >
            <Shield className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Online/Offline Status & PWA Install */}
      <div className="flex items-center justify-between py-2 px-1">
        <OfflineSyncBadge />
        <PWAInstallButton />
      </div>

      {/* Live Data Ticker */}
      <div className="mb-2 px-2.5 py-1.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] text-emerald-950 font-bold">
        <div className="flex items-center gap-1.5 truncate">
          <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" />
          <span className="truncate">{liveTicker}</span>
        </div>
        <span className="text-[9px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
          थेट API
        </span>
      </div>

      {/* Central Prominent Voice Input Button */}
      <div className="my-2 flex flex-col items-center justify-center text-center">
        <div className="relative group">
          <div className="absolute -inset-2 bg-emerald-400/30 rounded-full blur-md group-hover:bg-emerald-500/40 transition duration-300 animate-pulse" />
          <button
            onClick={onOpenVoice}
            className="relative w-24 h-24 rounded-full bg-gradient-to-b from-emerald-600 to-emerald-800 text-white shadow-xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform border-4 border-white"
            aria-label="बोलण्यासाठी टॅप करा"
          >
            <Mic className="w-10 h-10 text-white mb-0.5 animate-bounce" />
          </button>
        </div>
        <span className="mt-2 text-sm font-extrabold text-stone-800 tracking-wide">
          बोलण्यासाठी टॅप करा
        </span>
        <span className="text-[11px] text-stone-500">
          सोलापूर मायबोलीत प्रश्न विचारा
        </span>
      </div>

      {/* Auditory Feedback Banner */}
      <div className="bg-white border-2 border-emerald-200 rounded-2xl p-3 shadow-xs mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-500">ऐकलं आहे:</div>
            <div className="text-xs font-extrabold text-stone-800 italic">
              {lastTranscript || 'आपला प्रश्न बोला किंवा खालील पर्याय निवडा...'}
            </div>
          </div>
        </div>
        <button
          onClick={onOpenVoice}
          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 cursor-pointer"
        >
          बोला
        </button>
      </div>

      {/* 6 Color-Coded Feature Cards */}
      <div className="grid grid-cols-2 gap-3 pb-3">
        {/* 1. Krushi Doctor */}
        <button
          onClick={() => handleCardClick('doctor')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-rose-100/80 hover:bg-rose-100 border-2 border-rose-300 shadow-xs cursor-pointer active:scale-95 transition-all text-center col-span-2 relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-rose-950">कृषी डॉक्टर (Plantix AI)</span>
                <span className="text-[10px] bg-rose-700 text-white px-1.5 py-0.2 rounded-md font-bold">थेट स्कॅनर</span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5">
                पानाचा फोटो काढून अचूक रोग, औषध मात्रा व PDF अहवाल मिळवा
              </p>
            </div>
          </div>
        </button>

        {/* 2. My Farm */}
        <button
          onClick={() => handleCardClick('myfarm')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-teal-100/70 hover:bg-teal-100 border-2 border-teal-300 shadow-xs cursor-pointer active:scale-95 transition-all text-center"
        >
          <div className="w-11 h-11 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-sm mb-1.5">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="text-sm font-extrabold text-teal-950">माझे शेत (My Farm)</span>
          <span className="text-[10px] text-teal-800 mt-0.5">वैयक्तिक पिके व जोखीम</span>
        </button>

        {/* 3. Crop Information */}
        <button
          onClick={() => handleCardClick('crops')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-100/70 hover:bg-emerald-100 border-2 border-emerald-300 shadow-xs cursor-pointer active:scale-95 transition-all text-center"
        >
          <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm mb-1.5 text-xl">
            🌾
          </div>
          <span className="text-sm font-extrabold text-emerald-950">पीक माहिती</span>
          <span className="text-[10px] text-emerald-800 mt-0.5">१२ स्थानिक पिके</span>
        </button>

        {/* 4. Weather */}
        <button
          onClick={() => handleCardClick('weather')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-sky-100/70 hover:bg-sky-100 border-2 border-sky-300 shadow-xs cursor-pointer active:scale-95 transition-all text-center"
        >
          <div className="w-11 h-11 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-sm mb-1.5">
            <CloudSun className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-extrabold text-sky-950">थेट हवामान</span>
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
          </div>
          <span className="text-[10px] text-sky-800 mt-0.5">उपग्रह लाइव्ह डेटा</span>
        </button>

        {/* 5. Mandi Prices */}
        <button
          onClick={() => handleCardClick('mandi')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-purple-100/70 hover:bg-purple-100 border-2 border-purple-300 shadow-xs cursor-pointer active:scale-95 transition-all text-center"
        >
          <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-sm mb-1.5">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-extrabold text-purple-950">थेट बाजारभाव</span>
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
          </div>
          <span className="text-[10px] text-purple-800 mt-0.5">सोलापूर APMC लाइव्ह</span>
        </button>

        {/* 6. Government Schemes */}
        <button
          onClick={() => handleCardClick('schemes')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-amber-100/70 hover:bg-amber-100 border-2 border-amber-300 shadow-xs cursor-pointer active:scale-95 transition-all text-center col-span-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-sm font-extrabold text-amber-950">शासकीय योजना व अनुदान</span>
              <p className="text-[11px] text-amber-900">पीक विमा, ठिबक अनुदान व पीएम किसान ₹१२,००० थेट मदत</p>
            </div>
          </div>
        </button>

        {/* 7. Farm Finance */}
        <button
          onClick={() => handleCardClick('finance')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-100/80 hover:bg-emerald-100 border-2 border-emerald-400 shadow-xs cursor-pointer active:scale-95 transition-all text-center"
        >
          <div className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-sm mb-1.5">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-sm font-extrabold text-emerald-950">जमा-खर्च वही</span>
          <span className="text-[10px] text-emerald-800 mt-0.5">व्हॉइस शेती नफा-तोटा</span>
        </button>

        {/* 8. Soil Health */}
        <button
          onClick={() => handleCardClick('soil')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-indigo-100/70 hover:bg-indigo-100 border-2 border-indigo-300 shadow-xs cursor-pointer active:scale-95 transition-all text-center"
        >
          <div className="w-11 h-11 rounded-full bg-indigo-700 text-white flex items-center justify-center shadow-sm mb-1.5">
            <FlaskConical className="w-5 h-5" />
          </div>
          <span className="text-sm font-extrabold text-indigo-950">माती परीक्षण</span>
          <span className="text-[10px] text-indigo-800 mt-0.5">स्मार्ट खत प्रिस्क्रिप्शन</span>
        </button>

        {/* 9. Mandi Comparison */}
        <button
          onClick={() => handleCardClick('mandicomparison')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-orange-100/80 hover:bg-orange-100 border-2 border-orange-300 shadow-xs cursor-pointer active:scale-95 transition-all text-center col-span-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-sm font-extrabold text-orange-950">बाजारभाव तुलना व नफा सल्ला (Multi-Mandi)</span>
              <p className="text-[11px] text-orange-900">सोलापूर, पंढरपूर, बार्शी तुलना • वाहतूक वजा जाता सर्वाधिक निव्वळ भाव</p>
            </div>
          </div>
        </button>

        {/* 10. Crop Calendar - new dedicated tab */}
        <button
          onClick={() => handleCardClick('calendar')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-green-100/80 hover:bg-green-100 border-2 border-green-400 shadow-xs cursor-pointer active:scale-95 transition-all text-center col-span-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-sm font-extrabold text-green-950">पीक दिनदर्शिका (Crop Calendar)</span>
              <p className="text-[11px] text-green-900">दैनिक शेतकामे, वाढीचे टप्पे व वेळापत्रक</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
