import React from 'react';
import {
  BarChart3,
  Boxes,
  Tags,
  Heart,
  TrendingUp,
  Award,
  CircleDollarSign,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StatisticsView: React.FC = () => {
  const { items, categories, openItemDetail, t } = useApp();

  const totalItems = items.length;
  const favoriteItems = items.filter((i) => i.isFavorite).length;
  const favoriteRate = totalItems > 0 ? Math.round((favoriteItems / totalItems) * 100) : 0;
  const totalCategories = categories.length;

  // Valuation summary by currency
  const valuationByCurrency: Record<string, number> = {};
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
    }
  });

  const currencies = Object.keys(valuationByCurrency);

  // Category distribution
  const categoryStats = categories.map((cat) => {
    const catItems = items.filter((i) => i.category === cat.name);
    const count = catItems.length;
    const percentage = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
    
    // Valuation in this category
    const catValuation: Record<string, number> = {};
    catItems.forEach((i) => {
      if (i.estimatedValue) {
        const c = i.currency || 'TWD';
        catValuation[c] = (catValuation[c] || 0) + Number(i.estimatedValue) * (i.quantity || 1);
      }
    });

    return {
      category: cat,
      count,
      percentage,
      catValuation,
    };
  }).sort((a, b) => b.count - a.count);

  // Top 5 Highest Valued Items
  const topValuedItems = [...items]
    .filter((i) => i.estimatedValue !== null && !isNaN(Number(i.estimatedValue)))
    .sort((a, b) => (Number(b.estimatedValue) || 0) - (Number(a.estimatedValue) || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E4DDD2] dark:border-[#38322B] pb-6">
        <h1 className="font-serif-tc text-2xl sm:text-3xl font-bold tracking-tight text-[#2A2521] dark:text-[#EDE6DE] flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-[#B85D19] dark:text-[#D77937]" />
          <span>{t('statisticsTitle')}</span>
        </h1>
        <p className="mt-1 text-sm text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
          {t('statisticsSubtitle')}
        </p>
      </div>

      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Items */}
        <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider">
              {t('statTotalItems')}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7EFE7] dark:bg-[#35261C] text-[#B85D19] dark:text-[#D77937]">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 font-cinzel text-4xl font-bold text-[#B85D19] dark:text-[#D77937]">
            {totalItems}
          </div>
          <p className="mt-1 text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
            涵蓋 {totalCategories} 個專業典藏範疇
          </p>
        </div>

        {/* Categories Count */}
        <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider">
              {t('categoryCount')}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7EFE7] dark:bg-[#35261C] text-[#B85D19] dark:text-[#D77937]">
              <Tags className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 font-cinzel text-4xl font-bold text-[#2A2521] dark:text-[#EDE6DE]">
            {totalCategories}
          </div>
          <p className="mt-1 text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
            系統支援動態自訂種類管理
          </p>
        </div>

        {/* Favorite Rate */}
        <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider">
              {t('statFavoriteRatio')}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF1F1] dark:bg-[#382020] text-[#E05353]">
              <Heart className="h-5 w-5 fill-[#E05353]/30" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-cinzel text-4xl font-bold text-[#E05353]">
              {favoriteRate}%
            </span>
            <span className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
              ({favoriteItems} / {totalItems} 件)
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#F3ECE2] dark:bg-[#2C2824]">
            <div
              className="h-full bg-[#E05353] transition-all duration-700"
              style={{ width: `${favoriteRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Valuation Breakdown Panel */}
      <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E4DDD2] dark:border-[#38322B] pb-4">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-[#B85D19] dark:text-[#D77937]" />
            <h3 className="font-serif-tc text-base font-bold text-[#2A2521] dark:text-[#EDE6DE]">
              {t('statTotalValuation')}
            </h3>
          </div>
          <span className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
            多幣別匯總評估
          </span>
        </div>

        {currencies.length === 0 ? (
          <p className="mt-4 text-xs text-[#7E746A] dark:text-[#A3978B] italic">
            目前所有藏品尚未登錄估值資料。
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currencies.map((curr) => (
              <div
                key={curr}
                className="rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] p-4 flex flex-col justify-between"
              >
                <span className="text-xs font-semibold text-[#7E746A] dark:text-[#A3978B] tracking-wider uppercase">
                  {curr} 總資產
                </span>
                <span className="mt-2 font-cinzel text-2xl font-bold text-[#B85D19] dark:text-[#D77937]">
                  {curr} {valuationByCurrency[curr].toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Breakdown & Top Valued Ranking (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E4DDD2] dark:border-[#38322B] pb-4 mb-4">
            <h3 className="font-serif-tc text-base font-bold text-[#2A2521] dark:text-[#EDE6DE]">
              {t('statCategoryDistribution')}
            </h3>
            <span className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
              佔比統計
            </span>
          </div>

          {categoryStats.length === 0 ? (
            <p className="text-xs text-[#7E746A] dark:text-[#A3978B]">
              {t('noStatsData')}
            </p>
          ) : (
            <div className="space-y-4">
              {categoryStats.map((item) => (
                <div key={item.category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-serif-tc">
                    <span className="font-medium text-[#2A2521] dark:text-[#EDE6DE]">
                      {item.category.name}
                    </span>
                    <span className="text-[#7E746A] dark:text-[#A3978B]">
                      {item.count} 件 ({item.percentage}%)
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#F3ECE2] dark:bg-[#2C2824]">
                    <div
                      className="h-full rounded-full bg-[#B85D19] dark:bg-[#D77937] transition-all duration-700"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Valued Items */}
        <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E4DDD2] dark:border-[#38322B] pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-[#B85D19] dark:text-[#D77937]" />
              <h3 className="font-serif-tc text-base font-bold text-[#2A2521] dark:text-[#EDE6DE]">
                {t('statTopValued')}
              </h3>
            </div>
            <span className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
              排行
            </span>
          </div>

          {topValuedItems.length === 0 ? (
            <p className="text-xs text-[#7E746A] dark:text-[#A3978B]">
              目前無登錄估值之藏品。
            </p>
          ) : (
            <div className="divide-y divide-[#E4DDD2] dark:divide-[#38322B]">
              {topValuedItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => openItemDetail(item)}
                  className="flex items-center justify-between py-3 cursor-pointer group hover:bg-[#F8F5F0]/60 dark:hover:bg-[#2C2824]/50 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B85D19]/10 dark:bg-[#D77937]/20 font-cinzel text-xs font-bold text-[#B85D19] dark:text-[#D77937]">
                      {idx + 1}
                    </span>
                    <div className="truncate max-w-[180px] sm:max-w-[240px]">
                      <span className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block truncate group-hover:text-[#B85D19] dark:group-hover:text-[#D77937]">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-[#7E746A] dark:text-[#A3978B]">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <span className="font-cinzel text-xs font-bold text-[#B85D19] dark:text-[#D77937] whitespace-nowrap">
                    {item.currency || 'TWD'} {Number(item.estimatedValue).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
