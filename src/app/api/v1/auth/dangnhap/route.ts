import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { createTokenCookies } from '@/lib/middleware';
import { withApiSecurity } from '@/lib/api-security';
import { loginSchema, getVietnameseErrorMessage } from '@/lib/validation/auth';
import { ZodError } from 'zod';

async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate with Zod schema
    try {
      loginSchema.parse({ username, password });
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = getVietnameseErrorMessage(error);
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
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
    return NextResponse.json({ error: 'Lỗi hệ thống, vui lòng thử lại sau' }, { status: 500 });
  }
}

export const POST = withApiSecurity(handleLogin);
