import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ValuationRequestBody {
  itemName: string;
  category?: string;
  condition?: string;
  currency?: string;
  notes?: string;
  customDetails?: string;
}

// POST /api/valuation - AI Market Valuation with Google Search Grounding
app.post('/api/valuation', async (req: Request<{}, {}, ValuationRequestBody>, res: Response) => {
  try {
    const { itemName, category, condition, currency = 'TWD', notes, customDetails } = req.body;

    if (!itemName || !itemName.trim()) {
      res.status(400).json({ error: '請提供藏品名稱以進行估值' });
      return;
    }

    const prompt = `你是一位享譽國際的頂尖文物、精品與個人收藏品估值專家（Senior Collectible Appraiser）。
請使用即時 Google 搜尋工具，深入檢索該藏品最近在拍賣會（如蘇富比、佳士得、Heritage Auctions）、專業二手交易平台（如 eBay 歷史成交、Chrono24、Mandarake、Yahoo 日拍、Mercari、淘寶、專業論壇等）的實際行情與公允市場價格。

【藏品資訊】
- 藏品名稱：${itemName}
- 所屬分類：${category || '一般收藏品'}
- 保存狀態／品相：${condition || '良好'}
- 幣別：${currency}
- 藏品備註／背景：${notes || '無特殊說明'}
${customDetails ? `- 自訂專屬規格：${customDetails}` : ''}

【工作任務】
1. 使用 Google Search 檢索該藏品在近期的二手市場行情、成交流動價與拍賣參考紀錄。
2. 評定公允市場價值（中位數估值）、合理價格區間（最低估值與最高估值），幣別請轉換並統整為 ${currency}。
3. 判斷市場走向趨勢（上漲 rising、平穩 stable、冷卻 cooling）與稀有度等級。
4. 撰寫專業、客觀且具備典藏眼光的鑑價分析，說明其市場定價邏輯。
5. 列出影響此藏品價格的關鍵因素（如版次、原盒配件、評級分數、保存狀態等）。

【重要回傳格式要求】
請在回覆中務必包含一段標準的 JSON 區塊（用 \`\`\`json 和 \`\`\` 包裹），格式如下：
\`\`\`json
{
  "estimatedValue": 數字(公允中位估值，整數或小數),
  "lowEstimate": 數字(合理低位估值),
  "highEstimate": 數字(合理高位估值),
  "currency": "${currency}",
  "marketTrend": "rising" | "stable" | "cooling",
  "trendSummary": "簡短的市場趨勢描述 (1-2句話)",
  "rarity": "common" | "uncommon" | "rare" | "ultra-rare" | "grail",
  "rarityLabel": "稀有度中文名稱 (例如：市場常見 / 稀有典藏 / 極罕見)",
  "appraisalNotes": "詳細的市場鑑價分析報告（可使用 Markdown 條列式，說明歷史成交依據與行情背景）",
  "keyFactors": ["影響行情的關鍵要點 1", "影響行情的關鍵要點 2", "影響行情的關鍵要點 3"]
}
\`\`\`
請確保 JSON 語法正確合法。在 JSON 區塊外可以有簡潔的引言或總結。`;

    function isQuotaExhausted(err: any): boolean {
      const str = String(err?.message || err || '');
      return (
        str.includes('429') ||
        str.includes('RESOURCE_EXHAUSTED') ||
        str.includes('quota') ||
        str.includes('rate-limit') ||
        str.includes('exceeded your current quota')
      );
    }

    let response: any;
    let isFallbackMode = false;

    // 1. Primary Attempt: Call gemini-3.8-flash with Google Search grounding
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
    } catch (primaryErr: any) {
      console.warn('Primary search-grounded valuation failed:', primaryErr?.message);

      if (isQuotaExhausted(primaryErr)) {
        // 2. Fallback Attempt: If search grounding hits rate limit / quota, try direct Gemini appraisal
        console.log('Switching to direct model appraisal fallback due to search tool quota...');
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          });
          isFallbackMode = true;
        } catch (fallbackErr: any) {
          console.error('Fallback valuation also failed:', fallbackErr?.message);
          if (isQuotaExhausted(fallbackErr)) {
            res.status(429).json({
              success: false,
              code: 429,
              isQuota: true,
              error: '目前已達 Gemini API 免費呼叫配額上限（429 Rate Limit）。請稍候約 30～60 秒後重試；若需更高額度，可於 Settings > Secrets 設定啟用帳單的 API Key。',
            });
            return;
          }
          throw fallbackErr;
        }
      } else {
        throw primaryErr;
      }
    }

    const text = response?.text || '';

    // Extract Grounding Chunks (search web links)
    const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources: { title: string; url: string }[] = [];
    const seenUrls = new Set<string>();

    for (const chunk of chunks) {
      if (chunk.web && chunk.web.uri) {
        const uri = chunk.web.uri;
        if (!seenUrls.has(uri)) {
          seenUrls.add(uri);
          webSources.push({
            title: chunk.web.title || new URL(uri).hostname,
            url: uri,
          });
        }
      }
    }

    // Parse the JSON block from Gemini's response
    let parsedData: any = null;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.warn('Failed to parse json block directly, trying regex clean:', e);
      }
    }

    if (!parsedData) {
      // Fallback regex extraction if full JSON block parse failed
      try {
        const rawJsonMatch = text.match(/\{[\s\S]*"estimatedValue"[\s\S]*\}/);
        if (rawJsonMatch) {
          parsedData = JSON.parse(rawJsonMatch[0]);
        }
      } catch (e) {
        console.warn('Fallback JSON extraction failed:', e);
      }
    }

    // Default structure fallback if parsing completely failed
    const result = {
      estimatedValue: Number(parsedData?.estimatedValue) || 0,
      lowEstimate: Number(parsedData?.lowEstimate) || (Number(parsedData?.estimatedValue) ? Number(parsedData?.estimatedValue) * 0.8 : 0),
      highEstimate: Number(parsedData?.highEstimate) || (Number(parsedData?.estimatedValue) ? Number(parsedData?.estimatedValue) * 1.25 : 0),
      currency: parsedData?.currency || currency,
      marketTrend: parsedData?.marketTrend || 'stable',
      trendSummary: parsedData?.trendSummary || '市場行情維持穩定',
      rarity: parsedData?.rarity || 'uncommon',
      rarityLabel: parsedData?.rarityLabel || '一般典藏品',
      appraisalNotes: parsedData?.appraisalNotes || text || '估值完成，請參考市場公允成交價。',
      keyFactors: Array.isArray(parsedData?.keyFactors) && parsedData.keyFactors.length > 0
        ? parsedData.keyFactors
        : ['保存品相與外觀完整度', '原廠包裝與保證證書', '市場流通販售需求量'],
      groundingSources: webSources,
      isFallback: isFallbackMode,
      fallbackNotice: isFallbackMode
        ? '因即時聯網搜尋額度暫時受限，此估值由 AI 典藏鑑價專家模型資料庫綜合演算產出。'
        : undefined,
      evaluatedAt: Date.now(),
      rawSummary: text,
    };

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Valuation API Error:', error);
    const errStr = String(error?.message || error || '');
    const isQuota =
      errStr.includes('429') ||
      errStr.includes('RESOURCE_EXHAUSTED') ||
      errStr.includes('quota') ||
      errStr.includes('rate-limit');

    if (isQuota) {
      res.status(429).json({
        success: false,
        code: 429,
        isQuota: true,
        error: '目前已達 Gemini API 免費呼叫配額上限（429 Rate Limit）。請稍候約 30～60 秒後重試；若需更高額度，可於 Settings > Secrets 設定啟用帳單的 API Key。',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: error?.message || '自動估值過程發生錯誤，請稍後重試。',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ARCHIVIST Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
