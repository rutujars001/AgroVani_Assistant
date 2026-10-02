import React, { useState } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { CropCalendarWidget } from './components/CropCalendarWidget';
import { SplashScreen } from './components/modules/SplashScreen';
import { HomeDashboard } from './components/modules/HomeDashboard';
import { CropInfoModule } from './components/modules/CropInfoModule';
import { WeatherModule } from './components/modules/WeatherModule';
import { MandiPricesModule } from './components/modules/MandiPricesModule';
import { GovernmentSchemesModule } from './components/modules/GovernmentSchemesModule';
import { KrushiDoctorModule } from './components/modules/KrushiDoctorModule';
import { MyFarmModule } from './components/modules/MyFarmModule';
import { AuthModule } from './components/modules/AuthModule';
import { FarmFinanceModule } from './components/modules/FarmFinanceModule';
import { SoilHealthModule } from './components/modules/SoilHealthModule';
import { MandiComparisonModule } from './components/modules/MandiComparisonModule';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { SensitiveDataModal } from './components/SensitiveDataModal';
import { ParsedIntent } from './services/nlpEngine';
import { speechService } from './services/speechService';
import { securityService } from './services/securityService';
import { FarmerProfile } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    'splash' | 'home' | 'crops' | 'weather' | 'mandi' | 'schemes' | 'doctor' | 'myfarm' | 'auth' | 'finance' | 'soil' | 'mandicomparison' | 'calendar'
  >('splash');

  const [selectedTaluka, setSelectedTaluka] = useState('पंढरपूर');
  const [profile, setProfile] = useState<FarmerProfile>(securityService.getProfile());
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isSensitiveOpen, setIsSensitiveOpen] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [targetCropParam, setTargetCropParam] = useState<string | undefined>(undefined);

  // Navigate to target module when user confirms intent in 2-way voice assistant
  const handleVoiceIntent = (intent: ParsedIntent) => {
    speechService.stopSpeaking();
    setLastTranscript(intent.confirmationQuestion);
    setTargetCropParam(intent.targetCrop);

    if (intent.targetTaluka) {
      setSelectedTaluka(intent.targetTaluka);
    }

    switch (intent.intent) {
      case 'crop_info':
        setCurrentScreen('crops');
        break;
      case 'weather':
        setCurrentScreen('weather');
        break;
      case 'mandi_prices':
        setCurrentScreen('mandi');
        break;
      case 'government_schemes':
        setCurrentScreen('schemes');
        break;
      case 'krushi_doctor':
        setCurrentScreen('doctor');
        break;
      case 'my_farm':
        setCurrentScreen('myfarm');
        break;
      case 'crop_calendar':
        setCurrentScreen('calendar');
        break;
      case 'farm_finance':
        setCurrentScreen('finance');
        break;
      case 'soil_health':
        setCurrentScreen('soil');
        break;
      case 'mandi_comparison':
        setCurrentScreen('mandicomparison');
        break;
      default:
        setCurrentScreen('home');
        break;
    }
  };

  const handleBack = () => {
    speechService.stopSpeaking();
    speechService.hapticFeedback(25);
    if (currentScreen !== 'home' && currentScreen !== 'splash') {
      setCurrentScreen('home');
    } else if (currentScreen === 'home') {
      setCurrentScreen('splash');
    }
  };

  const handleHome = () => {
    speechService.stopSpeaking();
    speechService.hapticFeedback(30);
    setCurrentScreen('home');
  };

  const handleAuthSuccess = (updatedProf: FarmerProfile) => {
    setProfile(updatedProf);
    setCurrentScreen('myfarm');
  };

  return (
    <AndroidFrame
      onBack={handleBack}
      onHome={handleHome}
      canGoBack={currentScreen !== 'splash'}
    >
      {/* Screen Router */}
      {currentScreen === 'splash' && (
        <SplashScreen onStart={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'home' && (
        <HomeDashboard
          profile={profile}
          onOpenVoice={() => setIsVoiceOpen(true)}
          onSelectModule={(mod) => setCurrentScreen(mod as any)}
          onOpenSensitiveData={() => setIsSensitiveOpen(true)}
          selectedTaluka={selectedTaluka}
          onSelectTaluka={setSelectedTaluka}
          lastTranscript={lastTranscript}
          onDoctorCheckCrop={(crop) => {
            setTargetCropParam(crop);
            setCurrentScreen('doctor');
          }}
        />
      )}

      {currentScreen === 'crops' && (
        <CropInfoModule
          onBack={() => setCurrentScreen('home')}
          onOpenVoice={() => setIsVoiceOpen(true)}
          initialCropId={targetCropParam}
        />
      )}

      {currentScreen === 'weather' && (
        <WeatherModule
          onBack={() => setCurrentScreen('home')}
          onOpenVoice={() => setIsVoiceOpen(true)}
          selectedTaluka={selectedTaluka}
          onSelectTaluka={setSelectedTaluka}
        />
      )}

      {currentScreen === 'mandi' && (
        <MandiPricesModule
          onBack={() => setCurrentScreen('home')}
          onOpenVoice={() => setIsVoiceOpen(true)}
          filterCrop={targetCropParam}
        />
      )}

      {currentScreen === 'schemes' && (
        <GovernmentSchemesModule
          onBack={() => setCurrentScreen('home')}
          onOpenVoice={() => setIsVoiceOpen(true)}
        />
      )}

      {currentScreen === 'doctor' && (
        <KrushiDoctorModule
          onBack={() => setCurrentScreen('home')}
          onOpenVoice={() => setIsVoiceOpen(true)}
          targetCrop={targetCropParam || profile.selectedPrimaryCrops?.[0] || 'डाळिंब'}
        />
      )}

      {currentScreen === 'myfarm' && (
        <MyFarmModule
          profile={profile}
          onBack={() => setCurrentScreen('home')}
          onStartDoctorCheck={(crop) => {
            setTargetCropParam(crop);
            setCurrentScreen('doctor');
          }}
          onOpenAuth={() => setCurrentScreen('auth')}
        />
      )}

      {currentScreen === 'auth' && (
        <AuthModule
          onBack={() => setCurrentScreen('home')}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {currentScreen === 'finance' && (
        <FarmFinanceModule
          profile={profile}
          onBack={() => setCurrentScreen('home')}
          onOpenVoice={() => setIsVoiceOpen(true)}
        />
      )}

      {currentScreen === 'soil' && (
        <SoilHealthModule
          profile={profile}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'calendar' && (
        <div className="flex-1 flex flex-col p-4 bg-stone-50 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setCurrentScreen('home')}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer active:scale-95"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H19v-2z" /></svg>
            </button>
            <h2 className="text-base font-extrabold text-stone-900">पीक दिनदर्शिका</h2>
          </div>
          <CropCalendarWidget
            profile={profile}
            onOpenDoctorCheck={(crop) => { setTargetCropParam(crop); setCurrentScreen('doctor'); }}
            onOpenMyFarm={() => setCurrentScreen('myfarm')}
          />
        </div>
      )}

      {currentScreen === 'mandicomparison' && (
        <MandiComparisonModule
          profile={profile}
          onBack={() => setCurrentScreen('home')}
          initialCrop={targetCropParam || 'कांदा'}
        />
      )}

      {/* Two-Way Auditory Confirmation Voice Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onNavigateToModule={handleVoiceIntent}
      />

      {/* Sensitive Farmer Information Protection Modal */}
      <SensitiveDataModal
        isOpen={isSensitiveOpen}
        onClose={() => setIsSensitiveOpen(false)}
        onProfileUpdated={(p) => setProfile(p)}
      />
    </AndroidFrame>
  );
}
