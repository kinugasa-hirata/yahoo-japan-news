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
      
      // Test basic fetch with comprehensive headers
      const response = await fetch(testSource.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ja,ko,zh,en-US;q=0.7,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      const fetchTime = Date.now() - startTime;
      
      results.tests[testSource.name] = {
        url: testSource.url,
        status: response.status,
        statusText: response.statusText,
        fetchTime: `${fetchTime}ms`,
        responseHeaders: {
          'content-type': response.headers.get('content-type'),
          'content-length': response.headers.get('content-length'),
          'server': response.headers.get('server'),
          'cf-ray': response.headers.get('cf-ray'), // Cloudflare
          'x-frame-options': response.headers.get('x-frame-options')
        },
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
        
        // Test various selectors that might contain news
        const selectorTests = {
          // Common news selectors
          '.news_list li': $('.news_list li').length,
          '.newsFeed_item': $('.newsFeed_item').length,
          '.topicsListItem': $('.topicsListItem').length,
          '.news_item': $('.news_item').length,
          '.article_item': $('.article_item').length,
          '.headline': $('.headline').length,
          '.main_news': $('.main_news').length,
          '.list_item': $('.list_item').length,
          '.item_box': $('.item_box').length,
          
          // Generic selectors
          'article': $('article').length,
          'li': $('li').length,
          'h1, h2, h3': $('h1, h2, h3').length,
          
          // Links that might be news
          'a[href*="news"]': $('a[href*="news"]').length,
          'a[href*="/202"]': $('a[href*="/202"]').length, // Year in URL
          'a[href*="/article"]': $('a[href*="/article"]').length,
          
          // Japanese specific
          'a[href*="ニュース"]': $('a[href*="ニュース"]').length,
          
          // Korean specific (for JTBC)
          'a[href*="뉴스"]': $('a[href*="뉴스"]').length,
          '.news': $('.news').length,
          
          // Chinese specific (for iFeng)
          'a[href*="新闻"]': $('a[href*="新闻"]').length,
          '.news_box': $('.news_box').length
        };

        // Find potential news links by analyzing link text
        const newsLinks = [];
        $('a').each((i, element) => {
          if (i >= 50) return false; // Limit to first 50 for performance
          const $el = $(element);
          const text = $el.text().trim();
          const href = $el.attr('href');
          const parentClass = $el.parent().attr('class') || 'no-class';
          
          // Filter for potential news content
          if (text && 
              text.length > 10 && 
              text.length < 200 && 
              href &&
              !text.includes('ログイン') &&
              !text.includes('로그인') &&
              !text.includes('登录') &&