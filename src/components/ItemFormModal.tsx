import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Heart,
  Image as ImageIcon,
  Check,
  Sparkles,
  Camera,
  Star,
  Trash2,
  Plus,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRESET_PHOTOS } from '../services/db';
import { CustomFieldDefinition } from '../types';

export const ItemFormModal: React.FC = () => {
  const {
    isItemFormOpen,
    itemToEdit,
    closeItemForm,
    categories,
    selectedCategoryFilter,
    saveItemData,
    t,
  } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [estimatedValue, setEstimatedValue] = useState<string>('');
  const [currency, setCurrency] = useState('TWD');
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form data
  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || '');
      setCategory(itemToEdit.category || (categories[0]?.name ?? ''));
      setQuantity(itemToEdit.quantity || 1);
      setEstimatedValue(
        itemToEdit.estimatedValue !== null && itemToEdit.estimatedValue !== undefined
          ? String(itemToEdit.estimatedValue)
          : ''
      );
      setCurrency(itemToEdit.currency || 'TWD');
      const loadedPhotos =
        itemToEdit.photos && itemToEdit.photos.length > 0
          ? [...itemToEdit.photos]
          : itemToEdit.photo
          ? [itemToEdit.photo]
          : [];
      setPhotos(loadedPhotos);
      setNotes(itemToEdit.notes || '');
      setIsFavorite(!!itemToEdit.isFavorite);
      setCustomFields(itemToEdit.customFields ? { ...itemToEdit.customFields } : {});
    } else {
      setName('');
      const defaultCat =
        selectedCategoryFilter !== 'ALL' && selectedCategoryFilter !== 'FAVORITES'
          ? selectedCategoryFilter
          : categories[0]?.name || '';
      setCategory(defaultCat);
      setQuantity(1);
      setEstimatedValue('');
      setCurrency('TWD');
      setPhotos([]);
      setNotes('');
      setIsFavorite(false);
      setCustomFields({});
    }
    setShowPresets(false);
  }, [itemToEdit, categories, selectedCategoryFilter, isItemFormOpen]);

  if (!isItemFormOpen) return null;

  // Active category definition to retrieve its fields
  const activeCategoryDef = categories.find((c) => c.name === category);
  const categoryFields: CustomFieldDefinition[] = activeCategoryDef?.fields || [];

  // Handle multiple photo uploads
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`檔案 ${file.name} 超過 5MB，建議壓縮後再上傳`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setPhotos((prev) => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const copy = [...prev];
      const target = copy.splice(index, 1)[0];
      return [target, ...copy];
    });
  };

  const addPresetPhoto = (url: string) => {
    setPhotos((prev) => [...prev, url]);
  };

  // Custom field helpers
  const handleCustomFieldChange = (fieldId: string, val: any) => {
    setCustomFields((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const toggleMultiSelectOption = (fieldId: string, option: string) => {
    const currentList: string[] = Array.isArray(customFields[fieldId])
      ? customFields[fieldId]
      : [];
    if (currentList.includes(option)) {
      handleCustomFieldChange(
        fieldId,
        currentList.filter((o) => o !== option)
      );
    } else {
      handleCustomFieldChange(fieldId, [...currentList, option]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await saveItemData(
        {
          name: name.trim(),
          category: category || (categories[0]?.name ?? '未分類'),
          quantity: Math.max(1, Number(quantity) || 1),
          estimatedValue: estimatedValue.trim() !== '' ? Number(estimatedValue) : null,
          currency,
          photo: photos.length > 0 ? photos[0] : null,
          photos,
          notes: notes.trim(),
          isFavorite,
          customFields,
        },
        itemToEdit ? itemToEdit.id : undefined
      );
    } finally {
      setIsSubmitting(false);
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
        onClick={closeItemForm}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-6 py-4">
          <div>
            <h2 className="font-serif-tc text-lg font-bold text-[#2A2521] dark:text-[#EDE6DE]">
              {itemToEdit ? t('editItem') : t('addNewItem')}
            </h2>
            <p className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
              完整登錄藏品基本規格、自訂屬性與多角度照片
            </p>
          </div>

          <button
            type="button"
            onClick={closeItemForm}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7E746A] hover:bg-[#E4DDD2]/60 dark:hover:bg-[#2C2824] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <span className="font-serif-tc text-xs font-bold text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider block border-b border-[#E4DDD2] dark:border-[#38322B] pb-2">
              基本資料
            </span>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                {t('fieldName')} <span className="text-[#BA3D3D]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('fieldNamePlaceholder')}
                required
                className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-3.5 py-2.5 text-sm text-[#2A2521] dark:text-[#EDE6DE] placeholder-[#7E746A]/50 focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
              />
            </div>

            {/* Category & Quantity Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  {t('fieldCategory')} <span className="text-[#BA3D3D]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-3.5 py-2.5 text-sm text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.fields?.length || 0} 個專屬欄位)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  {t('fieldQuantity')} <span className="text-[#BA3D3D]">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  required
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-3.5 py-2.5 text-sm text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Valuation & Currency Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Estimated Value */}
              <div className="space-y-1.5">
                <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  {t('fieldValue')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="例如：68000"
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-3.5 py-2.5 text-sm text-[#2A2521] dark:text-[#EDE6DE] placeholder-[#7E746A]/50 focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                />
              </div>

              {/* Currency */}
              <div className="space-y-1.5">
                <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  {t('fieldCurrency')}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-3.5 py-2.5 text-sm text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden cursor-pointer"
                >
                  <option value="TWD">TWD (新台幣 NT$)</option>
                  <option value="USD">USD (美元 $)</option>
                  <option value="JPY">JPY (日圓 ¥)</option>
                  <option value="EUR">EUR (歐元 €)</option>
                  <option value="GBP">GBP (英鎊 £)</option>
                  <option value="HKD">HKD (港幣 HK$)</option>
                  <option value="CNY">CNY (人民幣 ¥)</option>
                  <option value="SGD">SGD (新加坡幣 S$)</option>
                  <option value="AUD">AUD (澳幣 A$)</option>
                  <option value="CHF">CHF (瑞士法郎)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Category Custom Fields */}
          {categoryFields.length > 0 && (
            <div className="space-y-4 rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white/70 dark:bg-[#221F1C]/70 p-4">
              <div className="flex items-center justify-between border-b border-[#E4DDD2] dark:border-[#38322B] pb-2">
                <span className="font-serif-tc text-xs font-bold text-[#B85D19] dark:text-[#D77937] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  「{category}」專屬欄位規格 ({categoryFields.length})
                </span>
                <span className="text-[11px] text-[#7E746A] dark:text-[#A3978B]">
                  個別分類獨立欄位
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categoryFields.map((field) => {
                  const fieldKey = field.id;
                  const currentVal = customFields[fieldKey] ?? customFields[field.name];

                  // Render input based on field type
                  return (
                    <div
                      key={field.id}
                      className={field.type === 'multiSelect' || field.type === 'text' ? 'sm:col-span-2' : ''}
                    >
                      <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block mb-1">
                        {field.name}
                        {field.unit && <span className="text-[#7E746A] ml-1">({field.unit})</span>}
                      </label>

                      {/* 1. Text */}
                      {field.type === 'text' && (
                        <input
                          type="text"
                          value={currentVal || ''}
                          onChange={(e) => handleCustomFieldChange(fieldKey, e.target.value)}
                          placeholder={field.placeholder || `請輸入${field.name}...`}
                          className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] px-3.5 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                        />
                      )}

                      {/* 2. Number */}
                      {field.type === 'number' && (
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={currentVal !== undefined && currentVal !== null ? currentVal : ''}
                            onChange={(e) =>
                              handleCustomFieldChange(
                                fieldKey,
                                e.target.value === '' ? '' : Number(e.target.value)
                              )
                            }
                            placeholder={field.placeholder || '0'}
                            className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] px-3.5 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                          />
                          {field.unit && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7E746A]">
                              {field.unit}
                            </span>
                          )}
                        </div>
                      )}

                      {/* 3. Date */}
                      {field.type === 'date' && (
                        <input
                          type="date"
                          value={currentVal || ''}
                          onChange={(e) => handleCustomFieldChange(fieldKey, e.target.value)}
                          className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] px-3.5 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                        />
                      )}

                      {/* 4. Single Select */}
                      {field.type === 'select' && (
                        <select
                          value={currentVal || ''}
                          onChange={(e) => handleCustomFieldChange(fieldKey, e.target.value)}
                          className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] px-3.5 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden cursor-pointer"
                        >
                          <option value="">-- 請選擇 --</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* 5. Multi Select */}
                      {field.type === 'multiSelect' && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(field.options || []).map((opt) => {
                            const isSelected =
                              Array.isArray(currentVal) && currentVal.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => toggleMultiSelectOption(fieldKey, opt)}
                                className={`rounded-lg px-2.5 py-1 text-xs font-serif-tc transition-all ${
                                  isSelected
                                    ? 'bg-[#B85D19] text-white shadow-xs dark:bg-[#D77937]'
                                    : 'border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] text-[#2A2521] dark:text-[#EDE6DE] hover:border-[#B85D19]'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 6. URL */}
                      {field.type === 'url' && (
                        <div className="relative">
                          <input
                            type="url"
                            value={currentVal || ''}
                            onChange={(e) => handleCustomFieldChange(fieldKey, e.target.value)}
                            placeholder={field.placeholder || 'https://...'}
                            className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] px-3.5 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                          />
                        </div>
                      )}

                      {/* 7. Boolean */}
                      {field.type === 'boolean' && (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id={`bool_${field.id}`}
                            checked={!!currentVal}
                            onChange={(e) => handleCustomFieldChange(fieldKey, e.target.checked)}
                            className="h-4 w-4 rounded accent-[#B85D19] dark:accent-[#D77937] cursor-pointer"
                          />
                          <label
                            htmlFor={`bool_${field.id}`}
                            className="text-xs text-[#2A2521] dark:text-[#EDE6DE] cursor-pointer"
                          >
                            {currentVal ? '是 (符合條件)' : '否 (無此特性)'}
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Multiple Photos Upload & Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4DDD2] dark:border-[#38322B] pb-2">
              <div>
                <span className="font-serif-tc text-xs font-bold text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider block">
                  藏品照片庫 ({photos.length} 張)
                </span>
                <span className="text-[11px] text-[#7E746A] dark:text-[#A3978B]">
                  支援上傳多角度相片，第一張預設為主要封面
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPresets(!showPresets)}
                  className="text-xs text-[#B85D19] dark:text-[#D77937] hover:underline"
                >
                  {showPresets ? '收合範本' : '選擇經典範本照'}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#B85D19]/10 text-[#B85D19] dark:bg-[#D77937]/20 dark:text-[#D77937] px-2.5 py-1 text-xs font-semibold hover:bg-[#B85D19]/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>新增照片</span>
                </button>
              </div>
            </div>

            {/* Hidden multi-file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Preset Photos Drawer */}
            {showPresets && (
              <div className="rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-3 space-y-2">
                <span className="text-[11px] text-[#7E746A] dark:text-[#A3978B] font-serif-tc block">
                  點擊加入精選照片至相簿中：
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addPresetPhoto(preset.url)}
                      className="group relative aspect-video overflow-hidden rounded-lg border border-[#E4DDD2] dark:border-[#38322B] hover:border-[#B85D19] transition-all"
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[8px] text-white truncate text-center">
                        + 加至藏品
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Photos Grid */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.map((p, idx) => {
                  const isCover = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`group relative aspect-4/3 rounded-xl overflow-hidden border ${
                        isCover
                          ? 'border-[#B85D19] ring-2 ring-[#B85D19]/20 shadow-xs'
                          : 'border-[#E4DDD2] dark:border-[#38322B]'
                      } bg-[#F3ECE2] dark:bg-[#2C2824]`}
                    >
                      <img src={p} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

                      {/* Cover Badge */}
                      {isCover && (
                        <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 rounded-md bg-[#B85D19] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          封面
                        </span>
                      )}

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!isCover && (
                          <button
                            type="button"
                            title="設為封面照片"
                            onClick={() => setAsCover(idx)}
                            className="rounded-lg bg-white/90 p-1.5 text-xs text-[#2A2521] hover:bg-white hover:text-[#B85D19] transition-colors"
                          >
                            設為封面
                          </button>
                        )}
                        <button
                          type="button"
                          title="刪除此照片"
                          onClick={() => removePhoto(idx)}
                          className="rounded-lg bg-[#BA3D3D] p-1.5 text-white hover:bg-[#9E2B2B] transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Add Photo Tile */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center aspect-4/3 rounded-xl border-2 border-dashed border-[#E4DDD2] dark:border-[#38322B] bg-white/40 dark:bg-[#221F1C]/40 cursor-pointer hover:border-[#B85D19] transition-colors text-[#7E746A] dark:text-[#A3978B]"
                >
                  <Camera className="h-6 w-6 mb-1 opacity-60" />
                  <span className="text-[11px] font-serif-tc font-semibold">+ 繼續上傳</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-8 text-center cursor-pointer hover:border-[#B85D19] dark:hover:border-[#D77937] transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F7EFE7] dark:bg-[#35261C] text-[#B85D19] dark:text-[#D77937] mb-2">
                  <Upload className="h-6 w-6" />
                </div>
                <span className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE]">
                  點擊選取或拖曳相片上傳（支援多張選取）
                </span>
                <span className="mt-1 text-[11px] text-[#7E746A] dark:text-[#A3978B]">
                  支援 JPG、PNG、WebP。多角度細節相片讓收藏更生動完整。
                </span>
              </div>
            )}
          </div>

          {/* Section 4: Notes and Provenance */}
          <div className="space-y-1.5">
            <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
              {t('fieldNotes')}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('fieldNotesPlaceholder')}
              className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-3.5 text-sm text-[#2A2521] dark:text-[#EDE6DE] placeholder-[#7E746A]/50 focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
            />
          </div>

          {/* Section 5: Favorite Checkbox */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="favCheck"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="h-4.5 w-4.5 rounded accent-[#B85D19] dark:accent-[#D77937] cursor-pointer"
            />
            <label
              htmlFor="favCheck"
              className="font-serif-tc text-sm text-[#2A2521] dark:text-[#EDE6DE] cursor-pointer flex items-center gap-1.5"
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? 'fill-[#E05353] text-[#E05353]' : 'text-[#7E746A]'}`}
              />
              <span>{t('fieldFavorite')}</span>
            </label>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4DDD2] dark:border-[#38322B]">
            <button
              type="button"
              onClick={closeItemForm}
              className="rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] hover:bg-[#F8F5F0] dark:hover:bg-[#2C2824] px-5 py-2.5 font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] transition-colors"
            >
              {t('cancel')}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] px-6 py-2.5 font-serif-tc text-xs font-semibold text-white shadow-xs transition-all disabled:opacity-50"
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>{isSubmitting ? t('saving') : t('saveItem')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
