import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🇰🇷 JTBC Korea - 準備中...');
  
  return NextResponse.json({
    success: true,
    news: [
      {
        id: 'jtbc-coming-soon-1',
        title: 'JTBC韓国ニュースは準備中です',
        originalTitle: 'JTBC Korea News Coming Soon',
        link: 'https://news.jtbc.co.kr/',
        category: 'general',
        source: 'jtbc',
        language: 'ko',
        timestamp: new Date().toLocaleDateString('ja-JP')
      },
      {
        id: 'jtbc-coming-soon-2',
        title: 'Cloudflare Workers実装を準備中',
        originalTitle: 'Preparing Cloudflare Workers Implementation',
        link: 'https://news.jtbc.co.kr/',
        category: 'technology',
        source: 'jtbc', 
        language: 'ko',
        timestamp: new Date().toLocaleDateString('ja-JP')
      }
    ],
    categories: { 
      general: 1,
      technology: 1 
    },
    fetchedAt: new Date().toISOString(),
    source: 'JTBC Korea (準備中)',
    language: 'ko',
    translated: true,
    comingSoon: true,
    message: 'JTBCは地域制限のため、Cloudflare Workersの実装を準備中です'
  });
}