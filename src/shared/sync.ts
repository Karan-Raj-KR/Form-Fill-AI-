import { getProfiles, getHistory } from './storage';
import { STORAGE_KEYS } from './constants';

export async function forceCloudSync(): Promise<void> {
  return new Promise(async (resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      try {
        const profiles = await getProfiles();
        const history = await getHistory();
        
        // We carefully trim history to comply with Chrome Sync's strict 100KB per-item quota
        const safeHistory = history.slice(0, 20); 

        chrome.storage.sync.set({
          [STORAGE_KEYS.PROFILES]: profiles,
          [STORAGE_KEYS.HISTORY]: safeHistory
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('Data Sync Quota Exceeded:', chrome.runtime.lastError);
          } else {
            console.log('✅ Synchronized form history and profiles to Cloud successfully!');
          }
          resolve();
        });
      } catch (err) {
        console.error('Cloud Sync failed', err);
        resolve();
      }
    } else {
      // Local dev server mock
      console.log('Mock: Cloud sync completed for local dev environment.');
      setTimeout(resolve, 500);
    }
  });
}
