import React from 'react';
import {
  Boxes,
  Coins,
  Heart,
  Tags,
  ArrowRight,
  Plus,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemCard } from './ItemCard';

export const OverviewView: React.FC = () => {
  const {
    items,
    categories,
    setActiveTab,
    setSelectedCategoryFilter,
    openCreateForm,
    t,
  } = useApp();

  const totalCount = items.length;
  const favoriteCount = items.filter((i) => i.isFavorite).length;
  const categoryCount = categories.length;

  // Multi-currency total valuation calculation
  const valuationByCurrency: Record<string, number> = {};
  let hasAnyValuation = false;

  items.forEach((item) => {
    if (
      item.estimatedValue !== null &&
      item.estimatedValue !== undefined &&
      !isNaN(item.estimatedValue)
    ) {
      const curr = item.currency || 'TWD';
      const qty = item.quantity || 1;
      valuationByCurrency[curr] =
        (valuationByCurrency[curr] || 0) + Number(item.estimatedValue) * qty;
      hasAnyValuation = true;
    }
  });

  const currencyKeys = Object.keys(valuationByCurrency);
  const primaryCurrency = currencyKeys.length > 0 ? currencyKeys[0] : 'TWD';
  const primaryTotal = currencyKeys.length > 0 ? valuationByCurrency[primaryCurrency] : 0;
  const otherCurrencies = currencyKeys.slice(1);

  // Recently added items (up to 4 newest)
  const recentItems = [...items]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 4);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategoryFilter(categoryName);
    setActiveTab('inventory');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-[#E4DDD2] dark:border-[#38322B] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif-tc text-2xl sm:text-3xl font-bold tracking-tight text-[#2A2521] dark:text-[#EDE6DE]">
            {t('overviewTitle')}
          </h1>
          <p className="mt-1 text-sm text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
            {t('overviewSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreateForm()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] px-5 py-2.5 font-serif-tc text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{t('addNewItem')}</span>
        </button>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Items */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider">
              {t('totalCount')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7EFE7] dark:bg-[#35261C] text-[#B85D19] dark:text-[#D77937]">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-cinzel text-3xl font-bold text-[#B85D19] dark:text-[#D77937]">
              {totalCount}
            </div>
            <span className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
              共計收錄 {totalCount} 件珍藏
            </span>
          </div>
        </div>

        {/* Total Valuation */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider">
              {t('totalValue')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7EFE7] dark:bg-[#35261C] text-[#B85D19] dark:text-[#D77937]">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-cinzel text-2xl font-bold text-[#2A2521] dark:text-[#EDE6DE] truncate">
              {hasAnyValuation
                ? `${primaryCurrency} ${primaryTotal.toLocaleString()}`
                : t('unvalued')}
            </div>
            {otherCurrencies.length > 0 ? (
              <span className="text-[11px] text-[#7E746A] dark:text-[#A3978B] font-serif-tc truncate block">
                +{' '}
                {otherCurrencies
                  .map((c) => `${c} ${valuationByCurrency[c].toLocaleString()}`)
                  .join(' | ')}
              </span>
            ) : (
              <span className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
                資產價值即時評定
              </span>
            )}
          </div>
        </div>

        {/* Favorite Count */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider">
              {t('favoriteCount')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF1F1] dark:bg-[#382020] text-[#E05353]">
              <Heart className="h-5 w-5 fill-[#E05353]/20" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-cinzel text-3xl font-bold text-[#E05353]">
              {favoriteCount}
            </div>
            <span className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
              佔總收藏 {totalCount > 0 ? Math.round((favoriteCount / totalCount) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Categories Count */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider">
              {t('categoryCount')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7EFE7] dark:bg-[#35261C] text-[#B85D19] dark:text-[#D77937]">
              <Tags className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-cinzel text-3xl font-bold text-[#2A2521] dark:text-[#EDE6DE]">
              {categoryCount}
            </div>
            <span className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
              多元自訂典藏種類
            </span>
          </div>
        </div>
      </div>

      {/* Quick Category Jump Bar */}
      {categories.length > 0 && (
        <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white/60 dark:bg-[#221F1C]/60 p-4 backdrop-blur-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-serif-tc font-semibold uppercase tracking-wider text-[#7E746A] dark:text-[#A3978B] flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-[#B85D19] dark:text-[#D77937]" />
              快速分類瀏覽
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className="inline-flex items-center gap-1 text-xs font-serif-tc text-[#B85D19] dark:text-[#D77937] hover:underline"
            >
              <span>{t('viewAllInventory')}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = items.filter((i) => i.category === cat.name).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.name)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#2A2521] px-3.5 py-1.5 text-xs font-serif-tc text-[#2A2521] dark:text-[#EDE6DE] transition-all hover:border-[#B85D19] hover:text-[#B85D19] dark:hover:border-[#D77937] dark:hover:text-[#D77937] hover:shadow-xs"
                >
                  <span>{cat.name}</span>
                  <span className="rounded-full bg-[#F3ECE2] dark:bg-[#363029] px-1.5 py-0.2 text-[10px] text-[#7E746A] dark:text-[#A3978B]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recently Added Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-tc text-xl font-bold text-[#2A2521] dark:text-[#EDE6DE] flex items-center gap-2">
            <span>{t('recentAdditions')}</span>
            <span className="text-xs font-normal text-[#7E746A] dark:text-[#A3978B]">
              (最近 {recentItems.length} 件)
            </span>
          </h2>

          {totalCount > 4 && (
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className="inline-flex items-center gap-1 text-xs font-serif-tc font-medium text-[#B85D19] dark:text-[#D77937] hover:underline"
            >
              <span>{t('viewAllInventory')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E4DDD2] dark:border-[#38322B] bg-white/50 dark:bg-[#221F1C]/50 p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F7EFE7] dark:bg-[#35261C] text-[#B85D19] dark:text-[#D77937] mb-3">
              <Boxes className="h-7 w-7" />
            </div>
            <h3 className="font-serif-tc text-lg font-semibold text-[#2A2521] dark:text-[#EDE6DE]">
              {t('emptyOverviewTitle')}
            </h3>
            <p className="mt-1 text-xs text-[#7E746A] dark:text-[#A3978B] max-w-sm">
              {t('emptyOverviewDesc')}
            </p>
            <button
              type="button"
              onClick={() => openCreateForm()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#B85D19] dark:bg-[#D77937] px-4 py-2 font-serif-tc text-xs font-medium text-white shadow-xs hover:bg-[#9E4E13] dark:hover:bg-[#E88949]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t('addNewItem')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
