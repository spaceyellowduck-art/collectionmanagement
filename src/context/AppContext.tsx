import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  CollectionItem,
  Category,
  CustomFieldDefinition,
  PageTab,
  SortOption,
  Language,
  ThemeMode,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import * as dbService from '../services/db';
import { CATEGORY_TEMPLATES, createFieldsFromTemplate } from '../services/templates';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  items: CollectionItem[];
  categories: Category[];
  loading: boolean;
  activeTab: PageTab;
  setActiveTab: (tab: PageTab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;

  // Filtering & Sorting
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;

  // Modals & Navigation
  selectedItemForDetail: CollectionItem | null;
  openItemDetail: (item: CollectionItem) => void;
  closeItemDetail: () => void;

  isItemFormOpen: boolean;
  itemToEdit: CollectionItem | null;
  openCreateForm: (defaultCategory?: string) => void;
  openEditForm: (item: CollectionItem) => void;
  closeItemForm: () => void;

  itemToDelete: CollectionItem | null;
  isDeleteDialogOpen: boolean;
  openDeleteDialog: (item: CollectionItem) => void;
  closeDeleteDialog: () => void;
  confirmDeleteItem: () => Promise<void>;

  // Category Creation & Field Management Modals
  isCategoryModalOpen: boolean;
  openCategoryModal: () => void;
  closeCategoryModal: () => void;

  editingCategoryForFields: Category | null;
  openFieldEditor: (category: Category) => void;
  closeFieldEditor: () => void;

  // Export Modal
  isExportModalOpen: boolean;
  openExportModal: () => void;
  closeExportModal: () => void;

  // Auto Valuation Helpers
  valuationTargetItem: CollectionItem | null;
  setValuationTargetItem: (item: CollectionItem | null) => void;
  startValuationForItem: (item: CollectionItem) => void;
  applyValuationToItem: (itemId: string, estimatedValue: number, currency: string) => Promise<boolean>;

  // Actions
  saveItemData: (
    itemData: {
      name: string;
      category: string;
      quantity: number;
      estimatedValue: number | null;
      currency: string;
      photo: string | null;
      photos: string[];
      notes: string;
      isFavorite: boolean;
      customFields?: Record<string, any>;
    },
    existingId?: string
  ) => Promise<void>;

  deletePhotoFromDetail: (photoIndex: number) => Promise<void>;
  toggleFavorite: (id: string, e?: React.MouseEvent) => Promise<void>;

  // Category Actions: 3 creation modes
  createCategoryFromTemplate: (templateId: string, customName?: string, customDesc?: string) => Promise<Category | null>;
  createBlankCategory: (name: string, description?: string) => Promise<Category | null>;
  duplicateCategory: (sourceCategoryId: string, newName: string, description?: string) => Promise<Category | null>;

  updateCategoryFields: (categoryId: string, fields: CustomFieldDefinition[]) => Promise<boolean>;
  updateCategoryInfo: (category: Category) => Promise<boolean>;
  deleteCategory: (id: string, name: string) => Promise<{ success: boolean; message?: string }>;

  resetDatabase: () => Promise<void>;
  exportBackup: () => Promise<void>;
  importBackup: (file: File) => Promise<{ success: boolean; count?: number; error?: string }>;

  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTabState] = useState<PageTab>('overview');

  // Preferences
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('archivist_lang') as Language) || 'zh-TW';
  });
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('archivist_theme') as ThemeMode) || 'light';
  });

  // Filter & Search
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Modals
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<CollectionItem | null>(null);
  const [isItemFormOpen, setIsItemFormOpen] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<CollectionItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CollectionItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  // Category creation & Field Editor Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategoryForFields, setEditingCategoryForFields] = useState<Category | null>(null);

  // Export Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Auto Valuation Target Item
  const [valuationTargetItem, setValuationTargetItem] = useState<CollectionItem | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('archivist_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('archivist_lang', newLang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS['zh-TW'];
      // @ts-expect-error dynamic lookup
      let text = dict[key] || TRANSLATIONS['zh-TW'][key] || key;
      if (params) {
        Object.entries(params).forEach(([paramKey, val]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
        });
      }
      return text;
    },
    [language]
  );

  const reloadData = useCallback(async () => {
    try {
      const data = await dbService.initStorage();
      setItems(data.items);
      setCategories(data.categories);
    } catch (err) {
      console.error('Failed to load data from IndexedDB:', err);
      showToast('資料庫載入失敗', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const setActiveTab = useCallback((tab: PageTab) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Detail Modal
  const openItemDetail = useCallback((item: CollectionItem) => {
    setSelectedItemForDetail(item);
  }, []);

  const closeItemDetail = useCallback(() => {
    setSelectedItemForDetail(null);
  }, []);

  // Form Modal
  const openCreateForm = useCallback((defaultCategory?: string) => {
    setItemToEdit(null);
    if (defaultCategory && defaultCategory !== 'ALL' && defaultCategory !== 'FAVORITES') {
      setSelectedCategoryFilter(defaultCategory);
    }
    setIsItemFormOpen(true);
  }, []);

  const openEditForm = useCallback((item: CollectionItem) => {
    setItemToEdit(item);
    setIsItemFormOpen(true);
    setSelectedItemForDetail(null);
  }, []);

  const closeItemForm = useCallback(() => {
    setIsItemFormOpen(false);
    setItemToEdit(null);
  }, []);

  // Delete Dialog
  const openDeleteDialog = useCallback((item: CollectionItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  }, []);

  const confirmDeleteItem = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await dbService.deleteItem(itemToDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));

      if (selectedItemForDetail?.id === itemToDelete.id) {
        setSelectedItemForDetail(null);
      }

      closeDeleteDialog();
      showToast(t('toastItemDeleted'), 'info');
    } catch (err) {
      console.error('Delete item error:', err);
      showToast('刪除藏品失敗', 'error');
    }
  }, [itemToDelete, selectedItemForDetail, closeDeleteDialog, showToast, t]);

  // Category Wizard Modal
  const openCategoryModal = useCallback(() => {
    setIsCategoryModalOpen(true);
  }, []);

  const closeCategoryModal = useCallback(() => {
    setIsCategoryModalOpen(false);
  }, []);

  // Category Field Editor Modal
  const openFieldEditor = useCallback((category: Category) => {
    setEditingCategoryForFields(category);
  }, []);

  const closeFieldEditor = useCallback(() => {
    setEditingCategoryForFields(null);
  }, []);

  // Export Modal
  const openExportModal = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  const closeExportModal = useCallback(() => {
    setIsExportModalOpen(false);
  }, []);

  // Valuation Navigation & Apply Action
  const startValuationForItem = useCallback((item: CollectionItem) => {
    setValuationTargetItem(item);
    setSelectedItemForDetail(null);
    setActiveTabState('valuation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const applyValuationToItem = useCallback(
    async (itemId: string, estimatedValue: number, currency: string): Promise<boolean> => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return false;

      const updatedItem: CollectionItem = {
        ...item,
        estimatedValue,
        currency,
        updatedAt: Date.now(),
      };

      try {
        await dbService.saveItem(updatedItem);
        setItems((prev) => prev.map((i) => (i.id === itemId ? updatedItem : i)));
        if (selectedItemForDetail?.id === itemId) {
          setSelectedItemForDetail(updatedItem);
        }
        if (valuationTargetItem?.id === itemId) {
          setValuationTargetItem(updatedItem);
        }
        showToast(`已成功套用估值至「${item.name}」！`, 'success');
        return true;
      } catch (err) {
        console.error('Apply valuation error:', err);
        showToast('套用估值失敗', 'error');
        return false;
      }
    },
    [items, selectedItemForDetail, valuationTargetItem, showToast]
  );

  // Save Item Data (supporting multiple photos and custom fields)
  const saveItemData = useCallback(
    async (
      formData: {
        name: string;
        category: string;
        quantity: number;
        estimatedValue: number | null;
        currency: string;
        photo: string | null;
        photos: string[];
        notes: string;
        isFavorite: boolean;
        customFields?: Record<string, any>;
      },
      existingId?: string
    ) => {
      try {
        const now = Date.now();
        const primaryPhoto = formData.photos && formData.photos.length > 0 ? formData.photos[0] : formData.photo;

        let targetItem: CollectionItem;

        if (existingId) {
          const existing = items.find((i) => i.id === existingId);
          // Preserve existing customFields so any fields not in the form are NOT lost!
          const mergedCustomFields = {
            ...(existing?.customFields || {}),
            ...(formData.customFields || {}),
          };

          targetItem = {
            id: existingId,
            ...formData,
            photo: primaryPhoto,
            photos: formData.photos && formData.photos.length > 0 ? formData.photos : primaryPhoto ? [primaryPhoto] : [],
            customFields: mergedCustomFields,
            createdAt: existing ? existing.createdAt : now,
            updatedAt: now,
          };
        } else {
          targetItem = {
            id: `item-${now}-${Math.random().toString(36).substring(2, 7)}`,
            ...formData,
            photo: primaryPhoto,
            photos: formData.photos && formData.photos.length > 0 ? formData.photos : primaryPhoto ? [primaryPhoto] : [],
            customFields: formData.customFields || {},
            createdAt: now,
            updatedAt: now,
          };
        }

        await dbService.saveItem(targetItem);

        setItems((prev) => {
          const idx = prev.findIndex((i) => i.id === targetItem.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = targetItem;
            return next;
          }
          return [targetItem, ...prev];
        });

        if (selectedItemForDetail?.id === targetItem.id) {
          setSelectedItemForDetail(targetItem);
        }

        closeItemForm();

        if (!existingId && targetItem.isFavorite) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#B85D19', '#E6A868', '#D77937', '#FFF0DC'],
          });
        }

        showToast(t('toastItemSaved'), 'success');

        // Requirement: "儲存後返回原本的分類列表，並同步更新總覽、喜愛收藏及統計。"
        setActiveTabState('inventory');
      } catch (err) {
        console.error('Save item error:', err);
        showToast('儲存藏品失敗，請重試', 'error');
      }
    },
    [items, selectedItemForDetail, closeItemForm, showToast, t]
  );

  // Delete photo directly from detail modal
  const deletePhotoFromDetail = useCallback(
    async (photoIndex: number) => {
      if (!selectedItemForDetail) return;
      const currentPhotos = [...(selectedItemForDetail.photos || [])];
      if (photoIndex < 0 || photoIndex >= currentPhotos.length) return;

      currentPhotos.splice(photoIndex, 1);
      const updatedItem: CollectionItem = {
        ...selectedItemForDetail,
        photos: currentPhotos,
        photo: currentPhotos.length > 0 ? currentPhotos[0] : null,
        updatedAt: Date.now(),
      };

      try {
        await dbService.saveItem(updatedItem);
        setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
        setSelectedItemForDetail(updatedItem);
        showToast('已刪除照片', 'info');
      } catch (err) {
        console.error('Delete photo error:', err);
        showToast('刪除照片失敗', 'error');
      }
    },
    [selectedItemForDetail, showToast]
  );

  // Toggle Favorite
  const toggleFavorite = useCallback(
    async (id: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }

      const item = items.find((i) => i.id === id);
      if (!item) return;

      const updatedItem: CollectionItem = {
        ...item,
        isFavorite: !item.isFavorite,
        updatedAt: Date.now(),
      };

      try {
        await dbService.saveItem(updatedItem);
        setItems((prev) => prev.map((i) => (i.id === id ? updatedItem : i)));

        if (selectedItemForDetail?.id === id) {
          setSelectedItemForDetail(updatedItem);
        }

        if (updatedItem.isFavorite) {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#E05353', '#B85D19', '#F6EDE4'],
          });
        }

        showToast(t('toastFavToggled'), 'info');
      } catch (err) {
        console.error('Toggle favorite error:', err);
      }
    },
    [items, selectedItemForDetail, showToast, t]
  );

  // 1. Create Category from Template
  const createCategoryFromTemplate = useCallback(
    async (templateId: string, customName?: string, customDesc?: string): Promise<Category | null> => {
      const template = CATEGORY_TEMPLATES.find((t) => t.id === templateId);
      if (!template) {
        showToast('找不到指定的分類範本', 'error');
        return null;
      }

      const name = customName?.trim() || template.name;
      if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        showToast(t('categoryExistsWarning'), 'error');
        return null;
      }

      const newCategory: Category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        description: customDesc?.trim() || template.description,
        templateId: template.id,
        fields: createFieldsFromTemplate(template),
        createdAt: Date.now(),
      };

      try {
        await dbService.saveCategory(newCategory);
        setCategories((prev) => [...prev, newCategory]);
        showToast(`已根據「${template.name}」範本建立新分類`, 'success');
        closeCategoryModal();
        return newCategory;
      } catch (err) {
        console.error('Create category from template error:', err);
        showToast('建立分類失敗', 'error');
        return null;
      }
    },
    [categories, closeCategoryModal, showToast, t]
  );

  // 2. Create Blank Category
  const createBlankCategory = useCallback(
    async (name: string, description?: string): Promise<Category | null> => {
      const trimmed = name.trim();
      if (!trimmed) return null;

      if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
        showToast(t('categoryExistsWarning'), 'error');
        return null;
      }

      const newCategory: Category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: trimmed,
        description: description?.trim() || '',
        fields: [],
        createdAt: Date.now(),
      };

      try {
        await dbService.saveCategory(newCategory);
        setCategories((prev) => [...prev, newCategory]);
        showToast(`已建立空白分類「${trimmed}」`, 'success');
        closeCategoryModal();
        return newCategory;
      } catch (err) {
        console.error('Create blank category error:', err);
        showToast('建立分類失敗', 'error');
        return null;
      }
    },
    [categories, closeCategoryModal, showToast, t]
  );

  // 3. Duplicate Existing Category
  const duplicateCategory = useCallback(
    async (sourceCategoryId: string, newName: string, description?: string): Promise<Category | null> => {
      const source = categories.find((c) => c.id === sourceCategoryId);
      if (!source) {
        showToast('找不到來源分類', 'error');
        return null;
      }

      const trimmed = newName.trim();
      if (!trimmed) return null;

      if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
        showToast(t('categoryExistsWarning'), 'error');
        return null;
      }

      // Deep copy fields with fresh IDs
      const clonedFields: CustomFieldDefinition[] = (source.fields || []).map((f, idx) => ({
        ...f,
        id: `f_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      }));

      const newCategory: Category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: trimmed,
        description: description?.trim() || source.description || '',
        templateId: source.templateId,
        fields: clonedFields,
        createdAt: Date.now(),
      };

      try {
        await dbService.saveCategory(newCategory);
        setCategories((prev) => [...prev, newCategory]);
        showToast(`已成功複製分類「${source.name}」為「${trimmed}」`, 'success');
        closeCategoryModal();
        return newCategory;
      } catch (err) {
        console.error('Duplicate category error:', err);
        showToast('複製分類失敗', 'error');
        return null;
      }
    },
    [categories, closeCategoryModal, showToast, t]
  );

  // Update Category Fields (guaranteeing existing items' customFields are untouched)
  const updateCategoryFields = useCallback(
    async (categoryId: string, fields: CustomFieldDefinition[]): Promise<boolean> => {
      const target = categories.find((c) => c.id === categoryId);
      if (!target) return false;

      const updatedCategory: Category = {
        ...target,
        fields,
      };

      try {
        await dbService.saveCategory(updatedCategory);
        setCategories((prev) => prev.map((c) => (c.id === categoryId ? updatedCategory : c)));
        if (editingCategoryForFields?.id === categoryId) {
          setEditingCategoryForFields(updatedCategory);
        }
        showToast(`已更新「${target.name}」欄位設定，既有藏品資料均完整保留`, 'success');
        return true;
      } catch (err) {
        console.error('Update category fields error:', err);
        showToast('更新欄位設定失敗', 'error');
        return false;
      }
    },
    [categories, editingCategoryForFields, showToast]
  );

  // Update Category Name / Info
  const updateCategoryInfo = useCallback(
    async (category: Category): Promise<boolean> => {
      const oldCat = categories.find((c) => c.id === category.id);
      if (!oldCat) return false;

      try {
        await dbService.saveCategory(category);
        setCategories((prev) => prev.map((c) => (c.id === category.id ? category : c)));

        // If category name changed, update items matching old name
        if (oldCat.name !== category.name) {
          const matchingItems = items.filter((i) => i.category === oldCat.name);
          for (const item of matchingItems) {
            const updated = { ...item, category: category.name, updatedAt: Date.now() };
            await dbService.saveItem(updated);
          }
          setItems((prev) =>
            prev.map((i) => (i.category === oldCat.name ? { ...i, category: category.name } : i))
          );
        }

        showToast('分類資料已更新', 'success');
        return true;
      } catch (err) {
        console.error('Update category info error:', err);
        showToast('更新失敗', 'error');
        return false;
      }
    },
    [categories, items, showToast]
  );

  // Delete Category
  const deleteCategory = useCallback(
    async (id: string, name: string): Promise<{ success: boolean; message?: string }> => {
      const relatedCount = items.filter((i) => i.category === name).length;
      if (relatedCount > 0) {
        const msg = t('categoryInUseWarning', { name, count: relatedCount });
        showToast(msg, 'error');
        return { success: false, message: msg };
      }

      try {
        await dbService.deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        if (selectedCategoryFilter === name) {
          setSelectedCategoryFilter('ALL');
        }
        showToast(t('categoryDeletedSuccess', { name }), 'info');
        return { success: true };
      } catch (err) {
        console.error('Delete category error:', err);
        return { success: false, message: '刪除失敗' };
      }
    },
    [items, selectedCategoryFilter, showToast, t]
  );

  // Reset database
  const resetDatabase = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dbService.resetToDemoData();
      setItems(res.items);
      setCategories(res.categories);
      setSelectedCategoryFilter('ALL');
      setSearchTerm('');
      setSelectedItemForDetail(null);
      showToast(t('toastResetSuccess'), 'success');
    } catch (err) {
      console.error('Reset database error:', err);
      showToast('重置示範資料失敗', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  // Export JSON backup
  const exportBackup = useCallback(async () => {
    try {
      const jsonStr = await dbService.exportDatabaseJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `archivist_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(t('toastExportSuccess'), 'success');
    } catch (err) {
      console.error('Export backup error:', err);
      showToast('匯出備份失敗', 'error');
    }
  }, [showToast, t]);

  // Import JSON backup
  const importBackup = useCallback(
    async (file: File): Promise<{ success: boolean; count?: number; error?: string }> => {
      try {
        const text = await file.text();
        const res = await dbService.importDatabaseJSON(text);
        await reloadData();
        showToast(t('toastImportSuccess', { count: res.itemsCount }), 'success');
        return { success: true, count: res.itemsCount };
      } catch (err: unknown) {
        console.error('Import backup error:', err);
        const errorMsg = err instanceof Error ? err.message : '檔案格式不正確';
        showToast(`匯入失敗: ${errorMsg}`, 'error');
        return { success: false, error: errorMsg };
      }
    },
    [reloadData, showToast, t]
  );

  return (
    <AppContext.Provider
      value={{
        items,
        categories,
        loading,
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        theme,
        setTheme,
        t,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        searchTerm,
        setSearchTerm,
        sortOption,
        setSortOption,
        selectedItemForDetail,
        openItemDetail,
        closeItemDetail,
        isItemFormOpen,
        itemToEdit,
        openCreateForm,
        openEditForm,
        closeItemForm,
        itemToDelete,
        isDeleteDialogOpen,
        openDeleteDialog,
        closeDeleteDialog,
        confirmDeleteItem,
        isCategoryModalOpen,
        openCategoryModal,
        closeCategoryModal,
        editingCategoryForFields,
        openFieldEditor,
        closeFieldEditor,
        isExportModalOpen,
        openExportModal,
        closeExportModal,
        valuationTargetItem,
        setValuationTargetItem,
        startValuationForItem,
        applyValuationToItem,
        saveItemData,
        deletePhotoFromDetail,
        toggleFavorite,
        createCategoryFromTemplate,
        createBlankCategory,
        duplicateCategory,
        updateCategoryFields,
        updateCategoryInfo,
        deleteCategory,
        resetDatabase,
        exportBackup,
        importBackup,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
