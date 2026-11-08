export type CurrencyCode = 'TWD' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'HKD' | 'CNY' | 'SGD' | 'AUD' | 'CHF';

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multiSelect'
  | 'url'
  | 'boolean';

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: CustomFieldType;
  options?: string[]; // Used for select & multiSelect
  placeholder?: string;
  unit?: string; // e.g. '克', 'mm', '卷'
  required?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  templateId?: string;
  fields: CustomFieldDefinition[];
  createdAt?: number;
}

export interface CollectionItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  estimatedValue: number | null;
  currency: string;
  photo: string | null; // Primary photo (for backward compatibility)
  photos: string[]; // Multiple photos array
  notes: string;
  isFavorite: boolean;
  customFields?: Record<string, any>; // Keyed by field id or field name
  createdAt: number;
  updatedAt: number;
}

export interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  iconName: string;
  fields: Omit<CustomFieldDefinition, 'id'>[];
}

export type PageTab =
  | 'overview'
  | 'inventory'
  | 'favorites'
  | 'statistics'
  | 'valuation'
  | 'settings';

export interface ValuationSource {
  title: string;
  url: string;
}

export interface ValuationResult {
  estimatedValue: number;
  lowEstimate: number;
  highEstimate: number;
  currency: string;
  marketTrend: 'rising' | 'stable' | 'cooling';
  trendSummary: string;
  rarity?: string;
  rarityLabel?: string;
  appraisalNotes: string;
  keyFactors: string[];
  groundingSources: ValuationSource[];
  isFallback?: boolean;
  fallbackNotice?: string;
  evaluatedAt: number;
  rawSummary?: string;
}

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'valHigh'
  | 'valLow'
  | 'nameAsc'
  | 'nameDesc'
  | 'qtyHigh';

export type Language = 'zh-TW' | 'en' | 'zh-CN';

export type ThemeMode = 'light' | 'dark';

export type ExportFormat = 'json' | 'csv' | 'google-sheets';
export type ExportScope = 'all' | 'filtered' | 'favorites';
