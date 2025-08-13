import { NextRequest, NextResponse } from 'next/server';
import { registerUser, isUsernameAvailable } from '@/lib/auth';
import { withAuthSecurity } from '@/lib/api-security';

async function handleRegisterPOST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, confirmPassword, question, answer, email, phone } = body;

    // Validate input
    if (!username || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Username, password, and confirm password are required' },
        { status: 400 }
      );
    }

    // Additional validation for spam prevention
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: 'Username must be 3-20 characters' }, { status: 400 });
    }

    // Check for suspicious patterns
    if (/^(test|admin|root|user|guest|demo)\d*$/i.test(username)) {
      return NextResponse.json({ error: 'Username not allowed' }, { status: 400 });
    }

    // Check for sequential or repeated patterns
    if (/(.)\1{3,}/.test(username) || /123|abc|qwe|asd/i.test(username)) {
      return NextResponse.json({ error: 'Username contains invalid patterns' }, { status: 400 });
    }

    // Check password match
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Check password length
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Check username availability
    const isAvailable = await isUsernameAvailable(username);
    if (!isAvailable) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // Register user
    const success = await registerUser(
      {
        name: username,
        password: password,
        showpassword: password,
        question: question || null,
        answer: answer || null,
        email: email || null,
        sodienthoai: phone || '0',
      },
      request
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Registration successful',
      });
    } else {
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Registration API error:', error);

    if (error instanceof Error && error.message === 'Username already exists') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleUsernameCheck(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
    }

    const isAvailable = await isUsernameAvailable(username);

    return NextResponse.json({
      available: isAvailable,
      message: isAvailable ? 'Username is available' : 'Username already exists',
    });
  } catch (error) {
    console.error('Username check API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withAuthSecurity(handleRegisterPOST);
export const GET = withAuthSecurity(handleUsernameCheck);
