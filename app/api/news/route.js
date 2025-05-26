import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Fetching news from Yahoo Japan...');
    
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

    // Try multiple selectors for Yahoo Japan
    $('.topicsListItem, .newsFeed_item, .topics_item, .sc-gEvEer').each((i, element) => {
      const $el = $(element);
      const $link = $el.find('a').first();
      const title = $link.text().trim() || $el.text().trim();
      const link = $link.attr('href');

      if (title && title.length > 10) {
        const fullLink = link && link.startsWith('http') ? link : `https://www.yahoo.co.jp${link}`;
        
        news.push({
          id: i,
          title: title.substring(0, 200),
          link: fullLink,
          timestamp: new Date().toLocaleDateString('ja-JP')
        });
      }
    });

    // Fallback: try any links if specific selectors don't work
    if (news.length === 0) {
      console.log('🔄 Trying fallback method...');
      
      $('a').each((i, element) => {
        const $el = $(element);
        const title = $el.text().trim();
        const link = $el.attr('href');
        
        if (title && title.length > 20 && title.length < 150 && link) {
          news.push({
            id: i,
            title: title,
            link: link.startsWith('http') ? link : `https://www.yahoo.co.jp${link}`,
            timestamp: new Date().toLocaleDateString('ja-JP')
          });
        }
      });
    }

    const uniqueNews = news.slice(0, 20);
    console.log(`✅ Found ${uniqueNews.length} news items`);

    return NextResponse.json({
      success: true,
      news: uniqueNews,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching news:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    }, { status: 500 });
  }
}