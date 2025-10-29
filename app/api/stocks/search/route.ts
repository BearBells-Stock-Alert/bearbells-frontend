import { API_BASE_URL } from '@/app/utils/config';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const limit = searchParams.get('limit') || '50';

    if (!query) {
      return NextResponse.json([]);
    }

    const response = await fetch(
      `${API_BASE_URL}/stocks/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const stocks = await response.json();
    return NextResponse.json(stocks);
  } catch (error) {
    console.error('Error searching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to search stocks' },
      { status: 500 }
    );
  }
}