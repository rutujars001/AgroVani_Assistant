import React from 'react';
import { Volume2, Sparkles, ArrowRight, ShieldCheck, Wifi } from 'lucide-react';
import { speechService } from '../../services/speechService';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const handleStart = () => {
    speechService.stopSpeaking();
    speechService.hapticFeedback(50);
    speechService.playTone('confirm');
    onStart();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-stone-50 via-emerald-50/40 to-stone-100 text-center select-none">
      {/* Top Solapur District Tag */}
      <div className="pt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold">
        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
        <span>सोलापूर जिल्हा व परिसरासाठी विशेष</span>
      </div>

      {/* Main Logo & Branding Matching Figure 1 of Paper */}
      <div className="flex flex-col items-center space-y-4 my-auto">
        <div className="relative">
          {/* Glowing Sun Effect */}
          <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-200 flex items-center justify-center shadow-lg border-4 border-white">
            <div className="text-5xl">🌾</div>
          </div>
          {/* Sprout Icon badge */}
          <div className="absolute -bottom-2 -right-1 w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center border-2 border-white shadow-md text-2xl">
            🌱
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold text-emerald-800 tracking-tight font-sans">
            अ‍ॅग्रोवाणी
          </h1>
          <p className="text-base font-bold text-stone-700 mt-1">
            शेतीसाठी तुमचा साथी
          </p>
          <p className="text-xs text-stone-500 max-w-xs mt-2 leading-relaxed">
            कमी साक्षर शेतकऱ्यांसाठी सोलापुरी मायबोलीत बोलणारा डिजिटल शेती सहाय्यक
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-xs pt-2 text-left">
          <div className="bg-white/80 p-2.5 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2">
            <span className="text-lg">🎙️</span>
            <div>
              <div className="text-xs font-bold text-stone-900">द्विमार्गी आवाज</div>
              <div className="text-[10px] text-stone-500">ऐका व बोला</div>
            </div>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <div>
              <div className="text-xs font-bold text-stone-900">ऑफलाइन सिंक</div>
              <div className="text-[10px] text-stone-500">विना इंटरनेट काम</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Start Button Matching Figure 1 ("सुरू करा") */}
      <div className="w-full max-w-xs space-y-3 pb-6">
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-lg shadow-lg active:scale-98 transition flex items-center justify-center gap-3 cursor-pointer ring-4 ring-emerald-100"
        >
          <span>सुरू करा</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-3 text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>सुरक्षित डेटा</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>मराठी ऑडिओ</span>
          </span>
        </div>
      </div>
    </div>
  );
};
