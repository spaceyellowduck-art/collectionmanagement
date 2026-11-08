import React, { useState } from 'react';
import {
  X,
  Heart,
  Tag,
  Coins,
  Calendar,
  Layers,
  Edit3,
  Trash2,
  Clock,
  Sparkles,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CustomFieldDefinition } from '../types';

export const ItemDetailModal: React.FC = () => {
  const {
    selectedItemForDetail,
    closeItemDetail,
    openEditForm,
    openDeleteDialog,
    deletePhotoFromDetail,
    toggleFavorite,
    startValuationForItem,
    categories,
    language,
    t,
  } = useApp();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!selectedItemForDetail) return null;

  const item = selectedItemForDetail;
  const photos =
    item.photos && item.photos.length > 0
      ? item.photos
      : item.photo
      ? [item.photo]
      : [];

  const currentPhoto = photos[activePhotoIndex] || photos[0] || null;

  const formattedVal =
    item.estimatedValue !== null && item.estimatedValue !== undefined && !isNaN(item.estimatedValue)
      ? `${item.currency || 'TWD'} ${Number(item.estimatedValue).toLocaleString()}`
      : t('unvalued');

  const locale = language === 'en' ? 'en-US' : language === 'zh-CN' ? 'zh-CN' : 'zh-TW';
  const addedDateStr = item.createdAt
    ? new Date(item.createdAt).toLocaleString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

  // Category definition to look up fields
  const categoryDef = categories.find((c) => c.name === item.category);
  const categoryFields: CustomFieldDefinition[] = categoryDef?.fields || [];
  const itemCustomFields = item.customFields || {};

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleDeleteCurrentPhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('確定要自此藏品刪除目前這張照片嗎？')) {
      await deletePhotoFromDetail(activePhotoIndex);
      if (activePhotoIndex >= photos.length - 1 && activePhotoIndex > 0) {
        setActivePhotoIndex(activePhotoIndex - 1);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={closeItemDetail}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] shadow-2xl overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs font-bold tracking-wider text-[#B85D19] dark:text-[#D77937] uppercase">
              {t('detailTitle')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={item.isFavorite ? '取消喜愛' : '加入喜愛'}
              onClick={(e) => toggleFavorite(item.id, e)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                item.isFavorite
                  ? 'border-[#E05353] bg-[#FDF1F1] dark:bg-[#382020] text-[#E05353]'
                  : 'border-[#E4DDD2] dark:border-[#38322B] text-[#7E746A] hover:text-[#B85D19]'
              }`}
            >
              <Heart
                className={`h-4.5 w-4.5 ${
                  item.isFavorite ? 'fill-[#E05353] stroke-[#E05353]' : 'stroke-current'
                }`}
              />
            </button>

            <button
              type="button"
              aria-label="Close"
              onClick={closeItemDetail}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#7E746A] hover:bg-[#E4DDD2]/60 dark:hover:bg-[#2C2824] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Photos Gallery Hero Viewer */}
          <div className="space-y-3">
            <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden border border-[#E4DDD2] dark:border-[#38322B] bg-[#F3ECE2] dark:bg-[#2C2824]">
              {currentPhoto ? (
                <>
                  <img
                    src={currentPhoto}
                    alt={item.name}
                    className="w-full h-full object-contain sm:object-cover"
                  />

                  {/* Navigation Arrows for multi photos */}
                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous photo"
                        onClick={handlePrevPhoto}
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors shadow-sm"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next photo"
                        onClick={handleNextPhoto}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors shadow-sm"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      {/* Counter Badge */}
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 font-cinzel text-xs font-semibold text-white backdrop-blur-xs">
                        {activePhotoIndex + 1} / {photos.length}
                      </span>
                    </>
                  )}

                  {/* Delete photo shortcut */}
                  <button
                    type="button"
                    title="刪除這張照片"
                    onClick={handleDeleteCurrentPhoto}
                    className="absolute top-3 right-3 rounded-full bg-black/40 hover:bg-[#BA3D3D] p-2 text-white/90 hover:text-white backdrop-blur-xs transition-colors shadow-xs"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-[#7E746A] dark:text-[#A3978B]">
                  <ImageIcon className="h-12 w-12 opacity-40 mb-2" />
                  <span className="text-xs font-serif-tc tracking-wider">暫無照片上傳</span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {photos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative aspect-4/3 w-18 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === activePhotoIndex
                        ? 'border-[#B85D19] dark:border-[#D77937] ring-2 ring-[#B85D19]/30 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Category Badge */}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#B85D19]/10 dark:bg-[#D77937]/20 px-2.5 py-1 text-xs font-semibold text-[#B85D19] dark:text-[#D77937]">
                <Tag className="h-3 w-3" />
                {item.category}
              </span>

              {item.isFavorite && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#FDF1F1] dark:bg-[#382020] px-2.5 py-1 text-xs font-semibold text-[#E05353]">
                  <Heart className="h-3 w-3 fill-current" />
                  已列為喜愛
                </span>
              )}

              {photos.length > 1 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#F3ECE2] dark:bg-[#2C2824] px-2 py-0.5 text-xs text-[#7E746A] dark:text-[#A3978B]">
                  📸 共 {photos.length} 張照片
                </span>
              )}
            </div>

            <h2 className="mt-2.5 font-serif-tc text-2xl font-bold text-[#2A2521] dark:text-[#EDE6DE] leading-snug">
              {item.name}
            </h2>
          </div>

          {/* Basic Spec Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#7E746A] dark:text-[#A3978B] block">
                {t('detailValuation')}
              </span>
              <span className="mt-1 font-cinzel text-base font-bold text-[#B85D19] dark:text-[#D77937] block">
                {formattedVal}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#7E746A] dark:text-[#A3978B] block">
                {t('detailQuantity')}
              </span>
              <span className="mt-1 font-serif-tc text-base font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                {item.quantity || 1} {t('itemsUnit')}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#7E746A] dark:text-[#A3978B] block">
                {t('currencyLabel')}
              </span>
              <span className="mt-1 font-cinzel text-base font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                {item.currency || 'TWD'}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#7E746A] dark:text-[#A3978B] block">
                {t('detailAddedTime')}
              </span>
              <span className="mt-1 font-sans text-xs font-medium text-[#2A2521] dark:text-[#EDE6DE] block">
                {addedDateStr.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Dynamic Custom Fields Section */}
          {categoryFields.length > 0 && (
            <div className="rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-5 space-y-3">
              <span className="text-xs font-bold font-serif-tc tracking-wider uppercase text-[#B85D19] dark:text-[#D77937] flex items-center gap-1.5 border-b border-[#E4DDD2] dark:border-[#38322B] pb-2">
                <Sparkles className="h-3.5 w-3.5" />
                「{item.category}」專屬欄位規格
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {categoryFields.map((field) => {
                  const val = itemCustomFields[field.id] ?? itemCustomFields[field.name];
                  const hasValue = val !== undefined && val !== null && val !== '';

                  return (
                    <div key={field.id} className="space-y-1">
                      <span className="text-[11px] font-serif-tc text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wide block">
                        {field.name}
                        {field.unit && <span className="ml-1">({field.unit})</span>}
                      </span>

                      {!hasValue ? (
                        <span className="text-xs text-[#7E746A]/50 italic block">- 未登錄 -</span>
                      ) : field.type === 'boolean' ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                            val
                              ? 'bg-[#E8F5E9] text-[#2E7D32] dark:bg-[#1B3520] dark:text-[#81C784]'
                              : 'bg-[#F3ECE2] text-[#7E746A] dark:bg-[#2C2824]'
                          }`}
                        >
                          {val ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {val ? '是 (符合)' : '否'}
                        </span>
                      ) : field.type === 'url' ? (
                        <a
                          href={String(val)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-serif-tc text-[#B85D19] dark:text-[#D77937] hover:underline break-all"
                        >
                          <span className="truncate max-w-[200px]">{String(val)}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : field.type === 'multiSelect' && Array.isArray(val) ? (
                        <div className="flex flex-wrap gap-1">
                          {val.map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="rounded-md bg-[#F3ECE2] dark:bg-[#2C2824] px-2 py-0.5 text-xs font-serif-tc text-[#2A2521] dark:text-[#EDE6DE]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-serif-tc text-sm font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                          {String(val)} {field.unit || ''}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes & Provenance Story */}
          <div className="rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-5 space-y-2">
            <span className="text-xs font-bold font-serif-tc tracking-wider uppercase text-[#7E746A] dark:text-[#A3978B] block">
              {t('detailNotesTitle')}
            </span>
            {item.notes ? (
              <p className="font-serif-tc text-sm leading-relaxed text-[#2A2521] dark:text-[#EDE6DE] whitespace-pre-wrap">
                {item.notes}
              </p>
            ) : (
              <p className="font-serif-tc text-xs text-[#7E746A]/60 dark:text-[#A3978B]/60 italic">
                {t('noNotes')}
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-6 py-4">
          {/* Delete Action button (triggers confirmed delete dialog) */}
          <button
            type="button"
            onClick={() => openDeleteDialog(item)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#BA3D3D] dark:border-[#E05353] bg-transparent hover:bg-[#BA3D3D] hover:text-white px-4 py-2 font-serif-tc text-xs font-semibold text-[#BA3D3D] dark:text-[#E05353] transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>{t('deleteItemBtn')}</span>
          </button>

          {/* Edit, AI Valuation & Close */}
          <div className="w-full sm:w-auto flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => startValuationForItem(item)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#B85D19]/40 dark:border-[#D77937]/40 bg-[#F6EDE4] dark:bg-[#2F231A] text-[#B85D19] dark:text-[#D77937] hover:bg-[#B85D19] hover:text-white px-3.5 py-2 font-serif-tc text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI 自動估值</span>
            </button>

            <button
              type="button"
              onClick={() => openEditForm(item)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] hover:bg-[#F8F5F0] dark:hover:bg-[#2C2824] px-4 py-2 font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              <span>{t('editItemBtn')}</span>
            </button>

            <button
              type="button"
              onClick={closeItemDetail}
              className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] px-6 py-2 font-serif-tc text-xs font-semibold text-white shadow-xs transition-colors"
            >
              {t('closeBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
