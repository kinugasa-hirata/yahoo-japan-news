import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

// 韓国語から日本語への翻訳機能
async function translateToJapanese(text, fromLang = 'ko') {
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|ja`);
    const data = await response.json();
    return data.responseData?.translatedText || text;
  } catch (error) {
    console.log('翻訳に失敗しました、元のテキストを使用します');
    return text;
  }
}

// 韓国語ニュースのカテゴリ分類（日本語に統一）
function categorizeNews(title) {
  const categories = {
    politics: ['정치', '대통령', '국회', '선거', '정부', '정당', '청와대'],
    economics: ['경제', '주식', '금융', '투자', '기업', '증시', '코스피'],
    sports: ['스포츠', '축구', '야구', '올림픽', '월드컵', '프로야구'],
    technology: ['기술', 'IT', '디지털', '인공지능', '스마트폰', '삼성', 'LG'],
    entertainment: ['연예', '영화', '음악', '드라마', 'K팝', '아이돌'],
    health: ['건강', '의료', '코로나', '백신', '병원', '치료'],
    international: ['국제', '해외', '외교', '북한', '미국', '중국', '일본'],
    business: ['기업', '비즈니스', '산업', '회사', '매출', '실적']
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
    console.log('🇰🇷 JTBC韓国ニュースページからニュースを取得中...');
    
    const response = await fetch('https://news.jtbc.co.kr/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko,ja;q=0.9,en;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('✅ JTBCニュースページからHTMLを正常に取得しました');
    
    const $ = cheerio.load(html);
    const news = [];
    const categories = {};

    // JTBC News固有のセレクター（より具体的に）
    const selectors = [
      '.news_list li',
      '.list_item',
      '.news_item',
      '.article_list li',
      '.headline',
      '.main_news',
      '.news_title',
      '.item_box'
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
              link = `https://news.jtbc.co.kr${link}`;
            } else if (!link.startsWith('http')) {
              link = `https://news.jtbc.co.kr/${link}`;
            }
          } else {
            link = 'https://news.jtbc.co.kr/';
          }
          
          // 韓国語から日本語に翻訳
          const translatedTitle = await translateToJapanese(originalTitle, 'ko');
          
          news.push({
            id: `jtbc-${i}`,
            title: translatedTitle,
            originalTitle: originalTitle,
            link: link,
            category: category,
            source: 'jtbc',
            language: 'ko',
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

    // JTBCのフォールバック方法
    if (news.length === 0) {
      console.log('🔄 JTBCのフォールバック方法を試行中...');
      
      $('a').each(async (i, element) => {
        const $el = $(element);
        const originalTitle = $el.text().trim();
        let link = $el.attr('href');
        
        if (originalTitle && 
            originalTitle.length > 15 && 
            originalTitle.length < 150 && 
            link &&
            !originalTitle.includes('JTBC') &&
            !originalTitle.includes('로그인') &&
            !originalTitle.includes('검색')
        ) {
          if (link.startsWith('/')) {
            link = `https://news.jtbc.co.kr${link}`;
          }
          
          const category = categorizeNews(originalTitle);
          const translatedTitle = await translateToJapanese(originalTitle, 'ko');
          
          news.push({
            id: `jtbc-fallback-${i}`,
            title: translatedTitle,
            originalTitle: originalTitle,
            link: link,
            category: category,
            source: 'jtbc',
            language: 'ko',
            timestamp: new Date().toLocaleDateString('ja-JP')
          });
        }

        if (news.length >= 10) return false;
      });
    }

    // 全ての翻訳が完了するまで待機
    await Promise.all(news.map(async (item) => {
      if (item.title === item.originalTitle) {
        item.title = await translateToJapanese(item.originalTitle, 'ko');
      }
    }));

    // 重複を削除してトップ5を取得
    const uniqueNews = news.filter((item, index, self) => 
      index === self.findIndex(t => t.originalTitle === item.originalTitle)
    );
    
    const topNews = uniqueNews.slice(0, 5);

    console.log(`✅ JTBC韓国から${topNews.length}件の翻訳記事を返します`);

    return NextResponse.json({
      success: true,
      news: topNews,
      categories: categories,
      fetchedAt: new Date().toISOString(),
      source: 'JTBC Korea',
      language: 'ko',
      translated: true
    });

  } catch (error) {
    console.error('❌ JTBC韓国ニュース取得エラー:', error);
    return NextResponse.json({
      success: false,
      message: 'JTBC韓国からのニュース取得に失敗しました',
      error: error.message
    }, { status: 500 });
  }
}