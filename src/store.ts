import { openDatabaseSync } from 'expo-sqlite';
import { createStore } from 'tinybase';
import { createExpoSqlitePersister } from 'tinybase/persisters/persister-expo-sqlite';

export const db = openDatabaseSync('stock.db');
export const store = createStore();

export const createPersister = () =>
  createExpoSqlitePersister(store, db, {
    mode: 'tabular',
    tables: {
      load: { products: 'products', sales: 'sales' },
      save: { products: 'products', sales: 'sales' },
    },
  });