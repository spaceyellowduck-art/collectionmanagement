import { CollectionItem, Category, CustomFieldDefinition } from '../types';
import { CATEGORY_TEMPLATES, createFieldsFromTemplate } from './templates';

const DB_NAME = 'ArchivistCollectionDB';
const DB_VERSION = 2; // Incremented version for new schema support

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: '腕錶飾品',
    description: '經典機械手錶、懷錶及珠寶配飾',
    templateId: 'watch',
    fields: createFieldsFromTemplate(CATEGORY_TEMPLATES.find((t) => t.id === 'watch')!),
  },
  {
    id: 'cat-2',
    name: '黑膠唱片',
    description: '首版唱片、爵士與古典黑膠珍藏',
    templateId: 'vinyl',
    fields: createFieldsFromTemplate(CATEGORY_TEMPLATES.find((t) => t.id === 'vinyl')!),
  },
  {
    id: 'cat-3',
    name: '經典相機',
    description: '機械底片相機、旁軸連動鏡頭',
    fields: [
      { id: 'f_cam_1', name: '相機品牌', type: 'text', placeholder: 'Leica, Hasselblad, Nikon' },
      { id: 'f_cam_2', name: '快門類型', type: 'select', options: ['布簾焦點平面快門', '鏡間快門', '金屬縱走快門'] },
      { id: 'f_cam_3', name: '鏡頭卡口', type: 'text', placeholder: 'M 卡口, L39 螺牙, F 卡口' },
      { id: 'f_cam_4', name: '附帶原裝遮光罩皮套', type: 'boolean' },
    ],
  },
  {
    id: 'cat-4',
    name: '漫畫書籍',
    description: '經典漫畫、輕小說、首刷限定出版物',
    templateId: 'manga',
    fields: createFieldsFromTemplate(CATEGORY_TEMPLATES.find((t) => t.id === 'manga')!),
  },
  {
    id: 'cat-5',
    name: '模型公仔',
    description: '比例模型、限定手辦、機甲合金與雕像',
    templateId: 'figure',
    fields: createFieldsFromTemplate(CATEGORY_TEMPLATES.find((t) => t.id === 'figure')!),
  },
  {
    id: 'cat-6',
    name: '硬幣古幣',
    description: '流通銀圓、紀念金幣與權威機構評級幣',
    templateId: 'coin',
    fields: createFieldsFromTemplate(CATEGORY_TEMPLATES.find((t) => t.id === 'coin')!),
  },
];

export const PRESET_PHOTOS = [
  {
    label: 'Vintage Watch (腕錶)',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Watch Details (機芯錶背)',
    url: 'https://images.unsplash.com/photo-1547996160-71dfabb1a7b1?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Vinyl Record (黑膠)',
    url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Vinyl Cover (封套背面)',
    url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Classic Camera (相機)',
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Camera Lens (鏡頭)',
    url: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Art & Manga (漫畫書籍)',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Scale Figure (模型公仔)',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Rare Coins (古幣評級)',
    url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Ceramics (茶道具)',
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80',
  },
];

export const SEED_ITEMS: CollectionItem[] = [
  {
    id: 'item-demo-1',
    name: 'Rolex Submariner 1978 Vintage 5513',
    category: '腕錶飾品',
    quantity: 1,
    estimatedValue: 420000,
    currency: 'TWD',
    photo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    photos: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1547996160-71dfabb1a7b1?auto=format&fit=crop&w=900&q=80',
    ],
    notes: '附原始打孔證書與原裝盒裝，膏藥點面盤氧化勻稱呈柔和奶油色，原裝 9315 摺疊鋼帶，日常佩戴與收藏兼備。',
    isFavorite: true,
    customFields: {
      '品牌 / 錶廠': 'Rolex (勞力士)',
      '型號 / Ref. 序號': '5513 Submariner',
      機芯類型: '自動上鍊機械 (Cal. 1520)',
      錶徑: 40,
      錶殼材質: '不鏽鋼 (Oystersteel)',
      '原廠保卡與外盒齊全 (Full Set)': true,
      '出廠/保卡年份': 1978,
    },
    createdAt: Date.now() - 86400000 * 9,
    updatedAt: Date.now() - 86400000 * 9,
  },
  {
    id: 'item-demo-2',
    name: 'Miles Davis - Kind of Blue (1959 Columbia 6-Eye Mono 首版)',
    category: '黑膠唱片',
    quantity: 1,
    estimatedValue: 28500,
    currency: 'TWD',
    photo: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=900&q=80',
    photos: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=900&q=80',
    ],
    notes: '美版初代 Columbia 經典六眼深溝標籤，矩陣號刻印清晰。封套僅邊緣有些許自然泛黃，盤面經超音波清洗無雜音，品相達 EX+ 等級。',
    isFavorite: true,
    customFields: {
      '演出藝人 / 樂團': 'Miles Davis Quintet',
      發行年份: 1959,
      '唱片廠牌 / 號碼': 'Columbia CL 1355',
      唱片規格: '12吋 33⅓ RPM (LP)',
      '盤面品相等級 (Goldmine)': 'Excellent (EX+)',
      產地版本: '美版首版',
      '內附原始歌詞/海報': false,
    },
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'item-demo-3',
    name: 'Leica M3 雙回捲連動測距相機 (1955 早期序號)',
    category: '經典相機',
    quantity: 1,
    estimatedValue: 72000,
    currency: 'TWD',
    photo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    photos: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=900&q=80',
    ],
    notes: '早期雙過片版（Double Stroke），原裝皮套與 Summicron 50mm f/2 縮頭鏡頭俱全。黃斑測距對焦鮮明無霧化，慢速快門清脆順暢。',
    isFavorite: true,
    customFields: {
      相機品牌: 'Leica (徠卡)',
      快門類型: '布簾焦點平面快門',
      鏡頭卡口: 'M 卡口',
      附帶原裝遮光罩皮套: true,
    },
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'item-demo-4',
    name: '七龍珠 完全版 01-34 全套 (首刷限定書盒版)',
    category: '漫畫書籍',
    quantity: 34,
    estimatedValue: 14500,
    currency: 'TWD',
    photo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80',
    photos: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80'],
    notes: '鳥山明大師傳世巨作，東立初版一刷，書腰卡紙與典藏硬殼書盒無壓損，全彩跨頁還原完美。',
    isFavorite: false,
    customFields: {
      '作者 / 原作': '鳥山明',
      出版社: '東立出版社',
      '卷數 / 集數': 34,
      出版年份: 2004,
      印刷版次: '特裝完全版',
      首刷限定特典: true,
    },
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'item-demo-5',
    name: 'Good Smile 賽博龐克 邊緣行者 露西 1/7 比例模型',
    category: '模型公仔',
    quantity: 1,
    estimatedValue: 5600,
    currency: 'TWD',
    photo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80',
    photos: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80'],
    notes: '官方限定特典壓克力立牌齊全，面相還原度極高，塗裝細節乾淨俐落無溢色。',
    isFavorite: true,
    customFields: {
      製造商: 'Good Smile Company',
      模型比例: '1/7',
      '所屬作品 / IP': 'Cyberpunk: Edgerunners',
      材質: ['PVC', 'ABS'],
      店鋪初回特典: true,
      官方展示頁: 'https://www.goodsmile.info/',
    },
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'item-demo-6',
    name: '民國三年 袁大頭 壹圓銀幣 (NGC MS63 評級)',
    category: '硬幣古幣',
    quantity: 1,
    estimatedValue: 18000,
    currency: 'TWD',
    photo: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=900&q=80',
    photos: ['https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=900&q=80'],
    notes: '原光無洗原汁原味，邊齒規整包漿自然，NGC 密封盒保存良好。',
    isFavorite: false,
    customFields: {
      '發行國家 / 朝代': '中華民國',
      發行年份: 1914,
      材質: '純銀 (.999)',
      面額: '壹圓',
      評級機構: 'NGC',
      評級分數: 'MS63',
      重量: 26.8,
    },
    createdAt: Date.now() - 3600000 * 10,
    updatedAt: Date.now() - 3600000 * 10,
  },
];

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('items')) {
        const itemStore = db.createObjectStore('items', { keyPath: 'id' });
        itemStore.createIndex('category', 'category', { unique: false });
        itemStore.createIndex('isFavorite', 'isFavorite', { unique: false });
        itemStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

// Migrate and ensure initial seed data exists
export async function initStorage(): Promise<{ items: CollectionItem[]; categories: Category[] }> {
  // Check categories
  const categories = await getAllCategories();
  if (categories.length === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await saveCategory(cat);
    }
  } else {
    // Migration: ensure every existing category has a `fields` array
    for (const cat of categories) {
      if (!cat.fields || !Array.isArray(cat.fields)) {
        cat.fields = [];
        await saveCategory(cat);
      }
    }
  }

  // Check items
  const items = await getAllItems();
  if (items.length === 0) {
    for (const item of SEED_ITEMS) {
      await saveItem(item);
    }
  } else {
    // Migration: ensure every existing item has photos array and customFields object
    for (const item of items) {
      let changed = false;
      if (!item.photos || !Array.isArray(item.photos)) {
        item.photos = item.photo ? [item.photo] : [];
        changed = true;
      }
      if (!item.customFields || typeof item.customFields !== 'object') {
        item.customFields = {};
        changed = true;
      }
      if (changed) {
        await saveItem(item);
      }
    }
  }

  const finalItems = await getAllItems();
  const finalCategories = await getAllCategories();
  return { items: finalItems, categories: finalCategories };
}

export async function getAllItems(): Promise<CollectionItem[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('items', 'readonly');
    const store = transaction.objectStore('items');
    const request = store.getAll();

    request.onsuccess = () => {
      const res = (request.result as CollectionItem[]) || [];
      // Normalize photos array
      res.forEach((item) => {
        if (!item.photos) {
          item.photos = item.photo ? [item.photo] : [];
        }
        if (!item.customFields) {
          item.customFields = {};
        }
      });
      res.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      resolve(res);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getItemById(id: string): Promise<CollectionItem | null> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('items', 'readonly');
    const store = transaction.objectStore('items');
    const request = store.get(id);

    request.onsuccess = () => {
      const item = request.result as CollectionItem;
      if (item) {
        if (!item.photos) {
          item.photos = item.photo ? [item.photo] : [];
        }
        if (!item.customFields) {
          item.customFields = {};
        }
      }
      resolve(item || null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveItem(item: CollectionItem): Promise<void> {
  const db = await getDatabase();
  // Ensure photo and photos are in sync
  if (!item.photos) {
    item.photos = item.photo ? [item.photo] : [];
  }
  if (!item.photo && item.photos.length > 0) {
    item.photo = item.photos[0];
  }
  if (!item.customFields) {
    item.customFields = {};
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('items', 'readwrite');
    const store = transaction.objectStore('items');
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('items', 'readwrite');
    const store = transaction.objectStore('items');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('categories', 'readonly');
    const store = transaction.objectStore('categories');
    const request = store.getAll();

    request.onsuccess = () => {
      const cats = (request.result as Category[]) || [];
      cats.forEach((c) => {
        if (!c.fields || !Array.isArray(c.fields)) {
          c.fields = [];
        }
      });
      resolve(cats);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveCategory(category: Category): Promise<void> {
  const db = await getDatabase();
  if (!category.fields) {
    category.fields = [];
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('categories', 'readwrite');
    const store = transaction.objectStore('categories');
    const request = store.put(category);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('categories', 'readwrite');
    const store = transaction.objectStore('categories');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function resetToDemoData(): Promise<{ items: CollectionItem[]; categories: Category[] }> {
  const db = await getDatabase();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(['items', 'categories'], 'readwrite');
    tx.objectStore('items').clear();
    tx.objectStore('categories').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  for (const cat of DEFAULT_CATEGORIES) {
    await saveCategory(cat);
  }

  for (const item of SEED_ITEMS) {
    await saveItem(item);
  }

  return {
    items: await getAllItems(),
    categories: await getAllCategories(),
  };
}

export async function exportDatabaseJSON(): Promise<string> {
  const items = await getAllItems();
  const categories = await getAllCategories();
  const backup = {
    app: 'ARCHIVIST',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    categories,
    items,
  };
  return JSON.stringify(backup, null, 2);
}

export async function importDatabaseJSON(jsonStr: string): Promise<{ itemsCount: number; categoriesCount: number }> {
  const parsed = JSON.parse(jsonStr);
  if (!parsed.items || !Array.isArray(parsed.items)) {
    throw new Error('Invalid backup file format');
  }

  if (parsed.categories && Array.isArray(parsed.categories)) {
    for (const cat of parsed.categories) {
      if (cat.id && cat.name) {
        if (!cat.fields) cat.fields = [];
        await saveCategory(cat);
      }
    }
  }

  for (const item of parsed.items) {
    if (item.id && item.name) {
      if (!item.photos) item.photos = item.photo ? [item.photo] : [];
      if (!item.customFields) item.customFields = {};
      await saveItem(item);
    }
  }

  return {
    itemsCount: parsed.items.length,
    categoriesCount: parsed.categories ? parsed.categories.length : 0,
  };
}
