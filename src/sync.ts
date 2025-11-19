import { store } from './store';

const SYNC_URL = process.env.EXPO_PUBLIC_SYNC_URL || 'http://localhost:3000/sync';

export async function syncToServer() {
  const payload = {
    products: store.getTable?.('products') ?? {},
    sales: store.getTable?.('sales') ?? {},
    timestamp: Date.now(),
  };
  try {
    await fetch(SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {}
}