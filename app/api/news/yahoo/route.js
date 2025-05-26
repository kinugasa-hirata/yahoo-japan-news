import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

// 韓国語・中国語から日本語への翻訳機能
async function translateToJapanese(text, fromLang = 'ko') {
  try {
    // 日本語の場合はそのまま返す
    if (fromLang === 'ja') {
      return text;
    }
    
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|ja`);
    const data = await response.json();
    return data.responseData?.translatedText || text;
  } catch (error) {
    console.log('翻訳に失敗しました、元のテキストを使用します');
    return text;
  }
}

// ニュースのカテゴリ分類（日本語キーワード）
function categorizeNews(title) {
  const categories = {
    politics: ['政治', '内閣', '選挙', '政府', '国会', '首相', '大臣', '与党', '野党'],
    economics: ['経済', '株価', '為替', '金融', '投資', '日銀', '円安', '円高', '景気'],
    sports: ['スポーツ', '野球', 'サッカー', 'オリンピック', 'プロ野球', 'Jリーグ', '試合'],
    technology: ['技術', 'IT', 'デジタル', 'AI', '人工知能', 'テック', 'イノベーション'],
    entertainment: ['芸能', 'エンタメ', '映画', '音楽', 'ドラマ', 'アニメ', '俳優', '女優'],
    health: ['健康', '医療', 'コロナ', 'ワクチン', '病院', '治療', '薬'],
    international: ['国際', '海外', '外交', '中国', '韓国', 'アメリカ', '世界'],
    business: ['企業', 'ビジネス', '業界', '会社', '売上', '決算', '株式']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => title.includes(keyword))) {
      return category;
    }
  }
  return 'general';
}

export async function GET() {
  try {
    console.log('🇯🇵 Yahoo Japanからニュースを取得中...');
    
    const response = await fetch('https://www.yahoo.co.jp/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('✅ HTMLを正常に取得しました');
    
    const $ = cheerio.load(html);
    const news = [];
    const categories = {};

    // Yahoo Japan固有のセレクター
    const selectors = [
      '.topicsListItem',
      '.newsFeed_item', 
      '.topics_item',
      '.sc-gEvEer'
    ];

    for (let selector of selectors) {
      $(selector).each((i, element) => {
        const $el = $(element);
        const $link = $el.find('a').first();
        const title = $link.text().trim() || $el.text().trim();
        const link = $link.attr('href');

        if (title && title.length > 10) {
          const category = categorizeNews(title);
          categories[category] = (categories[category] || 0) + 1;

          const fullLink = link && link.startsWith('http') ? link : 
                          link ? `https://www.yahoo.co.jp${link}` : 
                          'https://www.yahoo.co.jp/';
          
          news.push({
            id: `yahoo-${i}`,
            title: title, // 日本語なのでそのまま
            originalTitle: title,
            link: fullLink,
            category: category,
            source: 'yahoo',
            language: 'ja',
            timestamp: new Date().toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          });
        }
      });
      
      if (news.length >= 10) break;
    }

    // フォールバック方法
    if (news.length === 0) {
      console.log('🔄 フォールバック方法を試行中...');
      
      $('a').each((i, element) => {
        const $el = $(element);
        const title = $el.text().trim();
        const link = $el.attr('href');
        
        if (title && 
            title.length > 20 && 
            title.length < 150 && 
            link &&
            !title.includes('Yahoo') &&
            !title.includes('ログイン') &&
            !title.includes('検索')
        ) {
          const fullLink = link.startsWith('http') ? link : `https://www.yahoo.co.jp${link}`;
          const category = categorizeNews(title);
          
          news.push({
            id: `yahoo-fallback-${i}`,
            title: title,
            originalTitle: title,
            link: fullLink,
            category: category,
            source: 'yahoo',
            language: 'ja',
            timestamp: new Date().toLocaleDateString('ja-JP')
          });
        }

        if (news.length >= 10) return false;
      });
    }

    const topNews = news.slice(0, 5);

    console.log(`✅ Yahoo Japanから${topNews.length}件の記事を返します`);

    return NextResponse.json({
      success: true,
      news: topNews,
      categories: categories,
      fetchedAt: new Date().toISOString(),
      source: 'Yahoo Japan',
      language: 'ja',
      translated: false // 既に日本語
    });

  } catch (error) {
    console.error('❌ Yahoo Japanニュース取得エラー:', error);
    return NextResponse.json({
      success: false,
      message: 'Yahoo Japanからのニュース取得に失敗しました',
      error: error.message
    }, { status: 500 });
  }
}