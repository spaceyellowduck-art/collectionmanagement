import { CollectionItem, Category, ExportFormat } from '../types';

/**
 * Clean string for CSV escaping
 */
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? '是' : '否';
  if (Array.isArray(val)) return `"${val.join('; ').replace(/"/g, '""')}"`;
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Clean string for TSV (Google Sheets direct clipboard format)
 */
function escapeTSV(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? '是' : '否';
  if (Array.isArray(val)) return val.join('; ');
  return String(val).replace(/\t/g, ' ').replace(/[\r\n]+/g, ' ');
}

/**
 * Collect all custom field names across items and categories
 */
function getUniqueCustomFieldKeys(items: CollectionItem[], categories: Category[]): { id: string; label: string }[] {
  const map = new Map<string, string>();

  // Add from categories definitions
  categories.forEach((cat) => {
    if (cat.fields && Array.isArray(cat.fields)) {
      cat.fields.forEach((f) => {
        if (!map.has(f.id)) {
          map.set(f.id, `${f.name} (${cat.name})`);
        }
      });
    }
  });

  // Check items for any remaining keys
  items.forEach((item) => {
    if (item.customFields) {
      Object.keys(item.customFields).forEach((key) => {
        if (!map.has(key)) {
          map.set(key, key);
        }
      });
    }
  });

  return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
}

/**
 * Generate CSV formatted string with UTF-8 BOM
 */
export function generateCSVExport(items: CollectionItem[], categories: Category[]): string {
  const customFieldKeys = getUniqueCustomFieldKeys(items, categories);

  const baseHeaders = [
    '編號',
    '藏品名稱',
    '收藏種類',
    '數量',
    '評定估值',
    '幣別',
    '是否喜愛',
    '照片數量',
    '新增時間',
    '最後更新',
    '備註故事',
  ];

  const headers = [...baseHeaders, ...customFieldKeys.map((k) => k.label)];
  const rows: string[] = [headers.map(escapeCSV).join(',')];

  items.forEach((item, index) => {
    const row = [
      index + 1,
      item.name,
      item.category,
      item.quantity || 1,
      item.estimatedValue !== null && item.estimatedValue !== undefined ? item.estimatedValue : '',
      item.currency || 'TWD',
      item.isFavorite ? '是' : '否',
      item.photos ? item.photos.length : item.photo ? 1 : 0,
      item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 19).replace('T', ' ') : '',
      item.updatedAt ? new Date(item.updatedAt).toISOString().slice(0, 19).replace('T', ' ') : '',
      item.notes || '',
    ];

    // Append custom fields
    customFieldKeys.forEach((k) => {
      const val = item.customFields ? item.customFields[k.id] : undefined;
      row.push(val !== undefined ? val : '');
    });

    rows.push(row.map(escapeCSV).join(','));
  });

  // Add UTF-8 BOM so Excel and Google Sheets render CJK characters without corrupting
  return '\uFEFF' + rows.join('\r\n');
}

/**
 * Generate TSV formatted string for direct copy-paste to Google Sheets
 */
export function generateTSVForGoogleSheets(items: CollectionItem[], categories: Category[]): string {
  const customFieldKeys = getUniqueCustomFieldKeys(items, categories);

  const baseHeaders = [
    '序號',
    '藏品名稱',
    '收藏種類',
    '數量',
    '評定估值',
    '幣別',
    '是否喜愛',
    '照片張數',
    '收錄時間',
    '備註記事',
  ];

  const headers = [...baseHeaders, ...customFieldKeys.map((k) => k.label)];
  const rows: string[] = [headers.map(escapeTSV).join('\t')];

  items.forEach((item, index) => {
    const row = [
      index + 1,
      item.name,
      item.category,
      item.quantity || 1,
      item.estimatedValue !== null && item.estimatedValue !== undefined ? item.estimatedValue : '',
      item.currency || 'TWD',
      item.isFavorite ? '★ 喜愛' : '一般',
      item.photos ? item.photos.length : item.photo ? 1 : 0,
      item.createdAt ? new Date(item.createdAt).toLocaleDateString('zh-TW') : '',
      item.notes || '',
    ];

    customFieldKeys.forEach((k) => {
      const val = item.customFields ? item.customFields[k.id] : undefined;
      row.push(val !== undefined ? val : '');
    });

    rows.push(row.map(escapeTSV).join('\t'));
  });

  return rows.join('\n');
}

/**
 * Generate JSON Export
 */
export function generateJSONExport(items: CollectionItem[], categories: Category[]): string {
  const payload = {
    app: 'ARCHIVIST',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    totalItems: items.length,
    categories,
    items,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Helper to download text / blob to client browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
