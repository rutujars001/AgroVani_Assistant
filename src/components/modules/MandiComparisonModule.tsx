import React, { useState } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  MapPin,
  Truck,
  Bell,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowUpDown,
  Navigation
} from 'lucide-react';
import { mandiComparisonService, MULTI_MANDI_DATA } from '../../services/mandiComparisonService';
import { MandiComparisonItem, MandiPriceAlert, FarmerProfile } from '../../types';
import { speechService } from '../../services/speechService';
import { AudioPlayerButton } from '../AudioPlayerButton';

interface MandiComparisonModuleProps {
  profile: FarmerProfile;
  onBack: () => void;
  initialCrop?: string;
}

export const MandiComparisonModule: React.FC<MandiComparisonModuleProps> = ({
  profile,
  onBack,
  initialCrop = 'कांदा'
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop);
  const [alerts, setAlerts] = useState<MandiPriceAlert[]>(mandiComparisonService.getAlerts());
  const [isAddAlertModalOpen, setIsAddAlertModalOpen] = useState(false);
  const [newTargetPrice, setNewTargetPrice] = useState<string>('2500');

  const comparisonList = mandiComparisonService.getMandiComparison(selectedCrop);
  const bestDeal = mandiComparisonService.getBestDeal(selectedCrop);

  const handlePlayAudio = () => {
    speechService.stopSpeaking();
    speechService.hapticFeedback(30);
    const audioText = mandiComparisonService.getAudioRecommendation(selectedCrop);
    speechService.speak(audioText);
  };

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseInt(newTargetPrice, 10);
    if (!price || price <= 0) return;

    speechService.hapticFeedback(30);
    const created = mandiComparisonService.addAlert(selectedCrop, price);
    setAlerts(mandiComparisonService.getAlerts());
    setIsAddAlertModalOpen(false);
    speechService.speak(`${selectedCrop} साठी ${price} रुपयांचा भाव अलर्ट सेट केला आहे.`);
  };

  const handleDeleteAlert = (id: string) => {
    speechService.hapticFeedback(25);
    mandiComparisonService.deleteAlert(id);
    setAlerts(mandiComparisonService.getAlerts());
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
            <h2 className="text-base font-extrabold">बाजारभाव तुलना व नफा सल्ला</h2>
            <p className="text-xs text-emerald-200">सोलापूर परिसरातील APMC मंडी तुलना</p>
          </div>
        </div>

        <button
          onClick={handlePlayAudio}
          className="flex items-center gap-1 bg-emerald-900/80 hover:bg-emerald-900 px-2.5 py-1 rounded-xl text-emerald-200 text-xs font-bold border border-emerald-600/50 cursor-pointer shadow-2xs"
          title="नफा सल्ला ऐका"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-300" />
          <span>सल्ला ऐका</span>
        </button>
      </div>

      {/* Crop Filter Tabs */}
      <div className="flex items-center gap-2 mb-3">
        {['कांदा', 'डाळिंब', 'ज्वारी'].map((c) => (
          <button
            key={c}
            onClick={() => {
              speechService.hapticFeedback(20);
              setSelectedCrop(c);
            }}
            className={`flex-1 py-2 rounded-2xl text-xs font-extrabold cursor-pointer transition border text-center ${
              selectedCrop === c
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            {c === 'कांदा' ? '🧅 कांदा' : c === 'डाळिंब' ? '🍎 डाळिंब' : '🌾 ज्वारी'}
          </button>
        ))}
      </div>

      {/* Best Deal Highlight Banner */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-3xl p-4 shadow-sm mb-3">
        <div className="flex items-center justify-between pb-2 border-b border-emerald-600/50">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-extrabold uppercase tracking-wide">
              आजची सर्वोत्तम नफा देणारी बाजारपेठ
            </span>
          </div>
          <span className="text-[10px] bg-amber-400 text-amber-950 font-extrabold px-2 py-0.5 rounded-full">
            सर्वाधिक निव्वळ भाव
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">
              {bestDeal.mandiName}
            </h3>
            <div className="text-xs text-emerald-100 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>{bestDeal.taluka} • अंतर {bestDeal.distanceKm} किमी</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-emerald-200 block">वाहतूक वजा जाता</span>
            <span className="text-lg font-black text-amber-300">
              ₹{bestDeal.netRealizationPerQuintal}
            </span>
            <span className="text-[9px] text-emerald-200 block">प्रति क्विंटल निव्वळ</span>
          </div>
        </div>

        <div className="mt-3 p-2 bg-emerald-900/60 rounded-xl text-[11px] text-emerald-100 flex items-center justify-between flex-wrap gap-1">
          <span>बाजारभाव: <strong>₹{bestDeal.modalPrice}</strong></span>
          <span>वाहतूक: <strong>-₹{bestDeal.transportCostPerQuintal}</strong></span>
          <span>हमाली/तोलाई: <strong>-₹{bestDeal.marketCessAndHamaliPerQuintal}</strong></span>
          <span>आवक: <strong>{bestDeal.arrivalTons} टन</strong></span>
        </div>
      </div>

      {/* Detailed Multi-Mandi Comparison Cards */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-stone-800">
            इतर बाजार समित्यांची तुलना ({comparisonList.length})
          </h3>
          <span className="text-[10px] text-stone-500">वाहतूक व हमाली खर्चासह निव्वळ नफा</span>
        </div>

        {comparisonList.map((mandi) => {
          const diffWithBest = bestDeal.netRealizationPerQuintal - mandi.netRealizationPerQuintal;

          return (
            <div
              key={mandi.mandiName}
              className={`p-3.5 rounded-2xl border-2 transition-all ${
                mandi.isBestDeal
                  ? 'bg-emerald-50/80 border-emerald-400 shadow-2xs'
                  : 'bg-white border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-stone-900">
                    {mandi.mandiName}
                  </span>
                  {mandi.isBestDeal && (
                    <span className="text-[9px] font-extrabold bg-emerald-700 text-white px-1.5 py-0.2 rounded-md">
                      सर्वोत्तम नफा
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-stone-500">
                  अंतर: {mandi.distanceKm} किमी
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-700">
                    बाजार समिती दर: <strong>₹{mandi.modalPrice}</strong>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-1 flex-wrap">
                    <Truck className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>वाहतूक: ₹{mandi.transportCostPerQuintal}</span>
                    <span>•</span>
                    <span>हमाली/तोलाई: ₹{mandi.marketCessAndHamaliPerQuintal}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block">निव्वळ हातात</span>
                  <span className="text-sm font-extrabold text-emerald-800">
                    ₹{mandi.netRealizationPerQuintal}
                  </span>
                  {!mandi.isBestDeal && diffWithBest > 0 && (
                    <span className="text-[10px] text-rose-600 font-bold block">
                      -₹{diffWithBest} कमी
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Target Price Alerts Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-extrabold text-stone-900">
              बाजारभाव अलर्ट (Target Price Alerts)
            </h3>
          </div>
          <button
            onClick={() => setIsAddAlertModalOpen(true)}
            className="flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>अलर्ट लावा</span>
          </button>
        </div>

        <div className="space-y-2">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {alt.cropName === 'कांदा' ? '🧅' : alt.cropName === 'डाळिंब' ? '🍎' : '🌾'}
                </span>
                <div>
                  <div className="font-extrabold text-stone-900">
                    {alt.cropName} भाव {alt.condition === 'above' ? '₹' + alt.targetPrice + ' च्या वर' : 'खाली'}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    सेट केले: {alt.createdAt}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {alt.isTriggered ? (
                  <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded-md">
                    किंमत गाठली!
                  </span>
                ) : (
                  <span className="text-[9px] font-bold bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded-md">
                    सक्रिय (Active)
                  </span>
                )}
                <button
                  onClick={() => handleDeleteAlert(alt.id)}
                  className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Alert Modal */}
      {isAddAlertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddAlert}
            className="bg-white rounded-3xl p-4 max-w-sm w-full shadow-2xl border-2 border-emerald-400 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h4 className="text-sm font-extrabold text-stone-900">नवीन भाव अलर्ट सेट करा</h4>
              <button
                type="button"
                onClick={() => setIsAddAlertModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">पीक निवडा:</label>
              <div className="text-xs font-extrabold text-emerald-800 p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                {selectedCrop}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                अपेक्षित भाव (₹ प्रति क्विंटल):
              </label>
              <input
                type="number"
                value={newTargetPrice}
                onChange={(e) => setNewTargetPrice(e.target.value)}
                placeholder="उदा. २५००"
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">
                दर या किमतीच्या वर जाताच आपल्याला सूचना दिली जाईल.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsAddAlertModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 cursor-pointer shadow-xs active:scale-95"
              >
                अलर्ट जतन करा
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
