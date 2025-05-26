// lib/newsConfig.js - ニュースソース設定（日本語版）

export const NEWS_SOURCES = [
  {
    id: 'yahoo',
    name: 'ヤフージャパン',
    country: '🇯🇵',
    url: 'https://www.yahoo.co.jp/',
    language: 'ja',
    color: 'bg-purple-500',
    description: '日本最大級のニュースポータル',
    selectors: [
      '.topicsListItem',
      '.newsFeed_item',
      '.topics_item',
      '.sc-gEvEer'
    ]
  },
  {
    id: 'jtbc',
    name: 'JTBC韓国',
    country: '🇰🇷',
    url: 'https://jtbc.co.kr/',
    language: 'ko',
    color: 'bg-red-500',
    description: '韓国主要ニュースネットワーク',
    selectors: [
      '.news_list li',
      '.main_news',
      '.news_item',
      '.article_list li',
      '.headline'
    ]
  },
  {
    id: 'ifeng',
    name: '鳳凰網香港',
    country: '🇭🇰',
    url: 'https://www.ifeng.com/',
    language: 'zh',
    color: 'bg-yellow-500',
    description: '人気中国語ニュースポータル',
    selectors: [
      '.news_list li',
      '.list_news li',
      '.news_item',
      '.article_item',
      '.headline'
    ]
  }
];

export const CATEGORIES = {
  politics: { 
    icon: '🏛️', 
    color: 'bg-blue-500',
    nameJa: '政治',
    keywords: ['政治', '政府', '国会', '選挙', '内閣', '首相']
  },
  economics: { 
    icon: '💰', 
    color: 'bg-green-500',
    nameJa: '経済',
    keywords: ['経済', '株価', '為替', '金融', '投資', '日銀']
  },
  sports: { 
    icon: '⚽', 
    color: 'bg-orange-500',
    nameJa: 'スポーツ',
    keywords: ['スポーツ', '野球', 'サッカー', 'オリンピック']
  },
  technology: { 
    icon: '💻', 
    color: 'bg-purple-500',
    nameJa: 'テクノロジー',
    keywords: ['技術', 'IT', 'デジタル', 'AI', '人工知能']
  },
  entertainment: { 
    icon: '🎭', 
    color: 'bg-pink-500',
    nameJa: 'エンタメ',
    keywords: ['芸能', 'エンタメ', '映画', '音楽', 'ドラマ']
  },
  health: { 
    icon: '🏥', 
    color: 'bg-red-500',
    nameJa: '健康',
    keywords: ['健康', '医療', 'コロナ', 'ワクチン']
  },
  science: { 
    icon: '🔬', 
    color: 'bg-indigo-500',
    nameJa: '科学',
    keywords: ['科学', '研究', '実験', '発見']
  },
  education: { 
    icon: '📚', 
    color: 'bg-yellow-500',
    nameJa: '教育',
    keywords: ['教育', '学校', '大学', '入試']
  },
  business: { 
    icon: '💼', 
    color: 'bg-gray-500',
    nameJa: 'ビジネス',
    keywords: ['企業', 'ビジネス', '業界', '会社']
  },
  international: { 
    icon: '🌍', 
    color: 'bg-teal-500',
    nameJa: '国際',
    keywords: ['国際', '海外', '外交', '世界']
  },
  local: { 
    icon: '🏘️', 
    color: 'bg-emerald-500',
    nameJa: '地域',
    keywords: ['地域', '地方', '県', '市']
  },
  general: { 
    icon: '📄', 
    color: 'bg-slate-500',
    nameJa: '一般',
    keywords: []
  }
};

// 翻訳サービス設定
export const TRANSLATION_CONFIG = {
  provider: 'mymemory', // 'google', 'azure', 'mymemory'
  targetLanguage: 'ja', // 日本語に変更
  fallbackToOriginal: true,
  maxRetries: 2
};

// レート制限とキャッシュ
export const API_CONFIG = {
  cacheTimeout: 5 * 60 * 1000, // 5分
  maxArticlesPerSource: 5, // ソースあたりの最大記事数
  requestTimeout: 10000, // 10秒
  maxConcurrentTranslations: 5 // 同時翻訳数
};