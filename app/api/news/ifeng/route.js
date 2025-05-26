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
    politics: ['政治', '政府', '國會', '选举', '总统', '主席', '党', '两会', '特朗普', '拜登', '政策'],
    economics: ['经济', '股票', '金融', '投资', '企业', '股市', '贸易', '经济', '银行', '财经'],
    sports: ['体育', '足球', '篮球', '奥运', '世界杯', '比赛', '运动', '联赛'],
    technology: ['科技', 'IT', '数字', '人工智能', '华为', '腾讯', '阿里', '芯片', '技术'],
    entertainment: ['娱乐', '电影', '音乐', '明星', '演员', '导演', '贝克汉姆', '娱乐圈'],
    health: ['健康', '医疗', '新冠', '疫苗', '医院', '治疗', '病毒', '健康'],
    international: ['国际', '海外', '外交', '美国', '日本', '韩国', '欧洲', '俄罗斯', '国外'],
    business: ['商业', '公司', '行业', '营收', '业绩', '上市', '律师', '企业'],
    education: ['教育', '大学', '学校', '哈佛', '学生', '留学', '教学']
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
    console.log('🇭🇰 鳳凰網ニュースページからニュースを取得中...');
    
    const response = await fetch('https://news.ifeng.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,ja;q=0.8,en;q=0.7',
        'Referer': 'https://www.ifeng.com/',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('✅ 鳳凰網ニュースページからHTMLを正常に取得しました');
    console.log(`📊 HTMLサイズ: ${html.length.toLocaleString()} 文字`);
    
    const $ = cheerio.load(html);
    let news = [];
    const categories = {};

    // Method 1: Try multiple CSS selectors based on iFeng structure
    const selectors = [
      'a[href*="/c/"]', // News article links
      'a[href*="/news/"]', // News section links
      '.news-item a',
      '.list-item a',
      '.item-title a',
      '.headline a',
      'h3 a',
      'h2 a',
      '.title a'
    ];

    console.log('🔍 CSS セレクターで記事を検索中...');
    
    for (const selector of selectors) {
      const elements = $(selector);
      console.log(`セレクター "${selector}": ${elements.length} 要素見つかりました`);
      
      elements.each((i, element) => {
        if (news.length >= 20) return false; // Limit to prevent too many
        
        const $el = $(element);
        const originalTitle = $el.text().trim();
        const link = $el.attr('href');
        
        // Filter for news-like content
        if (originalTitle && 
            originalTitle.length > 15 && 
            originalTitle.length < 200 &&
            link &&
            !originalTitle.includes('凤凰网') &&
            !originalTitle.includes('更多') &&
            !originalTitle.includes('首页') &&
            !originalTitle.includes('登录') &&
            !originalTitle.includes('注册') &&
            !link.includes('javascript:') &&
            !link.includes('#')
        ) {
          const category = categorizeNews(originalTitle);
          
          // Fix relative URLs
          let fullLink = link;
          if (link.startsWith('/')) {
            fullLink = `https://news.ifeng.com${link}`;
          } else if (!link.startsWith('http')) {
            fullLink = `https://news.ifeng.com/${link}`;
          }
          
          news.push({
            id: `ifeng-${selector.replace(/[^a-zA-Z0-9]/g, '')}-${i}`,
            title: originalTitle, // Will translate later
            originalTitle: originalTitle,
            link: fullLink,
            category: category,
            source: 'ifeng',
            language: 'zh',
            selector: selector,
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
      
      if (news.length > 10) break; // Found enough, stop trying selectors
    }

    // Method 2: Text-based extraction as fallback
    if (news.length < 5) {
      console.log('🔄 テキストベースの抽出を試行中...');
      
      const newsTexts = html.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 15 && 
               trimmed.length < 200 && 
               !trimmed.includes('<') && 
               !trimmed.includes('>') && 
               !trimmed.includes('http') &&
               !trimmed.includes('今天') &&
               !trimmed.includes('更多') &&
               !trimmed.includes('凤凰') &&
               !trimmed.includes('script') &&
               !trimmed.includes('style') &&
               (trimmed.includes('？') || trimmed.includes('：') || trimmed.includes('，') || trimmed.includes('。'));
      });

      console.log(`📝 ${newsTexts.length} 個のテキスト候補を発見`);

      for (let i = 0; i < Math.min(newsTexts.length, 15); i++) {
        const originalTitle = newsTexts[i].trim();
        
        if (originalTitle.length > 15) {
          const category = categorizeNews(originalTitle);
          
          news.push({
            id: `ifeng-text-${i}`,
            title: originalTitle, // Will translate later
            originalTitle: originalTitle,
            link: 'https://news.ifeng.com/',
            category: category,
            source: 'ifeng',
            language: 'zh',
            selector: 'text-extraction',
            timestamp: new Date().toLocaleDateString('ja-JP')
          });
        }
      }
    }

    // Method 3: DOM traversal as last resort
    if (news.length < 3) {
      console.log('🔄 DOM traversal を試行中...');
      
      $('body').find('*').each((i, element) => {
        if (news.length >= 10) return false;
        
        const $el = $(element);
        const text = $el.text().trim();
        
        // Look for news-like patterns
        if (text && 
            text.length > 20 && 
            text.length < 150 &&
            (text.includes('？') || text.includes('：') || text.includes('。')) &&
            !text.includes('凤凰网') &&
            !text.includes('更多') &&
            !text.includes('首页') &&
            !text.includes('版权')
        ) {
          const category = categorizeNews(text);
          
          news.push({
            id: `ifeng-dom-${i}`,
            title: text, // Will translate later
            originalTitle: text,
            link: 'https://news.ifeng.com/',
            category: category,
            source: 'ifeng',
            language: 'zh',
            selector: 'dom-traversal',
            timestamp: new Date().toLocaleDateString('ja-JP')
          });
        }
      });
    }

    console.log(`📰 総記事数: ${news.length}`);

    // Remove duplicates
    const uniqueNews = news.filter((item, index, self) => 
      index === self.findIndex(t => t.originalTitle === item.originalTitle)
    );

    console.log(`🧹 重複削除後: ${uniqueNews.length} 件`);

    // Count categories
    uniqueNews.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });

    // Get top 5 and translate
    const topNews = uniqueNews.slice(0, 5);
    
    console.log('🌐 日本語翻訳を開始...');
    
    // Translate all titles to Japanese with error handling
    const translationPromises = topNews.map(async (item, index) => {
      try {
        console.log(`翻訳中 ${index + 1}/${topNews.length}: ${item.originalTitle.substring(0, 50)}...`);
        const translatedTitle = await translateToJapanese(item.originalTitle, 'zh');
        item.title = translatedTitle;
        return item;
      } catch (error) {
        console.log(`翻訳失敗: ${item.originalTitle}`);
        item.title = item.originalTitle; // Keep original if translation fails
        return item;
      }
    });

    const translatedNews = await Promise.all(translationPromises);

    console.log(`✅ 鳳凰網香港から${translatedNews.length}件の翻訳記事を返します`);

    // Log successful extraction methods for debugging
    const extractionMethods = [...new Set(translatedNews.map(item => item.selector))];
    console.log(`🔧 使用した抽出方法: ${extractionMethods.join(', ')}`);

    return NextResponse.json({
      success: true,
      news: translatedNews,
      categories: categories,
      fetchedAt: new Date().toISOString(),
      source: 'iFeng Hong Kong',
      language: 'zh',
      translated: true,
      debug: {
        htmlLength: html.length,
        totalExtracted: news.length,
        uniqueCount: uniqueNews.length,
        finalCount: translatedNews.length,
        extractionMethods: extractionMethods,
        categoryCounts: categories
      }
    });

  } catch (error) {
    console.error('❌ 鳳凰網香港ニュース取得エラー:', error);
    return NextResponse.json({
      success: false,
      message: '鳳凰網香港からのニュース取得に失敗しました',
      error: error.message,
      debug: {
        timestamp: new Date().toISOString(),
        errorType: error.name
      }
    }, { status: 500 });
  }
}