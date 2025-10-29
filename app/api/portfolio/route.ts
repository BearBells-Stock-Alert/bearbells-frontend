import axios from 'axios';
import { API_BASE_URL } from '@/app/utils/config';
import { NextRequest, NextResponse } from 'next/server';

// GET portfolio items
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const response = await axios.get(`${API_BASE_URL}/portfolio/`, {
      params: { user_id: userId },
      headers: {
        Accept: 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

// POST new portfolio item
export async function POST(request: Request) {
  try {
    const portfolioData = await request.json();
    const { user_id } = portfolioData;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required in the request body' },
        { status: 400 }
      );
    }

    console.log('Portfolio request data:', portfolioData);

    // Make POST request with axios
    const response = await axios.post(
      `${API_BASE_URL}/portfolio/`,
      portfolioData,
      {
        params: { user_id },
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Result for posting:', response.data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error adding to portfolio:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error:
          error.response?.data?.detail ||
          'Failed to add to portfolio',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const itemId = searchParams.get('id');

    if (!userId || !itemId) {
      return NextResponse.json(
        { error: 'User ID and item ID are required' },
        { status: 400 }
      );
    }

    console.log(`DELETE call received for item ${itemId} by user ${userId}`);

    const response = await axios.delete(`${API_BASE_URL}/portfolio/${itemId}`, {
      params: { user_id: userId },
      headers: { Accept: 'application/json' },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error deleting portfolio item:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.detail || 'Failed to delete portfolio item' },
      { status: 500 }
    );
  }
}


