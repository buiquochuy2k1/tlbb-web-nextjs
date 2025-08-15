import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key is required',
        },
        { status: 400 }
      );
    }

    // Verify API key against environment variable
    const correctKey = process.env.UNLOCK_TINTUC_API_KEY;

    if (!correctKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error',
        },
        { status: 500 }
      );
    }

    if (apiKey === correctKey) {
      return NextResponse.json({
        success: true,
        message: 'Access granted',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid API key',
        },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Verify access API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
