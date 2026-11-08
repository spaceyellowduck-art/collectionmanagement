import React, { useState, useMemo } from 'react';
import { Heart, Sparkles, Plus, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemCard } from './ItemCard';

export const FavoritesView: React.FC = () => {
  const { items, categories, setActiveTab, openCreateForm, t } = useApp();
  const [selectedSubCat, setSelectedSubCat] = useState<string>('ALL');

  const favoriteItems = useMemo(() => {
    return items.filter((item) => item.isFavorite);
  }, [items]);

  const filteredFavorites = useMemo(() => {
    if (selectedSubCat === 'ALL') {
      return favoriteItems;
    }
    return favoriteItems.filter((item) => item.category === selectedSubCat);
  }, [favoriteItems, selectedSubCat]);

  // Categories present in favorites
  const favCategories = useMemo(() => {
    const set = new Set(favoriteItems.map((i) => i.category));
    return categories.filter((c) => set.has(c.name));
  }, [favoriteItems, categories]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E4DDD2] dark:border-[#38322B] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif-tc text-2xl sm:text-3xl font-bold tracking-tight text-[#2A2521] dark:text-[#EDE6DE] flex items-center gap-2">
              <Heart className="h-6 w-6 text-[#E05353] fill-[#E05353]" />
              <span>{t('navFavorites')}</span>
            </h1>
            <span className="rounded-full bg-[#FDF1F1] dark:bg-[#382020] px-3 py-1 font-cinzel text-xs font-semibold text-[#E05353]">
              {favoriteItems.length} {t('itemsUnit')}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
            精選標記為至愛的私人珍藏品項，隨時品味經典細節
          </p>
        </div>

        {favoriteItems.length > 0 && (
          <button
            type="button"
            onClick={() => openCreateForm()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] px-4 py-2 font-serif-tc text-xs font-semibold text-white shadow-xs self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>{t('addNewItem')}</span>
          </button>
        )}
      </div>

      {/* Category Filter Chips if multiple categories */}
      {favCategories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedSubCat('ALL')}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-serif-tc whitespace-nowrap transition-all ${
              selectedSubCat === 'ALL'
                ? 'bg-[#B85D19] text-white font-medium shadow-xs dark:bg-[#D77937]'
                : 'border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] text-[#2A2521] dark:text-[#EDE6DE]'
            }`}
          >
            <span>{t('allCategories')}</span>
            <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
              {favoriteItems.length}
            </span>
          </button>

          {favCategories.map((cat) => {
            const count = favoriteItems.filter((i) => i.category === cat.name).length;
            const isSelected = selectedSubCat === cat.name;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedSubCat(cat.name)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-serif-tc whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#B85D19] text-white font-medium shadow-xs dark:bg-[#D77937]'
                    : 'border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] text-[#2A2521] dark:text-[#EDE6DE]'
                }`}
              >
                <span>{cat.name}</span>
                <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid or Empty State */}
      {filteredFavorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E4DDD2] dark:border-[#38322B] bg-white/50 dark:bg-[#221F1C]/50 p-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FDF1F1] dark:bg-[#382020] text-[#E05353] mb-3">
            <Heart className="h-7 w-7 stroke-current" />
          </div>
          <h3 className="font-serif-tc text-lg font-semibold text-[#2A2521] dark:text-[#EDE6DE]">
            {t('emptyFavoritesTitle')}
          </h3>
          <p className="mt-1 text-xs text-[#7E746A] dark:text-[#A3978B] max-w-sm">
            {t('emptyFavoritesDesc')}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#B85D19] dark:bg-[#D77937] px-4 py-2 font-serif-tc text-xs font-medium text-white shadow-xs hover:bg-[#9E4E13] dark:hover:bg-[#E88949]"
          >
            <span>{t('viewAllInventory')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFavorites.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
