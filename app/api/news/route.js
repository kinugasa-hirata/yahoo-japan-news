import { NextResponse } from 'next/server';

// This route redirects to Yahoo Japan for backward compatibility
export async function GET() {
  try {
    // Redirect to Yahoo Japan API
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/news/yahoo`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    }, { status: 500 });
  }
}