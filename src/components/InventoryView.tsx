import React, { useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Heart,
  Archive,
  X,
  Download,
  FolderPlus,
  Sparkles,
} from 'lucide-react';
import { SortOption } from '../types';
import { useApp } from '../context/AppContext';
import { ItemCard } from './ItemCard';

export const InventoryView: React.FC = () => {
  const {
    items,
    categories,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    searchTerm,
    setSearchTerm,
    sortOption,
    setSortOption,
    openCreateForm,
    openCategoryModal,
    openExportModal,
    t,
  } = useApp();

  // Filter and sort computation
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Category or favorites filter
    if (selectedCategoryFilter === 'FAVORITES') {
      result = result.filter((item) => item.isFavorite);
    } else if (selectedCategoryFilter !== 'ALL') {
      result = result.filter((item) => item.category === selectedCategoryFilter);
    }

    // Keyword search filter
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.notes && item.notes.toLowerCase().includes(query))
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'oldest':
          return (a.createdAt || 0) - (b.createdAt || 0);
        case 'valHigh':
          return (Number(b.estimatedValue) || 0) - (Number(a.estimatedValue) || 0);
        case 'valLow':
          return (Number(a.estimatedValue) || 0) - (Number(b.estimatedValue) || 0);
        case 'nameAsc':
          return (a.name || '').localeCompare(b.name || '');
        case 'nameDesc':
          return (b.name || '').localeCompare(a.name || '');
        case 'qtyHigh':
          return (b.quantity || 1) - (a.quantity || 1);
        default:
          return (b.createdAt || 0) - (a.createdAt || 0);
      }
    });

    return result;
  }, [items, selectedCategoryFilter, searchTerm, sortOption]);

  const favoritesTotal = items.filter((i) => i.isFavorite).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Title and Add / Export Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E4DDD2] dark:border-[#38322B] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif-tc text-2xl sm:text-3xl font-bold tracking-tight text-[#2A2521] dark:text-[#EDE6DE]">
              {t('inventoryTitle')}
            </h1>
            <span className="rounded-full bg-[#B85D19]/10 dark:bg-[#D77937]/20 px-3 py-1 font-cinzel text-xs font-semibold text-[#B85D19] dark:text-[#D77937]">
              {items.length} {t('itemsUnit')}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
            {t('inventorySubtitle')}
          </p>
        </div>

        {/* Action Buttons: Export & Add */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={openExportModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] hover:bg-[#F8F5F0] dark:hover:bg-[#2C2824] px-4 py-2.5 font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] shadow-2xs transition-colors"
          >
            <Download className="h-4 w-4 text-[#B85D19] dark:text-[#D77937]" />
            <span>匯出 (JSON/CSV/試算表)</span>
          </button>

          <button
            type="button"
            onClick={() =>
              openCreateForm(
                selectedCategoryFilter !== 'ALL' && selectedCategoryFilter !== 'FAVORITES'
                  ? selectedCategoryFilter
                  : undefined
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] px-5 py-2.5 font-serif-tc text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{t('addNewItem')}</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Search & Sort */}
      <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-4 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7E746A] dark:text-[#A3978B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] pl-10 pr-9 py-2.5 text-sm text-[#2A2521] dark:text-[#EDE6DE] placeholder-[#7E746A]/60 dark:placeholder-[#A3978B]/60 focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E746A] hover:text-[#2A2521] dark:hover:text-[#EDE6DE]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif-tc text-[#7E746A] dark:text-[#A3978B] whitespace-nowrap flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t('sortBy')}：
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] px-3 py-2 text-xs font-serif-tc text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden cursor-pointer"
            >
              <option value="newest">{t('sortNewest')}</option>
              <option value="oldest">{t('sortOldest')}</option>
              <option value="valHigh">{t('sortValHigh')}</option>
              <option value="valLow">{t('sortValLow')}</option>
              <option value="nameAsc">{t('sortNameAsc')}</option>
              <option value="nameDesc">{t('sortNameDesc')}</option>
              <option value="qtyHigh">{t('sortQtyHigh')}</option>
            </select>
          </div>
        </div>

        {/* Category Chips Bar with + 新增分類 Button */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
          {/* All */}
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-serif-tc whitespace-nowrap transition-all ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-[#B85D19] text-white font-medium shadow-xs dark:bg-[#D77937]'
                : 'border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] text-[#2A2521] dark:text-[#EDE6DE] hover:border-[#B85D19] dark:hover:border-[#D77937]'
            }`}
          >
            <span>{t('allCategories')}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedCategoryFilter === 'ALL'
                  ? 'bg-white/30 text-white'
                  : 'bg-[#E4DDD2] dark:bg-[#2C2824] text-[#7E746A] dark:text-[#A3978B]'
              }`}
            >
              {items.length}
            </span>
          </button>

          {/* Favorites Filter Chip */}
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('FAVORITES')}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-serif-tc whitespace-nowrap transition-all ${
              selectedCategoryFilter === 'FAVORITES'
                ? 'bg-[#E05353] text-white font-medium shadow-xs'
                : 'border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] text-[#E05353] hover:border-[#E05353]'
            }`}
          >
            <Heart className="h-3 w-3 fill-current" />
            <span>{t('onlyFavorites')}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedCategoryFilter === 'FAVORITES'
                  ? 'bg-white/30 text-white'
                  : 'bg-[#FDF1F1] text-[#E05353] dark:bg-[#382020]'
              }`}
            >
              {favoritesTotal}
            </span>
          </button>

          {/* Individual Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryFilter === cat.name;
            const count = items.filter((i) => i.category === cat.name).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat.name)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-serif-tc whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#B85D19] text-white font-medium shadow-xs dark:bg-[#D77937]'
                    : 'border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] text-[#2A2521] dark:text-[#EDE6DE] hover:border-[#B85D19] dark:hover:border-[#D77937]'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected
                      ? 'bg-white/30 text-white'
                      : 'bg-[#E4DDD2] dark:bg-[#2C2824] text-[#7E746A] dark:text-[#A3978B]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* + Add Category Button */}
          <button
            type="button"
            onClick={openCategoryModal}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#B85D19] dark:border-[#D77937] bg-white/70 dark:bg-[#221F1C] px-3.5 py-1.5 text-xs font-serif-tc text-[#B85D19] dark:text-[#D77937] hover:bg-[#B85D19]/10 transition-colors whitespace-nowrap"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span>+ 新增種類</span>
          </button>
        </div>
      </div>

      {/* Results Count & Clear Filter */}
      <div className="flex items-center justify-between text-xs font-serif-tc text-[#7E746A] dark:text-[#A3978B] px-1">
        <span>
          {t('showingItems', { count: filteredAndSortedItems.length })}
          {items.length !== filteredAndSortedItems.length && ` (自總數 ${items.length} 件中篩選)`}
        </span>

        {(searchTerm || selectedCategoryFilter !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategoryFilter('ALL');
            }}
            className="text-[#B85D19] dark:text-[#D77937] hover:underline flex items-center gap-1"
          >
            <span>清除所有篩選條件</span>
          </button>
        )}
      </div>

      {/* Grid of Items */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E4DDD2] dark:border-[#38322B] bg-white/50 dark:bg-[#221F1C]/50 p-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F7EFE7] dark:bg-[#35261C] text-[#B85D19] dark:text-[#D77937] mb-3">
            <Archive className="h-7 w-7" />
          </div>
          <h3 className="font-serif-tc text-lg font-semibold text-[#2A2521] dark:text-[#EDE6DE]">
            {t('emptyInventoryTitle')}
          </h3>
          <p className="mt-1 text-xs text-[#7E746A] dark:text-[#A3978B] max-w-sm">
            {t('emptyInventoryDesc')}
          </p>
          <div className="mt-5 flex gap-3">
            {(searchTerm || selectedCategoryFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategoryFilter('ALL');
                }}
                className="rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-4 py-2 font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE]"
              >
                重設篩選
              </button>
            )}
            <button
              type="button"
              onClick={() => openCreateForm()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#B85D19] dark:bg-[#D77937] px-4 py-2 font-serif-tc text-xs font-semibold text-white shadow-xs hover:bg-[#9E4E13] dark:hover:bg-[#E88949]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t('addNewItem')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
