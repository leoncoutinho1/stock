/**
 * Minimal Session / Token Storage Service for Web PWA
 * Handles session tokens required for backend HTTP Authorization header
 */
export const Storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage remove error:", e);
    }
  }
};

export const SecureStore = {
  getItemAsync: Storage.getItem,
  setItemAsync: Storage.setItem,
  deleteItemAsync: Storage.removeItem,
};

export default Storage;
