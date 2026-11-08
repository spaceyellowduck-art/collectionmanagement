import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  RefreshCw,
  Coins,
  ShieldCheck,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CollectionItem, ValuationResult, CurrencyCode } from '../types';

export const ValuationView: React.FC = () => {
  const {
    items,
    categories,
    valuationTargetItem,
    setValuationTargetItem,
    applyValuationToItem,
    openItemDetail,
    t,
  } = useApp();

  // Form inputs
  const [selectedItemId, setSelectedItemId] = useState<string>(valuationTargetItem?.id || '');
  const [itemName, setItemName] = useState<string>(valuationTargetItem?.name || '');
  const [categoryName, setCategoryName] = useState<string>(valuationTargetItem?.category || '');
  const [condition, setCondition] = useState<string>('良好保存 (近全新)');
  const [currency, setCurrency] = useState<CurrencyCode>(
    (valuationTargetItem?.currency as CurrencyCode) || 'TWD'
  );
  const [notes, setNotes] = useState<string>(valuationTargetItem?.notes || '');

  // Result & Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState<boolean>(false);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [recentValuations, setRecentValuations] = useState<
    { itemName: string; result: ValuationResult; timestamp: number }[]
  >(() => {
    try {
      const saved = localStorage.getItem('archivist_recent_valuations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // When valuationTargetItem changes from outside (e.g. from Detail Modal)
  useEffect(() => {
    if (valuationTargetItem) {
      setSelectedItemId(valuationTargetItem.id);
      setItemName(valuationTargetItem.name);
      setCategoryName(valuationTargetItem.category);
      setCurrency((valuationTargetItem.currency as CurrencyCode) || 'TWD');
      setNotes(valuationTargetItem.notes || '');
      setHasApplied(false);
    }
  }, [valuationTargetItem]);

  // Handle selecting an item from the user's collection
  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
    if (!itemId) {
      setValuationTargetItem(null);
      return;
    }
    const found = items.find((i) => i.id === itemId);
    if (found) {
      setValuationTargetItem(found);
      setItemName(found.name);
      setCategoryName(found.category);
      setCurrency((found.currency as CurrencyCode) || 'TWD');
      setNotes(found.notes || '');
      setHasApplied(false);
      setResult(null);
    }
  };

  const handleClearSelection = () => {
    setSelectedItemId('');
    setValuationTargetItem(null);
    setItemName('');
    setNotes('');
    setResult(null);
    setHasApplied(false);
  };

  const conditionOptions = [
    '全新未拆封 (附原廠封膜/原裝箱)',
    '評級鑑定品 (如 PSA / BGS / NGC 評級)',
    '良好保存 (近全新，品相優良)',
    '一般中古 (有些許歲月痕跡或輕微磨損)',
    '年代歲月老件 (具歷史包漿/原況留存)',
    '零件不齊/需修復品',
  ];

  const currencyOptions: CurrencyCode[] = [
    'TWD',
    'USD',
    'JPY',
    'EUR',
    'GBP',
    'HKD',
    'CNY',
    'SGD',
    'AUD',
    'CHF',
  ];

  const handleStartValuation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setErrorMsg('請輸入或選取欲估值的藏品名稱');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setIsQuotaError(false);
    setHasApplied(false);

    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName: itemName.trim(),
          category: categoryName || '一般藏品',
          condition,
          currency,
          notes: notes.trim(),
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        if (response.status === 429 || json.isQuota || json.code === 429) {
          setIsQuotaError(true);
          throw new Error(
            json.error ||
              '目前已達 Gemini API 免費呼叫配額上限（429 速率限制）。請稍候約 30～60 秒後重試；若需更高額度，可於 Settings > Secrets 設定啟用帳單的 API Key。'
          );
        }
        throw new Error(json.error || '估值失敗，請稍後再試');
      }

      const valData: ValuationResult = json.data;
      setResult(valData);
      setIsQuotaError(false);

      // Save to recent valuations history
      const newHistory = [
        {
          itemName: itemName.trim(),
          result: valData,
          timestamp: Date.now(),
        },
        ...recentValuations.filter((h) => h.itemName !== itemName.trim()).slice(0, 4),
      ];
      setRecentValuations(newHistory);
      try {
        localStorage.setItem('archivist_recent_valuations', JSON.stringify(newHistory));
      } catch {
        // ignore localStorage quota error
      }
    } catch (err: any) {
      console.error('Valuation error:', err);
      const raw = String(err?.message || err || '');
      if (
        raw.includes('429') ||
        raw.includes('RESOURCE_EXHAUSTED') ||
        raw.includes('quota') ||
        raw.includes('rate-limit') ||
        raw.includes('exceeded your current quota')
      ) {
        setIsQuotaError(true);
        setErrorMsg(
          '目前已達 Gemini API 免費呼叫配額上限（429 速率限制）。請稍候約 30～60 秒後重試；若需更高額度，可於 Settings > Secrets 設定啟用帳單的 API Key。'
        );
      } else {
        // If raw is a JSON string, sanitize it
        let cleanMsg = raw;
        if (raw.includes('"message":')) {
          try {
            const parsed = JSON.parse(raw.replace(/^Error:\s*/, ''));
            cleanMsg = parsed.error?.message || parsed.message || cleanMsg;
          } catch {
            cleanMsg = '自動估值連線或運算時發生異常，請重試。';
          }
        }
        setErrorMsg(cleanMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToItem = async () => {
    if (!result || !selectedItemId) return;
    const ok = await applyValuationToItem(selectedItemId, result.estimatedValue, result.currency);
    if (ok) {
      setHasApplied(true);
    }
  };

  const formatMoney = (val: number | null | undefined, cur: string) => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    return `${cur} $${val.toLocaleString()}`;
  };

  const selectedItemObj = items.find((i) => i.id === selectedItemId);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E4DDD2] dark:border-[#38322B] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B85D19] dark:bg-[#D77937] text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-serif-tc text-2xl font-bold tracking-tight text-[#2A2521] dark:text-[#EDE6DE]">
                AI 市場自動估值
              </h1>
              <p className="font-serif-tc text-xs text-[#7E746A] dark:text-[#A3978B] mt-0.5">
                整合 Google 即時聯網搜尋技術，深入檢索全球拍賣會與二手市場成交價，提供權威客觀的公允鑑價
              </p>
            </div>
          </div>
        </div>

        {/* Feature Pill */}
        <div className="inline-flex items-center gap-2 self-start md:self-auto rounded-full border border-[#B85D19]/30 dark:border-[#D77937]/30 bg-[#F6EDE4] dark:bg-[#2A211A] px-3.5 py-1.5 text-xs text-[#B85D19] dark:text-[#D77937]">
          <ShieldCheck className="h-4 w-4" />
          <span className="font-medium">Google Search Grounding 聯網查價</span>
        </div>
      </div>

      {/* Main Grid: Input Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Valuation Form (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] p-6 shadow-sm">
            <h2 className="font-serif-tc text-base font-bold text-[#2A2521] dark:text-[#EDE6DE] mb-4 flex items-center justify-between">
              <span>鑑價評估設定</span>
              {selectedItemId && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-xs text-[#B85D19] dark:text-[#D77937] hover:underline font-normal cursor-pointer"
                >
                  清除選取 (切換手動查詢)
                </button>
              )}
            </h2>

            <form onSubmit={handleStartValuation} className="space-y-4">
              {/* Quick Select from Collection */}
              <div className="space-y-1.5">
                <label className="font-serif-tc text-xs font-semibold text-[#7E746A] dark:text-[#A3978B] block">
                  從藏品庫選取現有藏品 (選填)
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => handleSelectItem(e.target.value)}
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#221F1C] px-3.5 py-2.5 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden cursor-pointer"
                >
                  <option value="">-- 手動輸入任何收藏品名稱 --</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      [{it.category}] {it.name} (目前估值:{' '}
                      {it.estimatedValue ? `${it.currency} $${it.estimatedValue.toLocaleString()}` : '未估值'}
                      )
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Item Preview Chip */}
              {selectedItemObj && (
                <div className="flex items-center gap-3 rounded-xl border border-[#B85D19]/30 bg-[#F6EDE4]/60 dark:bg-[#2C2118]/60 p-3">
                  {selectedItemObj.photo ? (
                    <img
                      src={selectedItemObj.photo}
                      alt={selectedItemObj.name}
                      className="h-12 w-12 rounded-lg object-cover border border-[#E4DDD2] dark:border-[#38322B]"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EAE2D5] dark:bg-[#342D26] text-[#7E746A]">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-serif-tc text-xs font-bold text-[#2A2521] dark:text-[#EDE6DE] truncate">
                      {selectedItemObj.name}
                    </p>
                    <p className="text-[11px] text-[#7E746A] dark:text-[#A3978B] mt-0.5">
                      分類：{selectedItemObj.category} · 數量：{selectedItemObj.quantity} 件
                    </p>
                    <p className="text-[11px] text-[#B85D19] dark:text-[#D77937]">
                      現有登錄估值：
                      {selectedItemObj.estimatedValue
                        ? formatMoney(selectedItemObj.estimatedValue, selectedItemObj.currency)
                        : '尚未估值'}
                    </p>
                  </div>
                </div>
              )}

              {/* Item Name */}
              <div className="space-y-1.5">
                <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  藏品名稱與型號 <span className="text-[#BA3D3D]">*</span>
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="例如：Leica M3 雙回捲相機、寶可夢噴火龍初版 PSA 9、山崎 18 年單一麥芽威士忌..."
                  required
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#221F1C] px-3.5 py-2.5 text-xs text-[#2A2521] dark:text-[#EDE6DE] placeholder-[#7E746A]/50 focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                />
              </div>

              {/* Category & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                    藏品分類
                  </label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#221F1C] px-3 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden cursor-pointer"
                  >
                    <option value="">通用收藏品</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                    估值目標幣別
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#221F1C] px-3 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden cursor-pointer"
                  >
                    {currencyOptions.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition / Preservation State */}
              <div className="space-y-1.5">
                <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  品相保存狀態
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#221F1C] px-3.5 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden cursor-pointer"
                >
                  {conditionOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Notes */}
              <div className="space-y-1.5">
                <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  備註與配件特徵 (選填)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="如：原盒證書齊全、特別版序號、是否有修復史..."
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#221F1C] p-3 text-xs text-[#2A2521] dark:text-[#EDE6DE] placeholder-[#7E746A]/50 focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                />
              </div>

              {/* Error Alert / Rate Limit Card */}
              {isQuotaError ? (
                <div className="rounded-xl border border-[#D77937]/50 bg-[#FBF5ED] dark:bg-[#2B2117] p-4 text-xs font-serif-tc text-[#8A4610] dark:text-[#ECA56C] space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-[#B85D19] dark:text-[#D77937]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Gemini API 免費額度速率限制 (429 Rate Limit)</span>
                  </div>
                  <p className="leading-relaxed text-[11px] opacity-90">
                    免費版 Gemini API 每分鐘有嚴格的調用頻率限制。伺服器已自動為您進行重試；若仍遇到限制，請稍候約 30～60 秒讓額度冷卻，或於 <strong>Settings &gt; Secrets</strong> 設定啟用帳單的 API Key 以享有不受限的高配額。
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => handleStartValuation(e)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#B85D19] dark:bg-[#D77937] hover:bg-[#9E4E13] text-white px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>立即重試估值</span>
                    </button>
                  </div>
                </div>
              ) : errorMsg ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-[#BA3D3D]/30 bg-[#FDF1F1] dark:bg-[#341C1C] p-3 text-xs text-[#BA3D3D] dark:text-[#F3A0A0]">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              ) : null}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] py-3 px-4 font-serif-tc text-xs font-bold tracking-wider text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60 cursor-pointer active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>正在聯網檢索拍賣與二手成交市場...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>開始 AI 市場查價估值</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Recent Valuations Panel */}
          {recentValuations.length > 0 && (
            <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] p-5 shadow-xs space-y-3">
              <span className="font-serif-tc text-xs font-semibold text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider block">
                本次會話最近估值記錄
              </span>
              <div className="space-y-2">
                {recentValuations.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setItemName(item.itemName);
                      setResult(item.result);
                      setHasApplied(false);
                    }}
                    className="flex items-center justify-between rounded-xl border border-[#E4DDD2]/70 dark:border-[#38322B] p-2.5 hover:bg-[#F8F5F0] dark:hover:bg-[#221F1C] cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-serif-tc text-xs font-bold text-[#2A2521] dark:text-[#EDE6DE] truncate">
                        {item.itemName}
                      </p>
                      <span className="text-[10px] text-[#7E746A] dark:text-[#A3978B]">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="font-cinzel text-xs font-bold text-[#B85D19] dark:text-[#D77937] shrink-0">
                      {formatMoney(item.result.estimatedValue, item.result.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Appraisal Report Display (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {isLoading ? (
            /* Loading State */
            <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] p-12 text-center shadow-xs space-y-6 animate-pulse">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F6EDE4] dark:bg-[#2E241C] text-[#B85D19] dark:text-[#D77937]">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif-tc text-lg font-bold text-[#2A2521] dark:text-[#EDE6DE]">
                  正在進行即時市場估值中...
                </h3>
                <p className="text-xs text-[#7E746A] dark:text-[#A3978B] max-w-md mx-auto leading-relaxed">
                  透過 Google Search Grounding 深入比對全球主要拍賣行紀錄、各大二手買賣流通成交價，並考量品相與稀有度進行加權演算。
                </p>
              </div>

              <div className="inline-flex flex-col gap-2 text-left bg-[#F8F5F0] dark:bg-[#221F1C] rounded-xl p-4 text-xs font-serif-tc text-[#7E746A] dark:text-[#A3978B] max-w-sm mx-auto">
                <div className="flex items-center gap-2 text-[#B85D19] dark:text-[#D77937] font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[#B85D19] dark:bg-[#D77937] animate-ping" />
                  <span>檢索 eBay、蘇富比、專業拍賣成交行情</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#7E746A]" />
                  <span>比對保存狀態、版本批次與配件折讓比率</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#7E746A]" />
                  <span>匯整貨幣匯率與公允市場估值中位數</span>
                </div>
              </div>
            </div>
          ) : result ? (
            /* Result Report */
            <div className="space-y-6 animate-fadeIn">
              {/* Fallback Notice if live search was throttled */}
              {result.fallbackNotice && (
                <div className="flex items-start gap-2.5 rounded-xl border border-[#B85D19]/30 bg-[#F7EFE7] dark:bg-[#2C2117] p-3.5 text-xs font-serif-tc text-[#B85D19] dark:text-[#ECA56C]">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{result.fallbackNotice}</span>
                </div>
              )}

              {/* Appraisal Hero Card */}
              <div className="rounded-2xl border-2 border-[#B85D19]/40 dark:border-[#D77937]/40 bg-gradient-to-br from-white via-[#FCFAF7] to-[#F8F3EC] dark:from-[#221F1C] dark:via-[#1E1B18] dark:to-[#171513] p-6 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E4DDD2] dark:border-[#38322B] pb-5">
                  <div>
                    <span className="font-serif-tc text-xs font-semibold text-[#B85D19] dark:text-[#D77937] tracking-wider uppercase">
                      市場公允估值報告 · FAIR MARKET VALUATION
                    </span>
                    <h2 className="font-serif-tc text-xl sm:text-2xl font-bold text-[#2A2521] dark:text-[#EDE6DE] mt-1">
                      {itemName}
                    </h2>
                  </div>

                  {/* Trend Indicator */}
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-serif-tc font-semibold ${
                      result.marketTrend === 'rising'
                        ? 'bg-[#EBF7EE] text-[#24823A] dark:bg-[#1C3322] dark:text-[#5FD179]'
                        : result.marketTrend === 'cooling'
                        ? 'bg-[#F2F4F8] text-[#3B5B84] dark:bg-[#1E2734] dark:text-[#88B0E0]'
                        : 'bg-[#F8EFE4] text-[#B85D19] dark:bg-[#34261C] dark:text-[#EAA26D]'
                    }`}
                  >
                    {result.marketTrend === 'rising' ? (
                      <>
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>行情升值中</span>
                      </>
                    ) : result.marketTrend === 'cooling' ? (
                      <>
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>行情回檔整理</span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-3.5 w-3.5" />
                        <span>市場行情平穩</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Big Value Showcase */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="rounded-xl bg-white/80 dark:bg-[#181614]/80 border border-[#E4DDD2] dark:border-[#38322B] p-5 shadow-2xs">
                    <span className="text-xs font-serif-tc text-[#7E746A] dark:text-[#A3978B] block">
                      公允市場中位估值
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-cinzel text-3xl sm:text-4xl font-extrabold text-[#B85D19] dark:text-[#D77937] tracking-tight">
                        {formatMoney(result.estimatedValue, result.currency)}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-[#7E746A] dark:text-[#A3978B]">
                      合理參考區間：
                      <span className="font-semibold text-[#2A2521] dark:text-[#EDE6DE]">
                        {formatMoney(result.lowEstimate, result.currency)}
                      </span>{' '}
                      ～{' '}
                      <span className="font-semibold text-[#2A2521] dark:text-[#EDE6DE]">
                        {formatMoney(result.highEstimate, result.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-[#E4DDD2]/80 dark:border-[#38322B] bg-white/60 dark:bg-[#181614]/60 p-3.5">
                      <span className="text-[11px] text-[#7E746A] dark:text-[#A3978B] block">
                        稀有度評級
                      </span>
                      <span className="font-serif-tc text-xs font-bold text-[#2A2521] dark:text-[#EDE6DE] block mt-0.5">
                        {result.rarityLabel || '典藏級藏品'}
                      </span>
                      <p className="text-[11px] text-[#7E746A] dark:text-[#A3978B] mt-1 leading-snug">
                        {result.trendSummary}
                      </p>
                    </div>

                    {/* Apply Button */}
                    {selectedItemId ? (
                      <button
                        type="button"
                        onClick={handleApplyToItem}
                        disabled={hasApplied}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 font-serif-tc text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                          hasApplied
                            ? 'bg-[#24823A] text-white'
                            : 'bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] text-white active:scale-[0.98]'
                        }`}
                      >
                        {hasApplied ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>已成功套用至藏品估值</span>
                          </>
                        ) : (
                          <>
                            <Coins className="h-4 w-4" />
                            <span>一鍵套用估值至「{selectedItemObj?.name || '此藏品'}」</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <p className="text-[11px] text-[#7E746A] dark:text-[#A3978B] italic">
                        提示：若從左側「現有藏品」下拉選取藏品，可一鍵將此估值直接寫入該藏品檔案中。
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Appraisal Commentary Notes */}
              <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E4DDD2] dark:border-[#38322B] pb-3">
                  <BookOpen className="h-4 w-4 text-[#B85D19] dark:text-[#D77937]" />
                  <h3 className="font-serif-tc text-sm font-bold text-[#2A2521] dark:text-[#EDE6DE]">
                    專家鑑價分析報告
                  </h3>
                </div>
                <div className="prose dark:prose-invert max-w-none text-xs text-[#2A2521] dark:text-[#EDE6DE] font-serif-tc leading-relaxed whitespace-pre-line">
                  {result.appraisalNotes}
                </div>
              </div>

              {/* Key Value Factors */}
              {result.keyFactors && result.keyFactors.length > 0 && (
                <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] p-6 shadow-xs space-y-3">
                  <h3 className="font-serif-tc text-xs font-bold text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider">
                    關鍵行情影響因素
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {result.keyFactors.map((factor, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-xl bg-[#F8F5F0] dark:bg-[#221F1C] p-3 text-xs text-[#2A2521] dark:text-[#EDE6DE]"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#B85D19]/20 text-[#B85D19] dark:bg-[#D77937]/20 dark:text-[#D77937] text-[10px] font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span className="font-serif-tc leading-relaxed">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Search Grounding Sources */}
              <div className="rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E4DDD2] dark:border-[#38322B] pb-3">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-[#B85D19] dark:text-[#D77937]" />
                    <h3 className="font-serif-tc text-xs font-bold text-[#2A2521] dark:text-[#EDE6DE]">
                      即時搜尋查價來源與市場參考依據 ({result.groundingSources?.length || 0})
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#7E746A] dark:text-[#A3978B] font-mono">
                    Google Search Grounding
                  </span>
                </div>

                {result.groundingSources && result.groundingSources.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {result.groundingSources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-xl border border-[#E4DDD2] dark:border-[#38322B] p-3 hover:border-[#B85D19] dark:hover:border-[#D77937] bg-[#F8F5F0]/60 dark:bg-[#221F1C]/60 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] group-hover:text-[#B85D19] dark:group-hover:text-[#D77937] truncate">
                            {source.title}
                          </p>
                          <span className="text-[10px] text-[#7E746A] dark:text-[#A3978B] truncate block mt-0.5">
                            {source.url}
                          </span>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#7E746A] group-hover:text-[#B85D19] dark:group-hover:text-[#D77937] transition-colors" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#7E746A] dark:text-[#A3978B] italic">
                    鑑價基準涵蓋歷史拍賣行成交數據庫與市場公允指標。
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Empty Prompt State */
            <div className="rounded-2xl border border-dashed border-[#E4DDD2] dark:border-[#38322B] bg-white/40 dark:bg-[#1C1A17]/40 p-12 text-center space-y-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6EDE4] dark:bg-[#2A211A] text-[#B85D19] dark:text-[#D77937]">
                <Coins className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif-tc text-base font-bold text-[#2A2521] dark:text-[#EDE6DE]">
                  請在左側填寫藏品資訊或選取庫存品項
                </h3>
                <p className="text-xs text-[#7E746A] dark:text-[#A3978B] max-w-md mx-auto leading-relaxed">
                  點擊「開始 AI 市場查價估值」，系統將即時調用 Google Search 檢索全球各大拍賣行、二級買賣論壇與專業二手平台，產出包含公允中位估值、合理價格區間與來源連結的完整鑑價報告。
                </p>
              </div>

              {items.length > 0 && (
                <div className="pt-4">
                  <span className="text-xs text-[#7E746A] dark:text-[#A3978B] block mb-2 font-serif-tc">
                    或者，點選下方庫存藏品快速進行估值：
                  </span>
                  <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                    {items.slice(0, 4).map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => handleSelectItem(it.id)}
                        className="rounded-lg border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-3 py-1.5 text-xs font-serif-tc text-[#2A2521] dark:text-[#EDE6DE] hover:border-[#B85D19] dark:hover:border-[#D77937] transition-colors cursor-pointer"
                      >
                        {it.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
