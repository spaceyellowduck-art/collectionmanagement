import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Table,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExportFormat, ExportScope, CollectionItem } from '../types';
import {
  generateJSONExport,
  generateCSVExport,
  generateTSVForGoogleSheets,
  downloadFile,
} from '../services/export';

export const ExportModal: React.FC = () => {
  const {
    isExportModalOpen,
    closeExportModal,
    items,
    categories,
    selectedCategoryFilter,
    searchTerm,
    showToast,
    t,
  } = useApp();

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [selectedScope, setSelectedScope] = useState<ExportScope>('all');
  const [copied, setCopied] = useState(false);

  // Filter items based on scope
  const exportItems = useMemo(() => {
    if (selectedScope === 'favorites') {
      return items.filter((i) => i.isFavorite);
    }
    if (selectedScope === 'filtered') {
      return items.filter((item) => {
        if (selectedCategoryFilter === 'FAVORITES' && !item.isFavorite) return false;
        if (
          selectedCategoryFilter !== 'ALL' &&
          selectedCategoryFilter !== 'FAVORITES' &&
          item.category !== selectedCategoryFilter
        )
          return false;
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchNotes = item.notes && item.notes.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchNotes) return false;
        }
        return true;
      });
    }
    return items;
  }, [items, selectedScope, selectedCategoryFilter, searchTerm]);

  if (!isExportModalOpen) return null;

  const dateTag = new Date().toISOString().slice(0, 10);

  const handleDownload = () => {
    if (exportItems.length === 0) {
      showToast('沒有可供匯出的藏品資料', 'error');
      return;
    }

    if (selectedFormat === 'json') {
      const jsonStr = generateJSONExport(exportItems, categories);
      downloadFile(jsonStr, `archivist_export_${dateTag}.json`, 'application/json;charset=utf-8');
      showToast(`已成功匯出 ${exportItems.length} 件藏品為 JSON 檔`, 'success');
      closeExportModal();
    } else if (selectedFormat === 'csv') {
      const csvStr = generateCSVExport(exportItems, categories);
      downloadFile(csvStr, `archivist_export_${dateTag}.csv`, 'text/csv;charset=utf-8;');
      showToast(`已成功匯出 ${exportItems.length} 件藏品為 CSV 試算表`, 'success');
      closeExportModal();
    } else if (selectedFormat === 'google-sheets') {
      // Download TSV compatible file with Google Sheets
      const tsvStr = generateTSVForGoogleSheets(exportItems, categories);
      downloadFile(tsvStr, `archivist_for_googlesheets_${dateTag}.tsv`, 'text/tab-separated-values;charset=utf-8;');
      showToast(`已下載 Google 試算表相容檔案，共 ${exportItems.length} 件藏品`, 'success');
    }
  };

  const handleCopyForGoogleSheets = async () => {
    if (exportItems.length === 0) {
      showToast('沒有可供複製的藏品資料', 'error');
      return;
    }

    const tsvStr = generateTSVForGoogleSheets(exportItems, categories);
    try {
      await navigator.clipboard.writeText(tsvStr);
      setCopied(true);
      showToast('已複製表格！可直接至 Google 試算表按 Ctrl+V 貼上', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Clipboard error:', err);
      showToast('複製至剪貼簿失敗，請改用檔案下載', 'error');
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
        onClick={closeExportModal}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-6 py-4">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-[#B85D19] dark:text-[#D77937]" />
            <h2 className="font-serif-tc text-lg font-bold text-[#2A2521] dark:text-[#EDE6DE]">
              匯出藏品清單
            </h2>
          </div>

          <button
            type="button"
            onClick={closeExportModal}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7E746A] hover:bg-[#E4DDD2]/60 dark:hover:bg-[#2C2824] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 1. Scope Selection */}
          <div className="space-y-2">
            <label className="font-serif-tc text-xs font-semibold text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider block">
              選擇匯出範圍
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedScope('all')}
                className={`rounded-xl border p-3 text-center transition-all ${
                  selectedScope === 'all'
                    ? 'border-[#B85D19] dark:border-[#D77937] bg-white dark:bg-[#221F1C] shadow-xs text-[#B85D19] dark:text-[#D77937] font-semibold'
                    : 'border-[#E4DDD2] dark:border-[#38322B] bg-white/60 dark:bg-[#1C1A17] text-[#2A2521] dark:text-[#EDE6DE]'
                }`}
              >
                <span className="font-serif-tc text-xs block">全部藏品</span>
                <span className="font-cinzel text-xs opacity-75">{items.length} 件</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScope('filtered')}
                className={`rounded-xl border p-3 text-center transition-all ${
                  selectedScope === 'filtered'
                    ? 'border-[#B85D19] dark:border-[#D77937] bg-white dark:bg-[#221F1C] shadow-xs text-[#B85D19] dark:text-[#D77937] font-semibold'
                    : 'border-[#E4DDD2] dark:border-[#38322B] bg-white/60 dark:bg-[#1C1A17] text-[#2A2521] dark:text-[#EDE6DE]'
                }`}
              >
                <span className="font-serif-tc text-xs block">目前篩選</span>
                <span className="font-cinzel text-xs opacity-75">
                  {
                    items.filter((item) => {
                      if (selectedCategoryFilter === 'FAVORITES' && !item.isFavorite) return false;
                      if (
                        selectedCategoryFilter !== 'ALL' &&
                        selectedCategoryFilter !== 'FAVORITES' &&
                        item.category !== selectedCategoryFilter
                      )
                        return false;
                      if (searchTerm.trim() !== '') {
                        const q = searchTerm.toLowerCase();
                        if (
                          !item.name.toLowerCase().includes(q) &&
                          !item.category.toLowerCase().includes(q) &&
                          !(item.notes && item.notes.toLowerCase().includes(q))
                        )
                          return false;
                      }
                      return true;
                    }).length
                  }{' '}
                  件
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScope('favorites')}
                className={`rounded-xl border p-3 text-center transition-all ${
                  selectedScope === 'favorites'
                    ? 'border-[#B85D19] dark:border-[#D77937] bg-white dark:bg-[#221F1C] shadow-xs text-[#B85D19] dark:text-[#D77937] font-semibold'
                    : 'border-[#E4DDD2] dark:border-[#38322B] bg-white/60 dark:bg-[#1C1A17] text-[#2A2521] dark:text-[#EDE6DE]'
                }`}
              >
                <span className="font-serif-tc text-xs block">僅喜愛藏品</span>
                <span className="font-cinzel text-xs opacity-75">
                  {items.filter((i) => i.isFavorite).length} 件
                </span>
              </button>
            </div>
          </div>

          {/* 2. Format Selection */}
          <div className="space-y-2">
            <label className="font-serif-tc text-xs font-semibold text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider block">
              選擇匯出檔案格式
            </label>
            <div className="space-y-2.5">
              {/* CSV Option */}
              <div
                onClick={() => setSelectedFormat('csv')}
                className={`flex items-start gap-3.5 rounded-xl border p-3.5 cursor-pointer transition-all ${
                  selectedFormat === 'csv'
                    ? 'border-[#B85D19] dark:border-[#D77937] bg-white dark:bg-[#221F1C] ring-2 ring-[#B85D19]/20 shadow-xs'
                    : 'border-[#E4DDD2] dark:border-[#38322B] bg-white/60 dark:bg-[#1C1A17] hover:border-[#B85D19]/40'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F7EFE7] dark:bg-[#35261C] text-[#B85D19] dark:text-[#D77937]">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif-tc text-sm font-bold text-[#2A2521] dark:text-[#EDE6DE]">
                      CSV 試算表檔案 (.csv)
                    </span>
                    <span className="rounded-full bg-[#B85D19]/10 text-[#B85D19] dark:text-[#D77937] px-2 py-0.5 text-[10px] font-sans font-medium">
                      推薦常用
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#7E746A] dark:text-[#A3978B] leading-relaxed">
                    標準逗號分隔格式，附帶 UTF-8 BOM 簽章，使用 Excel、Apple Numbers 開啟繁體中文絕不亂碼。
                  </p>
                </div>
              </div>

              {/* Google Sheets Option */}
              <div
                onClick={() => setSelectedFormat('google-sheets')}
                className={`flex items-start gap-3.5 rounded-xl border p-3.5 cursor-pointer transition-all ${
                  selectedFormat === 'google-sheets'
                    ? 'border-[#B85D19] dark:border-[#D77937] bg-white dark:bg-[#221F1C] ring-2 ring-[#B85D19]/20 shadow-xs'
                    : 'border-[#E4DDD2] dark:border-[#38322B] bg-white/60 dark:bg-[#1C1A17] hover:border-[#B85D19]/40'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F5E9] dark:bg-[#1B3520] text-[#2E7D32] dark:text-[#81C784]">
                  <Table className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif-tc text-sm font-bold text-[#2A2521] dark:text-[#EDE6DE]">
                      Google 試算表 (Google Sheets)
                    </span>
                    <span className="rounded-full bg-[#2E7D32]/10 text-[#2E7D32] dark:text-[#81C784] px-2 py-0.5 text-[10px] font-sans font-medium">
                      雲端協作
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#7E746A] dark:text-[#A3978B] leading-relaxed">
                    可下載相容 TSV 檔直接上傳至雲端硬碟，或一鍵複製表格內容貼上至 Google 試算表。
                  </p>
                </div>
              </div>

              {/* JSON Option */}
              <div
                onClick={() => setSelectedFormat('json')}
                className={`flex items-start gap-3.5 rounded-xl border p-3.5 cursor-pointer transition-all ${
                  selectedFormat === 'json'
                    ? 'border-[#B85D19] dark:border-[#D77937] bg-white dark:bg-[#221F1C] ring-2 ring-[#B85D19]/20 shadow-xs'
                    : 'border-[#E4DDD2] dark:border-[#38322B] bg-white/60 dark:bg-[#1C1A17] hover:border-[#B85D19]/40'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F7EFE7] dark:bg-[#35261C] text-[#B85D19] dark:text-[#D77937]">
                  <FileCode className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <span className="font-serif-tc text-sm font-bold text-[#2A2521] dark:text-[#EDE6DE] block">
                    JSON 結構化資料檔 (.json)
                  </span>
                  <p className="mt-0.5 text-xs text-[#7E746A] dark:text-[#A3978B] leading-relaxed">
                    完整保留所有分類設定、自訂欄位架構與多張照片 Base64 資料，適合備份與系統間完整移植。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Actions for Google Sheets */}
          {selectedFormat === 'google-sheets' && (
            <div className="rounded-xl border border-[#C8E6C9] dark:border-[#2E7D32]/50 bg-[#F1F8E9] dark:bg-[#1B3520]/40 p-4 space-y-3">
              <span className="font-serif-tc text-xs font-semibold text-[#2E7D32] dark:text-[#81C784] block">
                ⚡ Google 試算表極速貼上小技巧：
              </span>
              <p className="text-xs text-[#558B2F] dark:text-[#A5D6A7] leading-relaxed">
                點擊下方「複製為 Google Sheets 表格」，接著點擊「開啟新試算表」，在 Google Sheets 第一格按下 <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-black/50 border border-black/10 font-mono text-[11px]">Ctrl+V</kbd> 即可瞬間完成載入！
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyForGoogleSheets}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? '已複製到剪貼簿！' : '複製為 Google Sheets 表格'}</span>
                </button>

                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#2E7D32] dark:border-[#81C784] bg-white dark:bg-[#1C1A17] hover:bg-[#E8F5E9] dark:hover:bg-[#1B3520] px-3.5 py-2 text-xs font-semibold text-[#2E7D32] dark:text-[#81C784] transition-colors"
                >
                  <span>開啟新 Google 試算表</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-6 py-4">
          <span className="font-serif-tc text-xs text-[#7E746A] dark:text-[#A3978B]">
            即將匯出 <strong className="text-[#B85D19] dark:text-[#D77937]">{exportItems.length}</strong> 件收藏品
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={closeExportModal}
              className="rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] hover:bg-[#F8F5F0] dark:hover:bg-[#2C2824] px-4 py-2 font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] transition-colors"
            >
              {t('cancel')}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] px-5 py-2 font-serif-tc text-xs font-semibold text-white shadow-xs transition-all active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>下載檔案</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
