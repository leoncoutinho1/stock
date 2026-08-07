import { createStore } from 'tinybase';
import { createLocalStoragePersister } from 'tinybase/persisters/persister-browser';

export const store = createStore();

export const createPersister = () =>
  createLocalStoragePersister(store, 'stock_pwa_db');