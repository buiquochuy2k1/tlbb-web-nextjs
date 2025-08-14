import { NextRequest, NextResponse } from 'next/server';
import { withApiSecurity } from '@/lib/api-security';
import { verifyAccessToken } from '@/lib/jwt';
import { query } from '@/lib/db';

async function originalGET(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'No access token found',
        },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token',
        },
        { status: 401 }
      );
    }

    // Get active payment session for user
    const activeSession = (await query(
      'web',
      `SELECT 
        transaction_id,
        user_id,
        username,
        package,
        amount,
        transaction_code,
        qr_code_url,
        status,
        created_at,
        TIMESTAMPDIFF(SECOND, created_at, NOW()) as elapsed_seconds
      FROM billing_transaction_accounts 
      WHERE user_id = ? AND status = 'pending'
      ORDER BY created_at DESC 
      LIMIT 1`,
      [payload.userId]
    )) as Array<{
      transaction_id: number;
      user_id: number;
      username: string;
      package: string;
      amount: number;
      transaction_code: string;
      qr_code_url: string;
      status: string;
      created_at: string;
      elapsed_seconds: number;
    }>;

    if (activeSession.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No active payment session found',
      });
    }

    const session = activeSession[0];
    const elapsedSeconds = session.elapsed_seconds;
    const maxSessionTime = 10 * 60; // 10 minutes in seconds
    const remainingTime = Math.max(0, maxSessionTime - elapsedSeconds);

    // If session expired, mark as expired and return null
    if (remainingTime <= 0) {
      await query('web', 'UPDATE billing_transaction_accounts SET status = ? WHERE transaction_id = ?', [
        'expired',
        session.transaction_id,
      ]);

      return NextResponse.json({
        success: true,
        data: null,
        message: 'Payment session expired',
      });
    }

    // Return active session data
    return NextResponse.json({
      success: true,
      data: {
        transactionId: session.transaction_id,
        transactionCode: session.transaction_code,
        package: session.package,
        amount: session.amount,
        qrCodeUrl: session.qr_code_url,
        remainingTime: remainingTime,
        status: session.status,
        createdAt: session.created_at,
      },
    });
  } catch (error) {
    console.error('❌ Payment session error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

// Apply API security and export
export const GET = withApiSecurity(handlePaymentSession);

// Rename the function to avoid conflicts
async function handlePaymentSession(request: NextRequest) {
  return await originalGET(request);
}
