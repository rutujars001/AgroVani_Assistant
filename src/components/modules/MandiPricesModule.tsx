import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, TrendingUp, TrendingDown, Volume2, Search, RefreshCw, Radio } from 'lucide-react';
import { MandiPrice } from '../../types';
import { AudioPlayerButton } from '../AudioPlayerButton';
import { speechService } from '../../services/speechService';
import { realtimeDataService, LiveMandiResponse } from '../../services/realtimeDataService';

interface MandiPricesModuleProps {
  onBack: () => void;
  onOpenVoice: () => void;
  filterCrop?: string;
}

export const MandiPricesModule: React.FC<MandiPricesModuleProps> = ({
  onBack,
  onOpenVoice,
  filterCrop,
}) => {
  const [searchTerm, setSearchTerm] = useState(filterCrop || '');
  const [liveData, setLiveData] = useState<LiveMandiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMandiPrices = async () => {
    setIsLoading(true);
    try {
      const data = await realtimeDataService.getLiveMandiPrices();
      setLiveData(data);
    } catch (err) {
      console.error('Error loading mandi prices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMandiPrices();
  }, []);

  const items = liveData?.items || [];
  const filteredPrices = items.filter(
    (item) =>
      item.cropNameMr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cropNameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSpeakCommodity = (m: MandiPrice) => {
    speechService.hapticFeedback(30);
    speechService.speak(m.audioText);
  };

  const handleRefresh = async () => {
    speechService.hapticFeedback(50);
    speechService.playTone('confirm');
    await loadMandiPrices();
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-stone-50 select-none pb-10 overflow-y-auto">
      {/* Top Header Matching Figure 5 */}
      <div className="bg-purple-900 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-purple-800 cursor-pointer text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold">सोलापूर बाजारभाव</h2>
            <p className="text-xs text-purple-200">थेट कृषी उत्पन्न बाजार समिती (APMC)</p>
          </div>
        </div>
        <AudioPlayerButton
          text="सोलापूर कृषी उत्पन्न बाजार समितीचे थेट भाव. सूर्यफूल ५ हजार ५८० रुपये, ज्वारी ४ हजार १२० रुपये, डाळिंब ११ हजार २०० रुपये आणि कांदा १ हजार ५० रुपये क्विंटल आहे."
          size="sm"
        />
      </div>

      {/* Live Market Status Bar */}
      <div className="flex items-center justify-between px-1 mb-2.5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-extrabold text-emerald-800">
            {liveData?.marketStatus || '🔴 थेट चालू (Live APMC)'}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded-lg cursor-pointer transition active:scale-95"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'अपडेट होत आहे...' : `ताजे दर (${liveData?.lastUpdated || 'आज'})`}</span>
        </button>
      </div>

      {/* 3 Summary Badges Matching Figure 5 (दररोजची आवक, किमान, कमाल) */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-[10px] text-stone-500 font-bold">दररोजची आवक</div>
          <div className="text-sm font-extrabold text-stone-900 mt-0.5">
            {liveData?.totalArrivalQuintal || '९,८१० क्विंटल'}
          </div>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-[10px] text-stone-500 font-bold">किमान दर</div>
          <div className="text-sm font-extrabold text-blue-700 mt-0.5">
            ₹ {liveData?.minRateToday?.toLocaleString('en-IN') || '६००'}
          </div>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-[10px] text-stone-500 font-bold">कमाल दर</div>
          <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
            ₹ {liveData?.maxRateToday?.toLocaleString('en-IN') || '१४,५००'}
          </div>
        </div>
      </div>

      {/* Prominent Voice Bar Matching Figure 5 */}
      <div
        onClick={onOpenVoice}
        className="bg-white border-2 border-purple-300 rounded-2xl p-3 mb-3 shadow-2xs flex items-center justify-between cursor-pointer hover:border-purple-500 transition"
      >
        <div className="flex items-center gap-2 text-stone-700 text-xs font-semibold">
          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
            <Mic className="w-4 h-4 text-purple-700" />
          </div>
          <span>बोला: "सूर्यफूल चा भाव काय आहे"</span>
        </div>
        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-1 rounded-lg">
          बोला
        </span>
      </div>

      {/* Mandi Table Matching Figure 5 */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-purple-50 border-b border-purple-200 text-purple-950 font-extrabold">
                <th className="py-2.5 px-2 text-center w-8">#</th>
                <th className="py-2.5 px-2">पीक नाव</th>
                <th className="py-2.5 px-2 text-right">किमान (₹)</th>
                <th className="py-2.5 px-2 text-right">सरासरी (₹)</th>
                <th className="py-2.5 px-2 text-right">कमाल (₹)</th>
                <th className="py-2.5 px-2 text-center w-10">ऐका</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPrices.map((item, idx) => (
                <tr
                  key={item.id}
                  onClick={() => handleSpeakCommodity(item)}
                  className="hover:bg-purple-50/50 cursor-pointer transition active:bg-purple-100"
                >
                  <td className="py-3 px-2 text-center text-stone-500 font-bold">{idx + 1}</td>
                  <td className="py-3 px-2">
                    <div className="font-extrabold text-stone-900">{item.cropNameMr}</div>
                    <div className="text-[10px] text-stone-400">{item.variety}</div>
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-stone-600">
                    ₹{item.minPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-2 text-right font-extrabold text-emerald-700">
                    ₹{item.avgPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-stone-900">
                    ₹{item.maxPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeakCommodity(item);
                      }}
                      className="p-1 rounded-full text-purple-700 hover:bg-purple-100"
                      title="भाव ऐका"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-[11px] text-stone-500">
        स्रोत: {liveData?.source || 'Agmarknet / Solapur APMC Committee Live Feed'}
      </div>
    </div>
  );
};
