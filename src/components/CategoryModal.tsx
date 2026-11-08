import React, { useState } from 'react';
import {
  X,
  LayoutTemplate,
  FilePlus,
  Copy,
  BookOpen,
  Coins,
  Smile,
  Mail,
  Watch,
  Disc,
  Layers,
  Sparkles,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORY_TEMPLATES } from '../services/templates';
import { CategoryTemplate } from '../types';

export const CategoryModal: React.FC = () => {
  const {
    isCategoryModalOpen,
    closeCategoryModal,
    categories,
    createCategoryFromTemplate,
    createBlankCategory,
    duplicateCategory,
    t,
  } = useApp();

  const [mode, setMode] = useState<'template' | 'blank' | 'duplicate'>('template');

  // Mode 1: Template
  const [selectedTemplate, setSelectedTemplate] = useState<CategoryTemplate>(CATEGORY_TEMPLATES[0]);
  const [templateCustomName, setTemplateCustomName] = useState('');
  const [templateCustomDesc, setTemplateCustomDesc] = useState('');

  // Mode 2: Blank
  const [blankName, setBlankName] = useState('');
  const [blankDesc, setBlankDesc] = useState('');

  // Mode 3: Duplicate
  const [sourceCatId, setSourceCatId] = useState<string>(categories[0]?.id || '');
  const [duplicateName, setDuplicateName] = useState('');
  const [duplicateDesc, setDuplicateDesc] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCategoryModalOpen) return null;

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return BookOpen;
      case 'Coins':
        return Coins;
      case 'Smile':
        return Smile;
      case 'Mail':
        return Mail;
      case 'Watch':
        return Watch;
      case 'Disc':
        return Disc;
      case 'Layers':
        return Layers;
      default:
        return LayoutTemplate;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'template') {
        await createCategoryFromTemplate(
          selectedTemplate.id,
          templateCustomName.trim() || selectedTemplate.name,
          templateCustomDesc.trim() || selectedTemplate.description
        );
      } else if (mode === 'blank') {
        if (!blankName.trim()) return;
        await createBlankCategory(blankName.trim(), blankDesc.trim());
      } else if (mode === 'duplicate') {
        if (!duplicateName.trim() || !sourceCatId) return;
        await duplicateCategory(sourceCatId, duplicateName.trim(), duplicateDesc.trim());
      }
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
        onClick={closeCategoryModal}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-6 py-4">
          <div>
            <h2 className="font-serif-tc text-lg font-bold text-[#2A2521] dark:text-[#EDE6DE]">
              建立新收藏分類
            </h2>
            <p className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
              提供範本、空白自訂與複製既有欄位三種模式
            </p>
          </div>

          <button
            type="button"
            onClick={closeCategoryModal}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7E746A] hover:bg-[#E4DDD2]/60 dark:hover:bg-[#2C2824] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-[#E4DDD2] dark:border-[#38322B] bg-white/70 dark:bg-[#221F1C]/70 p-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('template')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 font-serif-tc text-xs font-semibold transition-all ${
              mode === 'template'
                ? 'bg-[#B85D19] text-white shadow-xs dark:bg-[#D77937]'
                : 'text-[#7E746A] dark:text-[#A3978B] hover:bg-[#E4DDD2]/50 dark:hover:bg-[#2C2824]'
            }`}
          >
            <LayoutTemplate className="h-4 w-4" />
            <span>1. 使用分類範本</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('blank')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 font-serif-tc text-xs font-semibold transition-all ${
              mode === 'blank'
                ? 'bg-[#B85D19] text-white shadow-xs dark:bg-[#D77937]'
                : 'text-[#7E746A] dark:text-[#A3978B] hover:bg-[#E4DDD2]/50 dark:hover:bg-[#2C2824]'
            }`}
          >
            <FilePlus className="h-4 w-4" />
            <span>2. 建立空白分類</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('duplicate')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 font-serif-tc text-xs font-semibold transition-all ${
              mode === 'duplicate'
                ? 'bg-[#B85D19] text-white shadow-xs dark:bg-[#D77937]'
                : 'text-[#7E746A] dark:text-[#A3978B] hover:bg-[#E4DDD2]/50 dark:hover:bg-[#2C2824]'
            }`}
          >
            <Copy className="h-4 w-4" />
            <span>3. 複製既有分類</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Mode 1: Template */}
          {mode === 'template' && (
            <div className="space-y-4">
              <div>
                <label className="font-serif-tc text-xs font-semibold text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider block mb-2">
                  選擇分類範本（自動建立專屬欄位）：
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
                  {CATEGORY_TEMPLATES.map((tmpl) => {
                    const Icon = getTemplateIcon(tmpl.iconName);
                    const isSelected = selectedTemplate.id === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => {
                          setSelectedTemplate(tmpl);
                          setTemplateCustomName(tmpl.name);
                          setTemplateCustomDesc(tmpl.description);
                        }}
                        className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#B85D19] dark:border-[#D77937] bg-white dark:bg-[#221F1C] ring-2 ring-[#B85D19]/20 shadow-xs'
                            : 'border-[#E4DDD2] dark:border-[#38322B] bg-white/60 dark:bg-[#1C1A17] hover:border-[#B85D19]/40'
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isSelected
                              ? 'bg-[#B85D19] text-white dark:bg-[#D77937]'
                              : 'bg-[#F7EFE7] dark:bg-[#35261C] text-[#B85D19] dark:text-[#D77937]'
                          }`}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-serif-tc text-xs font-bold text-[#2A2521] dark:text-[#EDE6DE] block truncate">
                            {tmpl.name}
                          </span>
                          <span className="text-[11px] text-[#7E746A] dark:text-[#A3978B] line-clamp-1">
                            {tmpl.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Template Included Fields Preview */}
              <div className="rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-4 space-y-2">
                <span className="font-serif-tc text-xs font-semibold text-[#B85D19] dark:text-[#D77937] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  「{selectedTemplate.name}」範本包含以下 {selectedTemplate.fields.length} 個基礎專屬欄位：
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTemplate.fields.map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-md bg-[#F3ECE2] dark:bg-[#2C2824] px-2.5 py-1 text-[11px] font-serif-tc text-[#2A2521] dark:text-[#EDE6DE]"
                    >
                      <span className="font-medium">{f.name}</span>
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#7E746A] dark:text-[#A3978B] pt-1">
                  建立後您隨時可以在「設定」中新增、修改或刪除個別欄位。
                </p>
              </div>

              {/* Custom Name Override */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                    分類自訂名稱
                  </label>
                  <input
                    type="text"
                    value={templateCustomName || selectedTemplate.name}
                    onChange={(e) => setTemplateCustomName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-3.5 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                    分類描述簡述
                  </label>
                  <input
                    type="text"
                    value={templateCustomDesc || selectedTemplate.description}
                    onChange={(e) => setTemplateCustomDesc(e.target.value)}
                    className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-3.5 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Blank */}
          {mode === 'blank' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-4">
                <h3 className="font-serif-tc text-sm font-bold text-[#2A2521] dark:text-[#EDE6DE]">
                  建立空白自訂分類
                </h3>
                <p className="mt-1 text-xs text-[#7E746A] dark:text-[#A3978B] leading-relaxed">
                  不預設任何專屬欄位，適合獨特藏品或只想保留基礎資料（名稱、照片、估值、數量、備註）的品類。建立後可隨時自由擴充自訂欄位。
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  分類名稱 <span className="text-[#BA3D3D]">*</span>
                </label>
                <input
                  type="text"
                  value={blankName}
                  onChange={(e) => setBlankName(e.target.value)}
                  placeholder="例如：古董懷錶、簽名球衣、限量球鞋、文房四寶..."
                  required
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-3.5 py-2.5 text-sm text-[#2A2521] dark:text-[#EDE6DE] placeholder-[#7E746A]/50 focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  分類備註說明
                </label>
                <textarea
                  rows={2}
                  value={blankDesc}
                  onChange={(e) => setBlankDesc(e.target.value)}
                  placeholder="記載該分類的收藏原則、收藏範圍等..."
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-3 text-xs text-[#2A2521] dark:text-[#EDE6DE] placeholder-[#7E746A]/50 focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Mode 3: Duplicate */}
          {mode === 'duplicate' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-4">
                <h3 className="font-serif-tc text-sm font-bold text-[#2A2521] dark:text-[#EDE6DE]">
                  複製既有分類設定
                </h3>
                <p className="mt-1 text-xs text-[#7E746A] dark:text-[#A3978B] leading-relaxed">
                  完整複製某個現有分類的所有欄位定義與選項，建立為一個全新的獨立分類。後續增刪欄位不會相互影響。
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  選擇要複製的來源分類 <span className="text-[#BA3D3D]">*</span>
                </label>
                <select
                  value={sourceCatId}
                  onChange={(e) => {
                    setSourceCatId(e.target.value);
                    const source = categories.find((c) => c.id === e.target.value);
                    if (source) {
                      setDuplicateName(`${source.name} (複本)`);
                      setDuplicateDesc(source.description || '');
                    }
                  }}
                  required
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-3.5 py-2.5 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.fields?.length || 0} 個欄位)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  新分類名稱 <span className="text-[#BA3D3D]">*</span>
                </label>
                <input
                  type="text"
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  placeholder="例如：日漫收藏、美漫收藏、日本評級銀圓..."
                  required
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-3.5 py-2.5 text-sm text-[#2A2521] dark:text-[#EDE6DE] placeholder-[#7E746A]/50 focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  新分類描述
                </label>
                <input
                  type="text"
                  value={duplicateDesc}
                  onChange={(e) => setDuplicateDesc(e.target.value)}
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-3.5 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4DDD2] dark:border-[#38322B]">
            <button
              type="button"
              onClick={closeCategoryModal}
              className="rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] hover:bg-[#F8F5F0] dark:hover:bg-[#2C2824] px-4 py-2 font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] transition-colors"
            >
              {t('cancel')}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] px-6 py-2 font-serif-tc text-xs font-semibold text-white shadow-xs transition-all disabled:opacity-50 active:scale-95"
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>建立分類</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
