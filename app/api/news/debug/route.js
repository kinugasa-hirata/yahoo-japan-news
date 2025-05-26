// app/api/debug/route.js - Debug endpoint to test news sources
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source') || 'all';
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  // Test sources
  const sources = [
    { name: 'yahoo', url: 'https://www.yahoo.co.jp/' },
    { name: 'jtbc', url: 'https://news.jtbc.co.kr/' },
    { name: 'ifeng', url: 'https://news.ifeng.com/' }
  ];

  for (const testSource of sources) {
    if (source !== 'all' && source !== testSource.name) continue;
    
    console.log(`🧪 Testing ${testSource.name}: ${testSource.url}`);
    
    try {
      const startTime = Date.now();
      
      // Test basic fetch
      const response = await fetch(testSource.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ja,ko,zh,en-US;q=0.7,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 10000
      });

      const fetchTime = Date.now() - startTime;
      
      results.tests[testSource.name] = {
        url: testSource.url,
        status: response.status,
        statusText: response.statusText,
        fetchTime: `${fetchTime}ms`,
        headers: Object.fromEntries(response.headers.entries()),
        success: response.ok
      };

      if (response.ok) {
        const html = await response.text();
        const htmlLength = html.length;
        
        // Basic HTML analysis
        const $ = cheerio.load(html);
        const totalLinks = $('a').length;
        const totalImages = $('img').length;
        const title = $('title').text();
        
        // Test various selectors
        const selectorTests = {
          '.news_list li': $('.news_list li').length,
          '.newsFeed_item': $('.newsFeed_item').length,
          '.topicsListItem': $('.topicsListItem').length,
          '.news_item': $('.news_item').length,
          '.article_item': $('.article_item').length,
          '.headline': $('.headline').length,
          '.main_news': $('.main_news').length,
          '.list_item': $('.list_item').length,
          '.item_box': $('.item_box').length,
          'article': $('article').length,
          'h1, h2, h3': $('h1, h2, h3').length,
          'a[href*="news"]': $('a[href*="news"]').length,
          'a[href*="/"]': $('a[href*="/"]').length
        };

        // Find potential news links
        const newsLinks = [];
        $('a').each((i, element) => {
          if (i >= 20) return false; // Limit to first 20
          const $el = $(element);
          const text = $el.text().trim();
          const href = $el.attr('href');
          if (text && text.length > 10 && text.length < 200) {
            newsLinks.push({
              text: text.substring(0, 100),
              href: href,
              parent: $el.parent().attr('class') || 'no-class'
            });
          }
        });

        results.tests[testSource.name] = {
          ...results.tests[testSource.name],
          htmlLength,
          title,
          totalLinks,
          totalImages,
          selectorTests,
          sampleNewsLinks: newsLinks.slice(0, 10),
          potentialSelectors: Object.entries(selectorTests)
            .filter(([selector, count]) => count > 0)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
        };

        // Check for anti-bot measures
        const bodyText = $('body').text().toLowerCase();
        const antiBotSigns = {
          cloudflare: bodyText.includes('cloudflare'),
          captcha: bodyText.includes('captcha') || bodyText.includes('recaptcha'),
          blocked: bodyText.includes('blocked') || bodyText.includes('access denied'),
          bot_detection: bodyText.includes('bot') && bodyText.includes('detected'),
          javascript_required: bodyText.includes('javascript') && bodyText.includes('enable')
        };

        results.tests[testSource.name].antiBotSigns = antiBotSigns;

      } else {
        results.tests[testSource.name].error = `HTTP ${response.status}: ${response.statusText}`;
      }

    } catch (error) {
      console.error(`❌ Error testing ${testSource.name}:`, error);
      results.tests[testSource.name] = {
        url: testSource.url,
        success: false,
        error: error.message,
        errorType: error.name
      };
    }
  }

  return NextResponse.json(results, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

// app/api/test-selectors/route.js - Test specific selectors
export async function POST(request) {
  const { url, selectors } = await request.json();
  
  try {
    console.log(`🔍 Testing selectors for: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,ko,zh,en;q=0.9'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: `HTTP ${response.status}` 
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results = {};
    
    selectors.forEach(selector => {
      const elements = $(selector);
      results[selector] = {
        count: elements.length,
        samples: []
      };
      
      elements.each((i, element) => {
        if (i >= 5) return false; // Limit to 5 samples
        const $el = $(element);
        const text = $el.text().trim();
        const href = $el.find('a').attr('href') || $el.attr('href');
        
        if (text && text.length > 5) {
          results[selector].samples.push({
            text: text.substring(0, 150),
            href: href,
            html: $el.html()?.substring(0, 200)
          });
        }
      });
    });

    return NextResponse.json({
      success: true,
      url,
      results,
      htmlLength: html.length,
      totalElements: $('*').length
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}