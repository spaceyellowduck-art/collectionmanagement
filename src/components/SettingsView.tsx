import React, { useState, useRef } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Globe,
  Tags,
  Plus,
  Trash2,
  Database,
  Download,
  Upload,
  RotateCcw,
  AlertCircle,
  Check,
  FolderPlus,
  Sliders,
  FileSpreadsheet,
} from 'lucide-react';
import { Language, ThemeMode } from '../types';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    items,
    categories,
    language,
    setLanguage,
    theme,
    setTheme,
    deleteCategory,
    openCategoryModal,
    openFieldEditor,
    openExportModal,
    importBackup,
    resetDatabase,
    t,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importBackup(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#E4DDD2] dark:border-[#38322B] pb-6">
        <h1 className="font-serif-tc text-2xl sm:text-3xl font-bold tracking-tight text-[#2A2521] dark:text-[#EDE6DE] flex items-center gap-2">
          <Settings className="h-7 w-7 text-[#B85D19] dark:text-[#D77937]" />
          <span>{t('settingsTitle')}</span>
        </h1>
        <p className="mt-1 text-sm text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
          {t('settingsSubtitle')}
        </p>
      </div>

      {/* 1. Theme Setting */}
      <section className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#E4DDD2] dark:border-[#38322B]">
          <Sun className="h-5 w-5 text-[#B85D19] dark:text-[#D77937]" />
          <div>
            <h2 className="font-serif-tc text-base font-bold text-[#2A2521] dark:text-[#EDE6DE]">
              {t('themeSection')}
            </h2>
            <p className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
              {t('themeDesc')}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Light Theme Option */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
              theme === 'light'
                ? 'border-[#B85D19] bg-[#F7EFE7]/50 shadow-xs ring-2 ring-[#B85D19]/20'
                : 'border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] hover:border-[#B85D19]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F5F0] border border-[#E4DDD2] text-[#B85D19]">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <span className="font-serif-tc text-sm font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  {t('themeLight')}
                </span>
                <span className="text-xs text-[#7E746A] dark:text-[#A3978B]">
                  米白底色、皮革橘棕細節
                </span>
              </div>
            </div>
            {theme === 'light' && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B85D19] text-white">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
            )}
          </button>

          {/* Dark Theme Option */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
              theme === 'dark'
                ? 'border-[#D77937] bg-[#35261C]/50 shadow-xs ring-2 ring-[#D77937]/20'
                : 'border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] hover:border-[#D77937]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#171513] border border-[#38322B] text-[#D77937]">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <span className="font-serif-tc text-sm font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  {t('themeDark')}
                </span>
                <span className="text-xs text-[#7E746A] dark:text-[#A3978B]">
                  炭木胡桃黑、琥珀古銅強調
                </span>
              </div>
            </div>
            {theme === 'dark' && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D77937] text-white">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
            )}
          </button>
        </div>
      </section>

      {/* 2. Language Setting */}
      <section className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#E4DDD2] dark:border-[#38322B]">
          <Globe className="h-5 w-5 text-[#B85D19] dark:text-[#D77937]" />
          <div>
            <h2 className="font-serif-tc text-base font-bold text-[#2A2521] dark:text-[#EDE6DE]">
              {t('langSection')}
            </h2>
            <p className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
              {t('langDesc')}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'zh-TW' as Language, title: '繁體中文', desc: '台灣 / 香港' },
            { id: 'en' as Language, title: 'English', desc: 'International' },
            { id: 'zh-CN' as Language, title: '简体中文', desc: 'Simplified' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLanguage(item.id)}
              className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                language === item.id
                  ? 'border-[#B85D19] dark:border-[#D77937] bg-[#F7EFE7]/40 dark:bg-[#35261C]/40 ring-1 ring-[#B85D19] dark:ring-[#D77937]'
                  : 'border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] hover:border-[#B85D19]/40'
              }`}
            >
              <div>
                <span className="font-serif-tc text-sm font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  {item.title}
                </span>
                <span className="text-xs text-[#7E746A] dark:text-[#A3978B]">
                  {item.desc}
                </span>
              </div>
              {language === item.id && (
                <Check className="h-4 w-4 text-[#B85D19] dark:text-[#D77937] stroke-[3]" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Manage Categories & Custom Fields */}
      <section className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#E4DDD2] dark:border-[#38322B]">
          <div className="flex items-center gap-2.5">
            <Tags className="h-5 w-5 text-[#B85D19] dark:text-[#D77937]" />
            <div>
              <h2 className="font-serif-tc text-base font-bold text-[#2A2521] dark:text-[#EDE6DE]">
                {t('categorySection')}
              </h2>
              <p className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
                每個分類擁有專屬欄位設定，支援範本建立、空白建立或複製既有分類。
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCategoryModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] px-4 py-2 font-serif-tc text-xs font-semibold text-white shadow-xs transition-colors self-start sm:self-auto"
          >
            <FolderPlus className="h-4 w-4" />
            <span>建立新分類 (範本/空白/複製)</span>
          </button>
        </div>

        {/* Categories List with Field Counts and Management Button */}
        <div className="divide-y divide-[#E4DDD2] dark:divide-[#38322B] rounded-xl border border-[#E4DDD2] dark:border-[#38322B] overflow-hidden">
          {categories.map((cat) => {
            const count = items.filter((i) => i.category === cat.name).length;
            const fieldCount = cat.fields?.length || 0;
            const canDelete = count === 0;

            return (
              <div
                key={cat.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-[#F8F5F0]/50 dark:bg-[#1C1A17]/50 hover:bg-[#F8F5F0] dark:hover:bg-[#1C1A17] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif-tc text-sm font-bold text-[#2A2521] dark:text-[#EDE6DE]">
                      {cat.name}
                    </span>
                    <span className="rounded-full bg-[#F3ECE2] dark:bg-[#2C2824] px-2 py-0.5 text-[11px] font-sans font-medium text-[#7E746A] dark:text-[#A3978B]">
                      {count} {t('itemsUnit')}
                    </span>
                    <span className="rounded-full bg-[#B85D19]/10 dark:bg-[#D77937]/20 px-2 py-0.5 text-[11px] font-sans font-medium text-[#B85D19] dark:text-[#D77937]">
                      {fieldCount} 個專屬欄位
                    </span>
                  </div>
                  {cat.description && (
                    <p className="mt-1 text-xs text-[#7E746A] dark:text-[#A3978B]">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Manage Fields Button */}
                  <button
                    type="button"
                    onClick={() => openFieldEditor(cat)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] hover:border-[#B85D19] hover:text-[#B85D19] px-3 py-1.5 text-xs font-serif-tc font-semibold text-[#2A2521] dark:text-[#EDE6DE] transition-colors"
                  >
                    <Sliders className="h-3.5 w-3.5 text-[#B85D19] dark:text-[#D77937]" />
                    <span>管理自訂欄位 ({fieldCount})</span>
                  </button>

                  {/* Delete Category Button */}
                  <button
                    type="button"
                    title={canDelete ? '刪除此種類' : `無法刪除（現有 ${count} 件藏品）`}
                    onClick={() => deleteCategory(cat.id, cat.name)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                      canDelete
                        ? 'border-[#E4DDD2] dark:border-[#38322B] text-[#7E746A] hover:border-[#BA3D3D] hover:bg-[#FDF1F1] hover:text-[#BA3D3D] dark:hover:bg-[#382020]'
                        : 'border-transparent text-[#7E746A]/40 dark:text-[#A3978B]/30 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Database & Export / Backup */}
      <section className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#E4DDD2] dark:border-[#38322B]">
          <Database className="h-5 w-5 text-[#B85D19] dark:text-[#D77937]" />
          <div>
            <h2 className="font-serif-tc text-base font-bold text-[#2A2521] dark:text-[#EDE6DE]">
              {t('dataSection')}
            </h2>
            <p className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
              真正的 IndexedDB 本地持久化資料庫，支援匯出為 JSON、CSV 與 Google 試算表格式。
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {/* Export Modal Launcher */}
          <button
            type="button"
            onClick={openExportModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] px-4 py-2.5 font-serif-tc text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>匯出收藏品 (JSON / CSV / Google 試算表)</span>
          </button>

          {/* Import JSON */}
          <label className="inline-flex items-center gap-2 rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] hover:bg-[#F8F5F0] dark:hover:bg-[#2C2824] px-4 py-2.5 font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] shadow-2xs transition-colors cursor-pointer">
            <Upload className="h-4 w-4 text-[#B85D19] dark:text-[#D77937]" />
            <span>{t('importDataBtn')}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('確定要重新載入預設示範藏品資料嗎？\n這將包含各分類之範本自訂欄位。')) {
                resetDatabase();
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] hover:bg-[#FDF1F1] hover:text-[#BA3D3D] dark:hover:bg-[#382020] px-4 py-2.5 font-serif-tc text-xs font-semibold text-[#7E746A] dark:text-[#A3978B] shadow-2xs transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{t('resetDemoDataBtn')}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
