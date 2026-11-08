import { CategoryTemplate, CustomFieldDefinition } from '../types';

export const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    id: 'manga',
    name: '漫畫書籍',
    description: '適用於漫畫、輕小說、同人誌、典藏畫冊與各類出版物',
    iconName: 'BookOpen',
    fields: [
      { name: '作者 / 原作', type: 'text', placeholder: '例如：鳥山明、荒木飛呂彥' },
      { name: '出版社', type: 'text', placeholder: '例如：東立、集英社、尖端' },
      { name: '卷數 / 集數', type: 'number', unit: '卷', placeholder: '1' },
      { name: '出版年份', type: 'number', unit: '年', placeholder: '2020' },
      {
        name: '印刷版次',
        type: 'select',
        options: ['初版一刷 (首刷)', '初版再刷', '改版二刷', '特裝完全版', '愛藏版', '限定簽名版'],
      },
      { name: 'ISBN 書號', type: 'text', placeholder: '978-...' },
      { name: '首刷限定特典', type: 'boolean' },
    ],
  },
  {
    id: 'coin',
    name: '硬幣古幣',
    description: '適用於世界近代錢幣、古代流通銅錢、銀圓、紀念金幣與評級幣',
    iconName: 'Coins',
    fields: [
      { name: '發行國家 / 朝代', type: 'text', placeholder: '例如：中華民國、日本、大清、美國' },
      { name: '發行年份', type: 'number', unit: '年', placeholder: '1911' },
      {
        name: '材質',
        type: 'select',
        options: ['純金 (.999)', '純銀 (.999)', '925純銀', '銅鎳合金', '紅銅', '黃銅', '白金', '其他合金'],
      },
      { name: '面額', type: 'text', placeholder: '例如：壹圓、50元、1 Dollar' },
      {
        name: '評級機構',
        type: 'select',
        options: ['未評級 (裸幣 Raw)', 'NGC', 'PCGS', 'ANACS', 'PMG', 'ACCA', '公博 GBCA'],
      },
      { name: '評級分數', type: 'text', placeholder: '例如：MS65, PF70 UC, XF45' },
      { name: '鑑定編號', type: 'text', placeholder: '評級盒上的專屬序號' },
      { name: '重量', type: 'number', unit: 'g', placeholder: '26.8' },
    ],
  },
  {
    id: 'figure',
    name: '模型公仔',
    description: '適用於比例模型、PVC手辦、景品、黏土人、機甲合金與雕像',
    iconName: 'Smile',
    fields: [
      {
        name: '製造商',
        type: 'select',
        options: [
          'Good Smile Company',
          'ALTER',
          'Max Factory',
          'Kotobukiya (壽屋)',
          'Bandai (萬代)',
          'MegaHouse',
          'Prime 1 Studio',
          'Apex-Toys',
          '其他品牌',
        ],
      },
      {
        name: '模型比例',
        type: 'select',
        options: ['無比例', '1/4', '1/6', '1/7', '1/8', '1/12', 'Q版黏土人', '可動式 SHF / Figma'],
      },
      { name: '所屬作品 / IP', type: 'text', placeholder: '例如：Fate/Grand Order、新世紀福音戰士' },
      { name: '原型師 / 塗裝師', type: 'text', placeholder: '例如：宮川武、白髭創' },
      {
        name: '材質',
        type: 'multiSelect',
        options: ['PVC', 'ABS', '樹脂 (Resin/GK)', '壓鑄合金 (Diecast)', '軟膠 (Vinyl)', '玻璃纖維'],
      },
      { name: '店鋪初回特典', type: 'boolean' },
      { name: '官方展示頁', type: 'url', placeholder: 'https://...' },
    ],
  },
  {
    id: 'stamp',
    name: '郵票郵品',
    description: '適用於各國套票、首日封、小型張、紀念版張與古董實寄封',
    iconName: 'Mail',
    fields: [
      { name: '發行郵政地區', type: 'text', placeholder: '例如：台灣中華郵政、大龍郵票、英國皇家郵政' },
      { name: '發行日期', type: 'date' },
      { name: '面值總額', type: 'text', placeholder: '例如：NT$ 20、£ 1.50' },
      { name: '齒孔度數', type: 'text', placeholder: '例如：P 11.5 x 12' },
      {
        name: '郵品品相',
        type: 'select',
        options: ['全新原膠未貼 (MNH)', '已貼原膠 (MH)', '有膠損 (MLH)', '銷印蓋銷 (Used)', '首日封 (FDC)', '極品無摺'],
      },
      { name: '目錄編號 (Scott/Michel)', type: 'text', placeholder: '例如：Scott #1024' },
      { name: '全套完整版張', type: 'boolean' },
    ],
  },
  {
    id: 'watch',
    name: '腕錶飾品',
    description: '適用於經典機械腕錶、古董懷錶、骨董珠寶與貴重飾品',
    iconName: 'Watch',
    fields: [
      { name: '品牌 / 錶廠', type: 'text', placeholder: '例如：Rolex, Omega, Patek Philippe, Seiko' },
      { name: '型號 / Ref. 序號', type: 'text', placeholder: '例如：5513, 116610LN, Speedmaster' },
      {
        name: '機芯類型',
        type: 'select',
        options: ['自動上鍊機械', '手動上鍊機械', '石英機芯', '太陽能電波', '音叉機芯', '陀飛輪'],
      },
      { name: '錶徑', type: 'number', unit: 'mm', placeholder: '40' },
      {
        name: '錶殼材質',
        type: 'select',
        options: ['不鏽鋼 (Oystersteel)', '18K黃金', '18K白金', '玫瑰金', '鈦金屬', '陶瓷', '青銅', '銀製'],
      },
      { name: '原廠保卡與外盒齊全 (Full Set)', type: 'boolean' },
      { name: '出廠/保卡年份', type: 'number', unit: '年', placeholder: '1978' },
    ],
  },
  {
    id: 'vinyl',
    name: '黑膠唱片',
    description: '適用於 33轉 LP、45轉 單曲黑膠、稀有母帶壓片與爵士古典珍盤',
    iconName: 'Disc',
    fields: [
      { name: '演出藝人 / 樂團', type: 'text', placeholder: '例如：Miles Davis, The Beatles, 鄧麗君' },
      { name: '發行年份', type: 'number', unit: '年', placeholder: '1959' },
      { name: '唱片廠牌 / 號碼', type: 'text', placeholder: '例如：Columbia CL 1355, Blue Note' },
      {
        name: '唱片規格',
        type: 'select',
        options: ['12吋 33⅓ RPM (LP)', '7吋 45 RPM (Single)', '10吋 78 RPM (SP)', '雙黑膠 2LP', '180g 重磅發燒盤', '彩色限量膠'],
      },
      {
        name: '盤面品相等級 (Goldmine)',
        type: 'select',
        options: ['Mint (M) 全新未拆', 'Near Mint (NM)', 'Excellent (EX+)', 'Very Good Plus (VG+)', 'Very Good (VG)', 'Good (G)'],
      },
      {
        name: '產地版本',
        type: 'select',
        options: ['美版首版', '美版再版', '日版 (附側標OBI)', '英版', '德版', '台版'],
      },
      { name: '內附原始歌詞/海報', type: 'boolean' },
    ],
  },
  {
    id: 'trading_card',
    name: '卡牌遊戲 (TCG)',
    description: '適用於寶可夢卡牌、遊戲王、魔法風雲會、運動球員卡等',
    iconName: 'Layers',
    fields: [
      { name: '所屬卡牌系列', type: 'text', placeholder: '例如：寶可夢 151, 蒼空烈流' },
      { name: '卡牌編號', type: 'text', placeholder: '例如：205/165' },
      {
        name: '稀有度標記',
        type: 'select',
        options: ['SAR / UR', 'SR / HR', 'AR / CHR', 'RR / RRR', 'Secret Rare', 'Prismatic', 'Common/Uncommon'],
      },
      {
        name: '鑑定機構',
        type: 'select',
        options: ['未鑑定 (Raw 裸卡)', 'PSA', 'BGS (Beckett)', 'CGC', 'ARS', 'BGS Black Label'],
      },
      { name: '評級分數', type: 'text', placeholder: '例如：PSA 10 Gem Mint, BGS 9.5' },
      {
        name: '特殊加工工藝',
        type: 'multiSelect',
        options: ['全圖浮雕紋', '鏡面碎鑽閃', '雷射彩虹燙金', '首刷 1st Edition', '大師球鏡面', '親筆簽名'],
      },
      { name: '鑑定編號查驗網址', type: 'url', placeholder: 'https://www.psacard.com/cert/...' },
    ],
  },
];

export function createFieldsFromTemplate(template: CategoryTemplate): CustomFieldDefinition[] {
  return template.fields.map((f, idx) => ({
    id: `f_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
    ...f,
  }));
}
