import { SCHEMA_VERSION, STORES } from '../database/schema.js';

const DB_NAME = 'loorebee-business-hub';
let dbPromise;

export function openDatabase() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, SCHEMA_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      STORES.forEach((store) => {
        const objectStore = db.objectStoreNames.contains(store.name)
          ? request.transaction.objectStore(store.name)
          : db.createObjectStore(store.name, { keyPath: store.keyPath });
        (store.indexes || []).forEach((indexName) => {
          if (!objectStore.indexNames.contains(indexName)) objectStore.createIndex(indexName, indexName, { unique: false });
        });
      });
    };
    request.onsuccess = () => resolve(request.result);
  });
  return dbPromise;
}

function storeRequest(storeName, mode = 'readonly') {
  return openDatabase().then((db) => db.transaction(storeName, mode).objectStore(storeName));
}

export async function getAll(storeName) {
  const store = await storeRequest(storeName);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getOne(storeName, id) {
  const store = await storeRequest(storeName);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function put(storeName, value) {
  const now = new Date().toISOString();
  const payload = { ...value, updatedAt: now, createdAt: value.createdAt || now };
  const store = await storeRequest(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put(payload);
    request.onsuccess = () => resolve(payload);
    request.onerror = () => reject(request.error);
  });
}

export async function bulkPut(storeName, values) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    values.forEach((value) => transaction.objectStore(storeName).put(value));
    transaction.oncomplete = () => resolve(values.length);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function remove(storeName, id) {
  const store = await storeRequest(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function clearStore(storeName) {
  const store = await storeRequest(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export const createId = (prefix = 'item') => `${prefix}_${crypto.randomUUID()}`;
