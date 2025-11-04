import axios from 'axios';
import { API_BASE_URL } from '@/app/utils/config';
import { NextRequest, NextResponse } from 'next/server';

// Helper to get auth header
function getAuthHeader(request: Request): string | null {
  return request.headers.get('authorization');
}

// GET watchlist items
export async function GET(request: Request) {
  try {
    const authHeader = getAuthHeader(request);
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await axios.get(`${API_BASE_URL}/watchlist/`, {
      headers: {
        Accept: 'application/json',
        Authorization: authHeader,  // Forward auth token
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching watchlist:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.detail || 'Failed to fetch watchlist' },
      { status: error.response?.status || 500 }
    );
  }
}

// POST new watchlist item
export async function POST(request: Request) {
  try {
    const authHeader = getAuthHeader(request);
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const watchListData = await request.json();
    const { stock_id } = watchListData;

    if (!stock_id) {
      return NextResponse.json(
        { error: 'Stock ID is required' },
        { status: 400 }
      );
    }

    console.log('Adding to watchlist:', { stock_id });

    const response = await axios.post(
      `${API_BASE_URL}/watchlist/`,
      { stock_id },  // Only send stock_id, user comes from token
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: authHeader,  // Forward auth token
        },
      }
    );

    console.log('Successfully added to watchlist:', response.data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error adding to watchlist:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: error.response?.data?.detail || 'Failed to add to watchlist',
      },
      { status: error.response?.status || 500 }
    );
  }
}

// DELETE from watchlist
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = getAuthHeader(request);
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const stockId = searchParams.get('stock_id');

    if (!stockId) {
      return NextResponse.json(
        { error: 'Stock ID is required' },
        { status: 400 }
      );
    }

    console.log(`Removing from watchlist: ${stockId}`);

    // Match FastAPI route: DELETE /watchlist/{stock_id}
    const response = await axios.delete(
      `${API_BASE_URL}/watchlist/${stockId}`,
      {
        headers: { 
          Accept: 'application/json',
          Authorization: authHeader,  // Forward auth token
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error deleting from watchlist:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.detail || 'Failed to delete from watchlist' },
      { status: error.response?.status || 500 }
    );
  }
}