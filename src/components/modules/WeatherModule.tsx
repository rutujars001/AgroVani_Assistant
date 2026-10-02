import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, Wind, Droplets, Cloud, Sun, RefreshCw, Radio, Sparkles } from 'lucide-react';
import { SOLAPUR_TALUKAS } from '../../data/agriculturalData';
import { AudioPlayerButton } from '../AudioPlayerButton';
import { speechService } from '../../services/speechService';
import { realtimeDataService } from '../../services/realtimeDataService';
import { WeatherData } from '../../types';

interface WeatherModuleProps {
  onBack: () => void;
  onOpenVoice: () => void;
  selectedTaluka: string;
  onSelectTaluka: (taluka: string) => void;
}

export const WeatherModule: React.FC<WeatherModuleProps> = ({
  onBack,
  onOpenVoice,
  selectedTaluka,
  onSelectTaluka,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('लोड होत आहे...');
  const [isLoading, setIsLoading] = useState(false);

  const loadWeather = async (taluka: string) => {
    setIsLoading(true);
    try {
      const data = await realtimeDataService.getLiveWeather(taluka);
      setWeather(data);
      setIsLive(data.isLive);
      setLastUpdated(data.timestamp);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedTaluka);
  }, [selectedTaluka]);

  const handleTalukaChange = (t: string) => {
    speechService.hapticFeedback(30);
    onSelectTaluka(t);
  };

  const handleRefresh = async () => {
    speechService.hapticFeedback(50);
    speechService.playTone('confirm');
    await loadWeather(selectedTaluka);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-stone-50 select-none pb-10 overflow-y-auto">
      {/* Top Header Matching Figure 4 */}
      <div className="bg-sky-800 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-sky-700 cursor-pointer text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold">थेट हवामान</h2>
            <p className="text-xs text-sky-200">सोलापूर व परिसर थेट उपग्रह डेटा</p>
          </div>
        </div>

        <select
          value={selectedTaluka}
          onChange={(e) => handleTalukaChange(e.target.value)}
          className="bg-sky-900 text-white text-xs font-bold rounded-lg px-2 py-1 border border-sky-600 focus:outline-none cursor-pointer"
        >
          {SOLAPUR_TALUKAS.map((t) => (
            <option key={t} value={t} className="bg-stone-900 text-white">
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Live Satellite Status Bar */}
      <div className="flex items-center justify-between px-1 mb-2.5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-extrabold text-emerald-800">
            {isLive ? '🔴 थेट उपग्रह हवामान (Live Satellite API)' : 'स्थानिक कॅशे'}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-100 hover:bg-sky-200 px-2 py-1 rounded-lg cursor-pointer transition active:scale-95"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'अपडेट होत आहे...' : `ताजी माहिती (${lastUpdated})`}</span>
        </button>
      </div>

      {weather ? (
        <>
          {/* Hero Temperature Card Matching Figure 4 (38.1°C Clouds) */}
          <div className="bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-3xl p-6 shadow-lg text-center relative overflow-hidden mb-3">
            <div className="absolute top-2 right-3 opacity-20">
              <Sun className="w-24 h-24" />
            </div>
            <div className="text-xs font-semibold text-sky-100 uppercase tracking-widest">
              {weather.taluka} ({weather.district})
            </div>
            <div className="text-5xl font-extrabold tracking-tight mt-1 mb-1 font-sans">
              {weather.temp}°C
            </div>
            <div className="text-base font-bold text-sky-100 flex items-center justify-center gap-1.5">
              <Cloud className="w-4 h-4" />
              <span>{weather.condition}</span>
            </div>
          </div>

          {/* 3 Metric Cards Matching Figure 4 (Humidity, Clouds, Wind) */}
          <div className="grid grid-cols-3 gap-2.5 mb-3 text-center">
            {/* Humidity */}
            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex justify-center text-blue-600 mb-1">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="text-base font-extrabold text-stone-900">{weather.humidity}%</div>
              <div className="text-[11px] text-stone-500 font-bold">आर्द्रता</div>
            </div>

            {/* Clouds */}
            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex justify-center text-sky-500 mb-1">
                <Cloud className="w-5 h-5" />
              </div>
              <div className="text-base font-extrabold text-stone-900">{weather.clouds}%</div>
              <div className="text-[11px] text-stone-500 font-bold">ढग</div>
            </div>

            {/* Wind Speed */}
            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex justify-center text-teal-600 mb-1">
                <Wind className="w-5 h-5" />
              </div>
              <div className="text-base font-extrabold text-stone-900">{weather.windSpeed} m/s</div>
              <div className="text-[11px] text-stone-500 font-bold">वारा</div>
            </div>
          </div>

          {/* Advisory Banner Matching Figure 4 */}
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 shadow-xs mb-3 flex items-start gap-3">
            <span className="text-2xl">🌱</span>
            <div className="flex-1">
              <div className="text-xs font-extrabold text-emerald-950 mb-0.5">
                शेतीसाठी थेट हवामान सल्ला:
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                {weather.advisoryMr}
              </p>
            </div>
            <AudioPlayerButton text={weather.advisoryMr} size="sm" label="" />
          </div>

          {/* 3-Day Forecast Matching Figure 4 */}
          <div className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-xs mb-4">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-extrabold text-stone-800">३ दिवसांचा उपग्रह अंदाज</h3>
              <span className="text-[10px] text-stone-400">Open-Meteo Satellite Feed</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {weather.forecast.map((f, i) => (
                <div
                  key={i}
                  className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-center"
                >
                  <div className="text-[11px] font-bold text-stone-600">{f.day}</div>
                  <div className="text-xl my-1">{f.icon}</div>
                  <div className="text-xs font-extrabold text-stone-900">
                    {f.tempMin}°/{f.tempMax}°
                  </div>
                  <div className="text-[10px] text-stone-500 truncate">{f.condition}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-stone-500 text-sm">
          उपग्रहाकडून हवामान माहिती लोड होत आहे...
        </div>
      )}

      {/* Prominent Voice Bar Matching Figure 4 */}
      <div
        onClick={onOpenVoice}
        className="bg-white border-2 border-sky-300 rounded-2xl p-3 shadow-2xs flex items-center justify-between cursor-pointer hover:border-sky-500 transition"
      >
        <div className="flex items-center gap-2 text-stone-700 text-xs font-semibold">
          <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center">
            <Mic className="w-4 h-4 text-sky-700" />
          </div>
          <span>बोला: "पुढील हवामान" किंवा "{selectedTaluka}"</span>
        </div>
        <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-1 rounded-lg">
          बोला
        </span>
      </div>
    </div>
  );
};
