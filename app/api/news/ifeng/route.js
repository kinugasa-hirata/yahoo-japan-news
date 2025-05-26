import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

// 中国語から日本語への翻訳機能
async function translateToJapanese(text, fromLang = 'zh') {
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|ja`);
    const data = await response.json();
    return data.responseData?.translatedText || text;
  } catch (error) {
    console.log('翻訳に失敗しました、元のテキストを使用します');
    return text;
  }
}

// 中国語ニュースのカテゴリ分類（日本語に統一）
function categorizeNews(title) {
  const categories = {
    politics: ['政治', '政府', '國會', '选举', '总统', '主席', '党', '两会'],
    economics: ['经济', '股票', '金融', '投资', '企业', '股市', '经济'],
    sports: ['体育', '足球', '篮球', '奥运', '世界杯', '比赛'],
    technology: ['科技', 'IT', '数字', '人工智能', '华为', '腾讯', '阿里'],
    entertainment: ['娱乐', '电影', '音乐', '明星', '演员', '导演'],
    health: ['健康', '医疗', '新冠', '疫苗', '医院', '治疗'],
    international: ['国际', '海外', '外交', '美国', '日本', '韩国', '欧洲'],
    business: ['商业', '公司', '行业', '营收', '业绩', '上市']
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
    console.log('🇭🇰 鳳凰網香港からニュースを取得中...');
    
    const response = await fetch('https://www.ifeng.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,ja;q=0.8,en;q=0.7'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('✅ 鳳凰網からHTMLを正常に取得しました');
    
    const $ = cheerio.load(html);
    const news = [];
    const categories = {};

    // 鳳凰網固有のセレクター
    const selectors = [
      '.news_list li',
      '.list_news li',
      '.news_item',
      '.article_item',
      '.headline',
      '.main_news',
      '.news_title'
    ];

    for (let selector of selectors) {
      $(selector).each(async (i, element) => {
        const $el = $(element);
        const $link = $el.find('a').first();
        const originalTitle = $link.text().trim() || $el.find('h1, h2, h3, h4').text().trim();
        let link = $link.attr('href');

        if (originalTitle && originalTitle.length > 10 && originalTitle.length < 200) {
          const category = categorizeNews(originalTitle);
          categories[category] = (categories[category] || 0) + 1;

          // 相対URLを修正
          if (link) {
            if (link.startsWith('/')) {
              link = `https://www.ifeng.com${link}`;
            } else if (!link.startsWith('http')) {
              link = `https://www.ifeng.com/${link}`;
            }
          } else {
            link = 'https://www.ifeng.com/';
          }
          
          // 中国語から日本語に翻訳
          const translatedTitle = await translateToJapanese(originalTitle, 'zh');
          
          news.push({
            id: `ifeng-${i}`,
            title: translatedTitle,
            originalTitle: originalTitle,
            link: link,
            category: category,
            source: 'ifeng',
            language: 'zh',
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

    // 鳳凰網のフォールバック方法
    if (news.length === 0) {
      console.log('🔄 鳳凰網のフォールバック方法を試行中...');
      
      $('a').each(async (i, element) => {
        const $el = $(element);
        const originalTitle = $el.text().trim();
        let link = $el.attr('href');
        
        if (originalTitle && 
            originalTitle.length > 15 && 
            originalTitle.length < 150 && 
            link &&
            !originalTitle.includes('凤凰网') &&
            !originalTitle.includes('登录') &&
            !originalTitle.includes('搜索')
        ) {
          if (link.startsWith('/')) {
            link = `https://www.ifeng.com${link}`;
          }
          
          const category = categorizeNews(originalTitle);
          const translatedTitle = await translateToJapanese(originalTitle, 'zh');
          
          news.push({
            id: `ifeng-fallback-${i}`,
            title: translatedTitle,
            originalTitle: originalTitle,
            link: link,
            category: category,
            source: 'ifeng',
            language: 'zh',
            timestamp: new Date().toLocaleDateString('ja-JP')
          });
        }

        if (news.length >= 10) return false;
      });
    }

    // 全ての翻訳が完了するまで待機
    await Promise.all(news.map(async (item) => {
      if (item.title === item.originalTitle) {
        item.title = await translateToJapanese(item.originalTitle, 'zh');
      }
    }));

    // 重複を削除してトップ5を取得
    const uniqueNews = news.filter((item, index, self) => 
      index === self.findIndex(t => t.originalTitle === item.originalTitle)
    );
    
    const topNews = uniqueNews.slice(0, 5);

    console.log(`✅ 鳳凰網香港から${topNews.length}件の翻訳記事を返します`);

    return NextResponse.json({
      success: true,
      news: topNews,
      categories: categories,
      fetchedAt: new Date().toISOString(),
      source: 'iFeng Hong Kong',
      language: 'zh',
      translated: true
    });

  } catch (error) {
    console.error('❌ 鳳凰網香港ニュース取得エラー:', error);
    return NextResponse.json({
      success: false,
      message: '鳳凰網香港からのニュース取得に失敗しました',
      error: error.message
    }, { status: 500 });
  }
}