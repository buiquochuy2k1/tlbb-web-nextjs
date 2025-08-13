import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from HTTP-only cookie
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    const newAccessToken = await refreshAccessToken(refreshToken);

    if (newAccessToken) {
      // Create response
      const response = NextResponse.json({
        success: true,
        message: 'Token refreshed successfully',
      });

      // Set new access token cookie
      const isProduction = process.env.NODE_ENV === 'production';
      response.cookies.set('access_token', newAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Token refresh API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
