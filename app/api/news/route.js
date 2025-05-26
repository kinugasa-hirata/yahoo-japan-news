import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple fallback response
    return NextResponse.json({
      success: true,
      message: 'Fallback API working',
      news: [
        {
          id: 'test-1',
          title: 'Test Article 1 - API is working',
          link: 'https://www.yahoo.co.jp/',
          timestamp: new Date().toLocaleString('ja-JP')
        },
        {
          id: 'test-2', 
          title: 'Test Article 2 - Basic functionality confirmed',
          link: 'https://www.yahoo.co.jp/',
          timestamp: new Date().toLocaleString('ja-JP')
        }
      ],
      source: 'Fallback',
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Fallback API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Fallback API failed',
      error: error.message
    }, { status: 500 });
  }
}