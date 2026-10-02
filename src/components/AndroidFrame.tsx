import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Maximize2, Minimize2, Smartphone } from 'lucide-react';
import { offlineSyncService } from '../services/offlineSyncService';

interface AndroidFrameProps {
  children: React.ReactNode;
  onBack?: () => void;
  onHome?: () => void;
  canGoBack?: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  onBack,
  onHome,
  canGoBack = false
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [isOnline, setIsOnline] = useState(offlineSyncService.isOnline());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    const unsub = offlineSyncService.onConnectivityChange(setIsOnline);

    return () => {
      clearInterval(timer);
      unsub();
    };
  }, []);

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-start sm:p-4 select-none">
      {/* Top Device Bar & Mode Switcher */}
      <header className="w-full max-w-md py-1.5 px-3 flex items-center justify-between text-stone-300 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] tracking-wide">AgroVani Android Edition</span>
        </div>
        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold cursor-pointer transition"
        >
          {isPhoneFrame ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>मोठा स्क्रीन (Full Screen)</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>मोबाईल फ्रेम (Phone Mode)</span>
            </>
          )}
        </button>
      </header>

      {/* Android Device Shell */}
      <main
        className={`w-full bg-stone-50 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col ${
          isPhoneFrame
            ? 'max-w-md rounded-none sm:rounded-[44px] sm:border-[9px] sm:border-stone-800 sm:ring-1 sm:ring-white/20 min-h-[92vh] sm:h-[860px]'
            : 'max-w-4xl rounded-2xl min-h-[90vh]'
        }`}
      >
        {/* Android Status Bar */}
        <section aria-label="Android Status Bar" className="w-full bg-emerald-900 text-white px-5 py-2 flex items-center justify-between text-xs font-semibold select-none shrink-0 z-20">
          <div className="flex items-center gap-1.5 font-mono text-[13px] tracking-tight">
            <span>{currentTime || '09:41'}</span>
          </div>

          {/* Android Camera Punch-hole Notch */}
          <div className="w-3.5 h-3.5 rounded-full bg-black/60 border border-emerald-950/40 hidden sm:block" />

          {/* Status Icons */}
          <div className="flex items-center gap-2.5 text-[11px]">
            <span className="text-[10px] text-emerald-200 font-bold">5G VoLTE</span>
            <Signal className="w-3.5 h-3.5 text-white" />
            <Wifi className={`w-3.5 h-3.5 ${isOnline ? 'text-white' : 'text-rose-400 opacity-60'}`} />
            <div className="flex items-center gap-1">
              <span className="text-[11px]">88%</span>
              <Battery className="w-4 h-4 text-white rotate-90" />
            </div>
          </div>
        </section>

        {/* App Main Viewport */}
        <section aria-label="Application Viewport" className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative bg-stone-50">
          {children}
        </section>

        {/* Android 3-Button Navigation Bar */}
        <nav aria-label="Android Navigation Bar" className="w-full bg-stone-900 text-stone-400 py-2.5 px-10 flex items-center justify-around shrink-0 border-t border-stone-800 select-none">
          {/* Back button */}
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className={`p-2 rounded-xl transition cursor-pointer active:scale-90 ${
              canGoBack ? 'text-stone-100 hover:bg-stone-800' : 'text-stone-600 cursor-not-allowed'
            }`}
            title="मागे जा"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H19v-2z" />
            </svg>
          </button>

          {/* Home button */}
          <button
            onClick={onHome}
            className="p-2 rounded-xl text-stone-100 hover:bg-stone-800 transition cursor-pointer active:scale-90"
            title="मुख्य पान (Home)"
          >
            <div className="w-4 h-4 rounded-full border-2 border-current" />
          </button>

          {/* Recents button */}
          <button
            onClick={() => {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(30);
              }
            }}
            className="p-2 rounded-xl text-stone-300 hover:bg-stone-800 transition cursor-pointer active:scale-90"
            title="चालू अ‍ॅप्स"
          >
            <div className="w-3.5 h-3.5 border-2 border-current rounded-xs" />
          </button>
        </nav>
      </main>
    </div>
  );
};
