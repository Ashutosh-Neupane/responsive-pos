// IndexedDB utility for storing product images
const DB_NAME = 'sudha-pos-db';
const STORE_NAME = 'product-images';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'productId' });
      }
    };
  });
};

export const saveProductImage = async (productId: string, imageUrl: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ productId, imageUrl });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getProductImage = async (productId: string): Promise<string | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(productId);

    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.imageUrl : null);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteProductImage = async (productId: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(productId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
