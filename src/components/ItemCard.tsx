import React from 'react';
import { Heart, Tag, Image as ImageIcon, Camera } from 'lucide-react';
import { CollectionItem } from '../types';
import { useApp } from '../context/AppContext';

interface ItemCardProps {
  item: CollectionItem;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const { openItemDetail, toggleFavorite, t } = useApp();

  const primaryPhoto =
    item.photos && item.photos.length > 0 ? item.photos[0] : item.photo || null;
  const photoCount = item.photos ? item.photos.length : item.photo ? 1 : 0;

  const formattedVal =
    item.estimatedValue !== null && item.estimatedValue !== undefined && !isNaN(item.estimatedValue)
      ? `${item.currency || 'TWD'} ${Number(item.estimatedValue).toLocaleString()}`
      : t('unvalued');

  return (
    <article
      onClick={() => openItemDetail(item)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[#E6DFD5] dark:border-[#38322B] bg-white dark:bg-[#221F1C] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Card Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F3ECE2] dark:bg-[#2C2824]">
        {primaryPhoto ? (
          <img
            src={primaryPhoto}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-[#7E746A] dark:text-[#A3978B]">
            <ImageIcon className="h-10 w-10 opacity-40 mb-2 stroke-1" />
            <span className="text-xs font-serif-tc tracking-wider opacity-60">無照片記錄</span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          type="button"
          aria-label={item.isFavorite ? '取消喜愛' : '加入喜愛'}
          onClick={(e) => toggleFavorite(item.id, e)}
          className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 backdrop-blur-md shadow-sm ${
            item.isFavorite
              ? 'bg-white/95 dark:bg-[#221F1C]/90 text-[#E05353] scale-105'
              : 'bg-black/25 dark:bg-black/40 text-white/90 hover:bg-white hover:text-[#B85D19] dark:hover:bg-[#2C2824]'
          }`}
        >
          <Heart
            className={`h-4.5 w-4.5 transition-transform active:scale-125 ${
              item.isFavorite ? 'fill-[#E05353] stroke-[#E05353]' : 'stroke-current'
            }`}
          />
        </button>

        {/* Badges on image */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#2A2521]/80 dark:bg-black/80 px-2 py-0.5 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-sm">
            <Tag className="h-2.5 w-2.5 text-[#E68A3B]" />
            {item.category}
          </span>

          {photoCount > 1 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white backdrop-blur-sm">
              <Camera className="h-2.5 w-2.5" />
              {photoCount}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3
            title={item.name}
            className="font-serif-tc text-base font-semibold text-[#2A2521] dark:text-[#EDE6DE] line-clamp-1 group-hover:text-[#B85D19] dark:group-hover:text-[#D77937] transition-colors"
          >
            {item.name}
          </h3>

          {item.notes ? (
            <p className="mt-1.5 text-xs text-[#7E746A] dark:text-[#A3978B] line-clamp-2 leading-relaxed">
              {item.notes}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-[#7E746A]/60 dark:text-[#A3978B]/50 italic">
              {t('noNotes')}
            </p>
          )}
        </div>

        {/* Card Footer: Valuation and Quantity */}
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#E6DFD5] dark:border-[#38322B] pt-3 text-xs">
          <div>
            <span className="text-[11px] text-[#7E746A] dark:text-[#A3978B] block">{t('detailValuation')}</span>
            <span className="font-semibold text-[#B85D19] dark:text-[#D77937] text-sm font-cinzel">
              {formattedVal}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#7E746A] dark:text-[#A3978B] block">{t('fieldQuantity')}</span>
            <span className="font-medium text-[#2A2521] dark:text-[#EDE6DE]">
              {item.quantity || 1} {t('itemsUnit')}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
