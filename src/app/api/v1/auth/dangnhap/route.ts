import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { createTokenCookies } from '@/lib/middleware';
import { withAuthSecurity } from '@/lib/api-security';

async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Additional validation for spam prevention
    if (username.length < 3 || username.length > 20 || password.length < 6) {
      return NextResponse.json({ error: 'Invalid credentials format' }, { status: 400 });
    }

    // Attempt login
    const result = await loginUser(username, password, request);

    if (result) {
      const { user, accessToken, refreshToken } = result;

      // Remove sensitive information before sending response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, token_version, ...userWithoutPassword } = user;

      // Create response
      const response = NextResponse.json({
        success: true,
        message: 'Đăng nhập thành công',
        user: userWithoutPassword,
      });

      // Set HTTP-only cookies for tokens
      const cookies = createTokenCookies(accessToken, refreshToken);
      cookies.forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, cookie.options);
      });

      return response;
    } else {
      return NextResponse.json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withAuthSecurity(handleLogin);
