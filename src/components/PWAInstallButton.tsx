import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { speechService } from '../services/speechService';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone Android mode, don't show prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    speechService.hapticFeedback(50);
    speechService.playTone('confirm');
    await install();
  };

  return (
    <>
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold px-3 py-1.5 text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>अ‍ॅप इन्स्टॉल करा</span>
        </button>
      )}

      {isIOS && !isInstalled && (
        <>
          <button
            onClick={() => {
              speechService.hapticFeedback(30);
              setShowIOSGuide(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>इन्स्टॉल करा</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-stone-900 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h3 className="text-base font-bold text-emerald-800">अ‍ॅग्रोवाणी इन्स्टॉल करा</h3>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="p-1 rounded-full text-stone-500 hover:bg-stone-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-3 text-sm space-y-2 text-stone-700">
                  <p>१. सफारी ब्राऊझरमधील खालील <strong>Share</strong> बटणावर टॅप करा.</p>
                  <p>२. खाली स्क्रोल करून <strong>Add to Home Screen</strong> निवडा.</p>
                  <p>३. आता तुमच्या मोबाईल स्क्रीनवर अ‍ॅग्रोवाणी थेट सुरू होईल.</p>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-4 w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
                >
                  समजले
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
