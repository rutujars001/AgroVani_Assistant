import React, { useState } from 'react';
import { AlertTriangle, Volume2, Share2, ChevronRight, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { hazardAlertService, SOLAPUR_HAZARD_ALERTS } from '../services/hazardAlertService';
import { speechService } from '../services/speechService';
import { WeatherHazardAlert } from '../types';

interface EarlyWarningBannerProps {
  onOpenDetails?: (alert: WeatherHazardAlert) => void;
}

export const EarlyWarningBanner: React.FC<EarlyWarningBannerProps> = ({ onOpenDetails }) => {
  const [alerts, setAlerts] = useState<WeatherHazardAlert[]>(SOLAPUR_HAZARD_ALERTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [selectedAlertModal, setSelectedAlertModal] = useState<WeatherHazardAlert | null>(null);

  if (alerts.length === 0) return null;

  const currentAlert = alerts[currentIndex] || alerts[0];

  const handlePlayAudio = (e: React.MouseEvent, alertToPlay?: WeatherHazardAlert) => {
    e.stopPropagation();
    speechService.stopSpeaking();
    speechService.hapticFeedback(30);
    speechService.speak((alertToPlay || currentAlert).audioText);
  };

  const handleShareWhatsApp = (e: React.MouseEvent, alertToShare?: WeatherHazardAlert) => {
    e.stopPropagation();
    speechService.hapticFeedback(25);
    const encoded = hazardAlertService.generateWhatsAppShareText(alertToShare || currentAlert);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleOpenAlert = (alertToOpen?: WeatherHazardAlert) => {
    speechService.hapticFeedback(20);
    const selected = alertToOpen || currentAlert;
    setSelectedAlertModal(selected);
    if (onOpenDetails) onOpenDetails(selected);
  };

  return (
    <>
      {isDismissed ? (
        <div
          onClick={() => {
            speechService.hapticFeedback(25);
            handleOpenAlert();
          }}
          className="mb-2 py-1.5 px-3 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded-xl flex items-center justify-between text-xs font-bold text-rose-900 cursor-pointer active:scale-95 transition"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
            <span className="truncate">🚨 {alerts.length} आपत्कालीन कीड व हवामान इशारे सक्रिय</span>
          </div>
          <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-lg shrink-0 ml-1">
            इशारा पहा
          </span>
        </div>
      ) : (
        <div
          onClick={() => handleOpenAlert()}
          className={`mb-3 p-3 rounded-2xl border-2 transition-all cursor-pointer shadow-xs select-none relative overflow-hidden ${
            currentAlert.severity === 'critical'
              ? 'bg-rose-50 border-rose-400 hover:bg-rose-100/70'
              : 'bg-amber-50 border-amber-400 hover:bg-amber-100/70'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                currentAlert.severity === 'critical'
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-600 text-white'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                    currentAlert.severity === 'critical'
                      ? 'bg-rose-700 text-white'
                      : 'bg-amber-700 text-white'
                  }`}
                >
                  {currentAlert.severity === 'critical' ? 'अति-दक्षता इशारा' : 'हवामान सतर्कता'}
                </span>
                <span className="text-[10px] text-stone-500 font-bold truncate">
                  {currentAlert.source.split(' ')[0]}
                </span>
              </div>

              <h4 className="text-xs font-extrabold text-stone-900 mt-1 line-clamp-1">
                {currentAlert.titleMr}
              </h4>

              <p className="text-[11px] text-stone-700 mt-0.5 line-clamp-1">
                {currentAlert.advisoryActionMr}
              </p>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <button
                  onClick={(e) => handlePlayAudio(e)}
                  className="flex items-center gap-1 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-2xs cursor-pointer active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>इशारा ऐका</span>
                </button>

                <button
                  onClick={(e) => handleShareWhatsApp(e)}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-2xs cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3 h-3" />
                  <span>व्हॉट्सॲपवर पाठवा</span>
                </button>
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              className="absolute top-2 right-2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              title="कमी करा"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Full Alert Modal with Multi-alert tabs */}
      {selectedAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full shadow-2xl border-2 border-rose-400 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h4 className="text-sm font-extrabold text-stone-900">
                  हवामान व कीड आपत्कालीन इशारे
                </h4>
              </div>
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="text-stone-400 hover:text-stone-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Multi-Alert Selector Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {alerts.map((a, idx) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAlertModal(a)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 border cursor-pointer ${
                    selectedAlertModal.id === a.id
                      ? 'bg-rose-700 text-white border-rose-700'
                      : 'bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  इशारा {idx + 1}: {a.affectedCrops.join(', ')}
                </button>
              ))}
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-extrabold text-rose-900 text-sm">
                {selectedAlertModal.titleMr}
              </div>

              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 leading-relaxed">
                <strong>इशारा पार्श्वभूमी: </strong>
                {selectedAlertModal.messageMr}
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 leading-relaxed">
                <strong>तातडीने करावयाचा उपाय: </strong>
                {selectedAlertModal.advisoryActionMr}
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                <span>मुदत: <strong>{selectedAlertModal.validUntil}</strong></span>
                <span>प्रभावित पिके: <strong>{selectedAlertModal.affectedCrops.join(', ')}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={(e) => handlePlayAudio(e, selectedAlertModal)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-stone-700" />
                <span>ऐका</span>
              </button>
              <button
                onClick={(e) => handleShareWhatsApp(e, selectedAlertModal)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer shadow-xs active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>व्हॉट्सॲपवर पाठवा</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
