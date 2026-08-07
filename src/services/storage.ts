import { get, set, del } from 'idb-keyval';

/**
 * Storage Service compatible with Expo SecureStore & AsyncStorage APIs for Web PWA
 */
export const Storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const val = await get(key);
      if (val !== undefined) return val;
      return localStorage.getItem(key);
    } catch (e) {
      return localStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await set(key, value);
    } catch (e) {
      // Fallback to localStorage
    }
    localStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    try {
      await del(key);
    } catch (e) {
      // Fallback
    }
    localStorage.removeItem(key);
  }
};

// Aliases matching Expo SecureStore
export const SecureStore = {
  getItemAsync: Storage.getItem,
  setItemAsync: Storage.setItem,
  deleteItemAsync: Storage.removeItem,
};

// Alias matching AsyncStorage
export default Storage;
