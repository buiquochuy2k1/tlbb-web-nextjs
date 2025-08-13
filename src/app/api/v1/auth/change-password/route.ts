import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { getUserById } from '@/lib/auth';
import { getDbConnection } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Get token from HTTP-only cookie
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get request body
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vui lòng điền đầy đủ thông tin',
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mật khẩu mới phải có ít nhất 6 ký tự',
        },
        { status: 400 }
      );
    }

    // Get user info
    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Verify current password (MD5 hash)
    const currentPasswordHash = crypto.createHash('md5').update(currentPassword).digest('hex');
    if (user.password !== currentPasswordHash) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mật khẩu hiện tại không đúng',
        },
        { status: 400 }
      );
    }

    // Check if new password is different from current
    const newPasswordHash = crypto.createHash('md5').update(newPassword).digest('hex');
    if (currentPasswordHash === newPasswordHash) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mật khẩu mới phải khác mật khẩu hiện tại',
        },
        { status: 400 }
      );
    }

    // Update password in database
    const connection = await getDbConnection();
    await connection.execute('UPDATE account SET password = ?, date_modified = NOW() WHERE id = ?', [
      newPasswordHash,
      user.id,
    ]);

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    console.error('Change password API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Có lỗi xảy ra, vui lòng thử lại',
      },
      { status: 500 }
    );
  }
}
