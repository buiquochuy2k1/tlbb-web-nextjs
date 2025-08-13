import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';
import { clearAuthCookies } from '@/lib/middleware';
import { verifyAccessToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Get user from token instead of request body
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await logoutUser(payload.userId);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Đăng xuất thành công',
    });

    // Clear HTTP-only cookies
    const clearCookies = clearAuthCookies();
    clearCookies.forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    });

    return response;
  } catch (error) {
    console.error('Logout API error:', error);

    // Even if there's an error, clear the cookies
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    const clearCookies = clearAuthCookies();
    clearCookies.forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    });

    return response;
  }
}
