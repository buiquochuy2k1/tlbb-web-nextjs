import { NextRequest, NextResponse } from 'next/server';
import { registerUser, isUsernameAvailable } from '@/lib/auth';
import { withApiSecurity } from '@/lib/api-security';
import { registerSchema, getVietnameseErrorMessage } from '@/lib/validation/auth';
import { ZodError } from 'zod';

async function handleRegisterPOST(request: NextRequest) {
  try {
    const body = await request.json();

    // Transform data to match client schema format
    const formData = {
      ten: body.username,
      mk: body.password,
      rmk: body.confirmPassword,
      email: body.email || '',
      cauhoi: '1', // Default valid question
      traloi: body.answer || '',
      retraloi: body.answer || '',
      ck: 'ok', // Server assumes agreement
      maxacnhan: '1', // Server bypass captcha
      pin: '1234', // Default PIN for server validation
    };

    // Validate with Zod schema
    try {
      registerSchema.parse(formData);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = getVietnameseErrorMessage(error);
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
    }

    // Check username availability
    const isAvailable = await isUsernameAvailable(body.username);
    if (!isAvailable) {
      return NextResponse.json({ error: 'Tên đăng nhập đã tồn tại' }, { status: 409 });
    }

    // Register user
    const success = await registerUser(
      {
        name: body.username,
        password: body.password,
        showpassword: body.password,
        question: body.question || null,
        answer: body.answer || null,
        email: body.email || null,
        sodienthoai: body.phone || '0',
      },
      request
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Đăng ký thành công',
      });
    } else {
      return NextResponse.json({ error: 'Đăng ký thất bại' }, { status: 500 });
    }
  } catch (error) {
    console.error('Registration API error:', error);

    if (error instanceof Error && error.message === 'Username already exists') {
      return NextResponse.json({ error: 'Tên đăng nhập đã tồn tại' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Lỗi hệ thống, vui lòng thử lại sau' }, { status: 500 });
  }
}

async function handleUsernameCheck(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Tham số tên đăng nhập là bắt buộc' }, { status: 400 });
    }

    const isAvailable = await isUsernameAvailable(username);

    return NextResponse.json({
      available: isAvailable,
      message: isAvailable ? 'Tên đăng nhập có thể sử dụng' : 'Tên đăng nhập đã tồn tại',
    });
  } catch (error) {
    console.error('Username check API error:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống, vui lòng thử lại sau' }, { status: 500 });
  }
}

export const POST = withApiSecurity(handleRegisterPOST);
export const GET = withApiSecurity(handleUsernameCheck);
