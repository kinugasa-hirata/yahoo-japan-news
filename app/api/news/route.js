import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Fetching top 5 news from Yahoo Japan...');
    
    const response = await fetch('https://www.yahoo.co.jp/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('✅ HTML fetched successfully, length:', html.length);
    
    const $ = cheerio.load(html);
    const news = [];

    // Try multiple selectors for Yahoo Japan news
    const selectors = [
      '.topicsListItem',
      '.newsFeed_item', 
      '.topics_item',
      '.sc-gEvEer',
      '.topics-item'
    ];

    console.log('🔍 Searching for news articles...');

    // Try each selector until we find enough news
    for (let selector of selectors) {
      $(selector).each((i, element) => {
        const $el = $(element);
        const $link = $el.find('a').first();
        const title = $link.text().trim() || $el.text().trim();
        const link = $link.attr('href');

        if (title && title.length > 10 && title.length < 300) {
          const fullLink = link && link.startsWith('http') ? link : 
                          link ? `https://www.yahoo.co.jp${link}` : 
                          'https://www.yahoo.co.jp/';
          
          news.push({
            id: `${selector.replace('.', '')}-${i}`,
            title: title.substring(0, 150), // Shorter titles for better layout
            link: fullLink,
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
      
      console.log(`Found ${news.length} items with selector: ${selector}`);
      if (news.length >= 10) break; // Get more than 5 so we can pick the best
    }

    // Fallback method if specific selectors don't work
    if (news.length === 0) {
      console.log('🔄 Trying fallback method...');
      
      $('a').each((i, element) => {
        const $el = $(element);
        const title = $el.text().trim();
        const link = $el.attr('href');
        
        // Look for news-like content
        if (title && 
            title.length > 20 && 
            title.length < 200 && 
            link &&
            !title.includes('Yahoo') &&
            !title.includes('ログイン') &&
            !title.includes('設定') &&
            !title.includes('検索') &&
            (title.includes('・') || title.includes('…') || /[ニュース|速報|発表|決定|開始|終了]/.test(title))
        ) {
          const fullLink = link.startsWith('http') ? link : `https://www.yahoo.co.jp${link}`;
          
          news.push({
            id: `fallback-${i}`,
            title: title.substring(0, 150),
            link: fullLink,
            timestamp: new Date().toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          });
        }

        if (news.length >= 10) return false; // Stop when we have enough
      });
    }

    // Remove duplicates and get best 10 articles
    const uniqueNews = news.filter((item, index, self) => 
      index === self.findIndex(t => t.title === item.title)
    );

    // Return top 10 (frontend will limit to 5)
    const topNews = uniqueNews.slice(0, 10);

    console.log(`✅ Returning ${topNews.length} news articles`);

    return NextResponse.json({
      success: true,
      news: topNews,
      fetchedAt: new Date().toISOString(),
      totalFound: news.length,
      uniqueCount: uniqueNews.length
    });

  } catch (error) {
    console.error('❌ Error fetching news:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch news from Yahoo Japan',
      error: error.message
    }, { status: 500 });
  }
}
