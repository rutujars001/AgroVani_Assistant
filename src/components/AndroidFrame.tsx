import React, { useEffect } from 'react';
import { offlineSyncService } from '../services/offlineSyncService';

interface AndroidFrameProps {
  children: React.ReactNode;
  onBack?: () => void;
  onHome?: () => void;
  canGoBack?: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  useEffect(() => {
    const unsub = offlineSyncService.onConnectivityChange(() => {});
    return () => { unsub(); };
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-start select-none">
      <main className="w-full max-w-md bg-stone-50 overflow-hidden flex flex-col min-h-screen">
        <section aria-label="Application Viewport" className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative bg-stone-50">
          {children}
        </section>
      </main>
    </div>
  );
};
