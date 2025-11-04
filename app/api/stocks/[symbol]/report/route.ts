// app/api/stocks/[symbol]/report/route.ts
import axios from 'axios';
import { API_BASE_URL } from '@/app/utils/config';
import { NextRequest, NextResponse } from 'next/server';

// Helper to get auth header
function getAuthHeader(request: Request): string | null {
  return request.headers.get('authorization');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    // Await the params to get the symbol
    const { symbol } = await params;
  

    console.log(`Fetching report for symbol: ${symbol}`);

    const response = await axios.get(
      `${API_BASE_URL}/report/${symbol}`,
      {
        headers: {
          Accept: 'application/json',
          // Authorization: authHeader,
        },
        timeout: 30000,
      }
    );

    console.log(`Successfully fetched report for ${symbol}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching stock report:', error.response?.data || error.message);
    
    // More detailed error handling
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Backend service unavailable. Please make sure the FastAPI server is running.' },
        { status: 503 }
      );
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: `Stock report for ${(await params).symbol} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: error.response?.data?.detail || 
               error.response?.data?.error || 
               'Failed to generate stock report' 
      },
      { status: error.response?.status || 500 }
    );
  }
}