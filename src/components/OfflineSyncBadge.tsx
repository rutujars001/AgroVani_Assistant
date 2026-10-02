import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { offlineSyncService } from '../services/offlineSyncService';
import { speechService } from '../services/speechService';
import { SyncQueueItem } from '../types';

export const OfflineSyncBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState(offlineSyncService.isOnline());
  const [queue, setQueue] = useState<SyncQueueItem[]>(offlineSyncService.getQueue());
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  useEffect(() => {
    const unsubscribe = offlineSyncService.onConnectivityChange((online) => {
      setIsOnline(online);
      setQueue(offlineSyncService.getQueue());
    });
    return () => unsubscribe();
  }, []);

  const pendingCount = queue.filter(q => q.status === 'pending').length;

  const handleSync = async () => {
    setIsSyncing(true);
    speechService.hapticFeedback(40);
    const res = await offlineSyncService.syncNow();
    setSyncStatusMsg(res.message);
    setQueue(offlineSyncService.getQueue());
    setIsSyncing(false);
    setTimeout(() => setSyncStatusMsg(''), 4000);
  };

  const toggleSimulatedOffline = () => {
    offlineSyncService.setSimulatedOffline(isOnline);
    setIsOnline(!isOnline);
    setQueue(offlineSyncService.getQueue());
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowDrawer(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition shadow-xs cursor-pointer ${
            isOnline
              ? pendingCount > 0
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
          }`}
          title="ऑफलाइन डेटा सिंक स्थिती"
        >
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-700" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-600" />
          )}
          <span>{isOnline ? (pendingCount > 0 ? `${pendingCount} सिंक बाकी` : 'ऑनलाइन') : 'ऑफलाइन मोड'}</span>
        </button>
      </div>

      {/* Sync Drawer Modal */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-2 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">ऑफलाइन डेटा व सिंक व्यवस्था</h3>
                  <p className="text-xs text-stone-500">सोलापूर शेतातील कमी नेटवर्कसाठी सुरक्षित सिंकिंग</p>
                </div>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <div className="text-sm font-semibold text-stone-800">नेटवर्क स्थिती</div>
                  <div className="text-xs text-stone-500">
                    {isOnline ? 'इंटरनेट चालू आहे (4G/WiFi)' : 'ऑफलाइन - कॅश केलेला डेटा उपलब्ध'}
                  </div>
                </div>
                <button
                  onClick={toggleSimulatedOffline}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isOnline ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isOnline ? 'ऑफलाइन टेस्ट करा' : 'ऑनलाइन व्हा'}
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-amber-800 font-medium">क्लाऊड सिंक बाकी नोंदी</div>
                  <div className="text-lg font-bold text-amber-950">{pendingCount} नोंदी</div>
                </div>
                <button
                  disabled={!isOnline || isSyncing}
                  onClick={handleSync}
                  className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-xl disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'सिंक होत आहे...' : 'आता सिंक करा'}</span>
                </button>
              </div>

              {syncStatusMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncStatusMsg}</span>
                </div>
              )}

              <div className="text-xs text-stone-500 pt-1">
                शेवटचा यशस्वी सिंक: <strong>{offlineSyncService.getLastSyncTimestamp()}</strong>
              </div>

              {/* Recent Sync Queue Items */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-stone-700 mb-2">शेतातील स्थानिक नोंदी (स्थानिक कॅशे):</div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs">
                  {queue.length === 0 ? (
                    <div className="text-stone-400 italic py-2 text-center">कोणत्याही प्रलंबित नोंदी नाहीत</div>
                  ) : (
                    queue.slice(0, 5).map((q) => (
                      <div key={q.id} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="text-stone-700 font-medium truncate max-w-[200px]">
                          {q.action === 'disease_query' && 'रोग निदान चौकशी (Plantix AI)'}
                          {q.action === 'voice_log' && 'आवाज संभाषण नोंद'}
                          {q.action === 'profile_update' && 'शेतकरी माहिती अपडेट'}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          q.status === 'synced' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {q.status === 'synced' ? 'सिंक झाले' : 'बाकी'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDrawer(false)}
              className="w-full mt-2 py-2.5 rounded-xl bg-stone-100 text-stone-800 font-bold text-sm hover:bg-stone-200 cursor-pointer"
            >
              बंद करा
            </button>
          </div>
        </div>
      )}
    </>
  );
};
