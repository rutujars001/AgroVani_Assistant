/**
 * Offline Sync Service for AgroVani
 * Provides offline caching, pending sync queue, and automatic background sync
 * when connectivity returns in rural Solapur farms.
 */

import { SyncQueueItem } from '../types';
import { speechService } from './speechService';

const QUEUE_KEY = 'agrovani_pending_sync_queue';
const CACHE_TIMESTAMP_KEY = 'agrovani_last_cloud_sync_time';

class OfflineSyncService {
  private listeners: ((online: boolean) => void)[] = [];
  private isOnlineState: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnlineState = true;
        this.notifyListeners(true);
        this.autoSyncQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnlineState = false;
        this.notifyListeners(false);
      });
    }
  }

  isOnline(): boolean {
    return this.isOnlineState;
  }

  // Force simulated toggle for testing in UI
  setSimulatedOffline(offline: boolean) {
    this.isOnlineState = !offline;
    this.notifyListeners(!offline);
    if (!offline) {
      this.autoSyncQueue();
    }
  }

  onConnectivityChange(callback: (online: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(online: boolean) {
    this.listeners.forEach(cb => cb(online));
  }

  // Get pending queue items
  getQueue(): SyncQueueItem[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Enqueue an action when offline or for cloud sync
  enqueueAction(action: SyncQueueItem['action'], payload: any): SyncQueueItem {
    const item: SyncQueueItem = {
      id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      action,
      timestamp: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      payload,
      status: this.isOnlineState ? 'synced' : 'pending'
    };

    if (typeof window !== 'undefined') {
      const queue = this.getQueue();
      queue.unshift(item);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(0, 30)));
    }

    if (this.isOnlineState) {
      this.setLastSyncTimestamp();
    }

    return item;
  }

  // Trigger sync of pending items
  async syncNow(): Promise<{ syncedCount: number; message: string }> {
    if (!this.isOnlineState) {
      return { syncedCount: 0, message: 'सध्या इंटरनेट कनेक्शन उपलब्ध नाही. डेटा सुरक्षित साठवला आहे.' };
    }

    const queue = this.getQueue();
    const pendingItems = queue.filter(item => item.status === 'pending');

    if (pendingItems.length === 0) {
      this.setLastSyncTimestamp();
      return { syncedCount: 0, message: 'सर्व डेटा आधीच क्लाऊडवर सिंक झालेला आहे.' };
    }

    // Simulate batch cloud sync with server
    await new Promise(res => setTimeout(res, 600));

    // Update statuses to synced
    const updatedQueue = queue.map(item => ({
      ...item,
      status: 'synced' as const
    }));

    if (typeof window !== 'undefined') {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
    }

    this.setLastSyncTimestamp();
    speechService.playTone('success');
    speechService.hapticFeedback(80);

    return {
      syncedCount: pendingItems.length,
      message: `${pendingItems.length} शेती नोंदी सुरक्षितपणे क्लाऊडवर सिंक झाल्या!`
    };
  }

  private autoSyncQueue() {
    this.syncNow().catch(() => {});
  }

  getLastSyncTimestamp(): string {
    if (typeof window === 'undefined') return 'आताच';
    return localStorage.getItem(CACHE_TIMESTAMP_KEY) || 'आज, सकाळी ०८:३०';
  }

  private setLastSyncTimestamp() {
    if (typeof window === 'undefined') return;
    const now = new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    localStorage.setItem(CACHE_TIMESTAMP_KEY, `आज, ${now}`);
  }
}

export const offlineSyncService = new OfflineSyncService();
