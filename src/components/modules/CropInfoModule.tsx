import React, { useState } from 'react';
import { ArrowLeft, Mic, Sparkles, Volume2, Droplets, Layers, Calendar, Award } from 'lucide-react';
import { CROPS_DATA } from '../../data/agriculturalData';
import { CropInfo } from '../../types';
import { AudioPlayerButton } from '../AudioPlayerButton';
import { speechService } from '../../services/speechService';

interface CropInfoModuleProps {
  onBack: () => void;
  onOpenVoice: () => void;
  initialCropId?: string;
}

export const CropInfoModule: React.FC<CropInfoModuleProps> = ({
  onBack,
  onOpenVoice,
  initialCropId
}) => {
  const [selectedCrop, setSelectedCrop] = useState<CropInfo | null>(() => {
    if (initialCropId) {
      return CROPS_DATA.find(c => c.id === initialCropId || c.nameMr.includes(initialCropId)) || null;
    }
    return null;
  });

  const handleSelectCrop = (crop: CropInfo) => {
    speechService.hapticFeedback(30);
    setSelectedCrop(crop);
    speechService.speak(crop.marathiAudioText);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-stone-50 select-none pb-10 overflow-y-auto">
      {/* Top Navigation Header Matching Figure 3 */}
      <div className="bg-emerald-800 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-emerald-700 cursor-pointer text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold">पीक माहिती</h2>
            <p className="text-xs text-emerald-200">पिकांची संपूर्ण माहिती मिळवा</p>
          </div>
        </div>
        <AudioPlayerButton
          text="पीक माहिती विभाग. ज्वारी, तूर, कांदा, ऊस, डाळिंब यासह सोलापूरच्या प्रमुख १२ पिकांची सुधारित शेती पद्धती येथे उपलब्ध आहे."
          size="sm"
        />
      </div>

      {/* Prominent Voice Bar Matching Figure 3 */}
      <div
        onClick={onOpenVoice}
        className="bg-white border-2 border-emerald-300 rounded-2xl p-3 mb-4 shadow-2xs flex items-center justify-between cursor-pointer hover:border-emerald-500 transition"
      >
        <div className="flex items-center gap-2 text-stone-700 text-xs font-semibold">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Mic className="w-4 h-4 text-emerald-700" />
          </div>
          <span>बोला "ज्वारी माहिती" किंवा "डाळिंब व्यवस्थापन सांगा"</span>
        </div>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-lg">
          बोला
        </span>
      </div>

      {/* Grid of Crops Matching Figure 3 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-stone-800">पीक निवडा</h3>
          <span className="text-xs text-stone-500">१२ स्थानिक पिके</span>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {CROPS_DATA.map((crop) => (
            <div
              key={crop.id}
              onClick={() => handleSelectCrop(crop)}
              className={`flex flex-col items-center justify-between p-2 rounded-2xl border-2 transition-all cursor-pointer active:scale-95 text-center ${
                selectedCrop?.id === crop.id
                  ? 'bg-emerald-100 border-emerald-600 shadow-sm'
                  : 'bg-white border-stone-200 hover:border-emerald-300 shadow-2xs'
              }`}
            >
              <div className="text-3xl my-1">{crop.icon}</div>
              <span className="text-xs font-extrabold text-stone-900 leading-tight">
                {crop.nameMr.split(' ')[0]}
              </span>

              {/* Individual Audio Button next to crop */}
              <div className="mt-1">
                <AudioPlayerButton text={crop.marathiAudioText} size="sm" label="" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Crop Detail Sheet */}
      {selectedCrop && (
        <div className="mt-4 bg-white rounded-3xl p-4 border-2 border-emerald-300 shadow-md animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedCrop.icon}</span>
              <div>
                <h4 className="text-base font-extrabold text-emerald-950">
                  {selectedCrop.nameMr}
                </h4>
                <p className="text-xs text-stone-500">{selectedCrop.nameEn}</p>
              </div>
            </div>
            <AudioPlayerButton text={selectedCrop.marathiAudioText} size="md" />
          </div>

          <div className="grid grid-cols-2 gap-2 my-3 text-xs">
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <span className="flex items-center gap-1 text-[11px] text-stone-500 font-semibold">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span>जमीन प्रकार</span>
              </span>
              <span className="font-bold text-stone-900 block mt-0.5">{selectedCrop.soilType}</span>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <span className="flex items-center gap-1 text-[11px] text-stone-500 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>हंगाम / पेरणी</span>
              </span>
              <span className="font-bold text-stone-900 block mt-0.5">{selectedCrop.sowingSeason}</span>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <span className="flex items-center gap-1 text-[11px] text-stone-500 font-semibold">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>पाणी व्यवस्थापन</span>
              </span>
              <span className="font-bold text-stone-900 block mt-0.5">{selectedCrop.waterRequirement}</span>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <span className="flex items-center gap-1 text-[11px] text-stone-500 font-semibold">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>अपेक्षित उत्पादन</span>
              </span>
              <span className="font-bold text-stone-900 block mt-0.5">{selectedCrop.expectedYield}</span>
            </div>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200">
            <h5 className="text-xs font-bold text-emerald-950 mb-1.5">महत्त्वाच्या शेती पद्धती व सल्ला:</h5>
            <ul className="text-xs space-y-1 text-stone-700 list-disc list-inside">
              {selectedCrop.keyPractices.map((practice, idx) => (
                <li key={idx}>{practice}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
