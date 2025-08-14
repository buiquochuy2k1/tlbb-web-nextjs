import { NextRequest, NextResponse } from 'next/server';
import { withApiSecurity } from '@/lib/api-security';
import { query } from '@/lib/db';
import { verifyAccessToken } from '@/lib/jwt';
import { logAPIRequest, logAPIResponse } from '@/lib/logger-utils';

interface CreatePaymentRequest {
  packageId: string;
  amount: number;
  transactionCode: string;
}

async function handleCreatePayment(request: NextRequest) {
  const apiLogger = logAPIRequest(request, '/api/v1/payment/create');

  try {
    // Verify user authentication
    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) {
      apiLogger.security('Payment creation attempted without token');
      logAPIResponse(apiLogger, '/api/v1/payment/create', false, 401, { error: 'No access token' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      apiLogger.security('Payment creation attempted with invalid token');
      logAPIResponse(apiLogger, '/api/v1/payment/create', false, 401, { error: 'Invalid token' });
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;

    // Get user info
    const userRows = await query('web', 'SELECT name FROM account WHERE id = ?', [userId]);
    if (!Array.isArray(userRows) || userRows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const user = userRows[0] as { name: string };
    const username = user.name;

    const body = await request.json();
    const { packageId, amount, transactionCode }: CreatePaymentRequest = body;

    // Validate input
    if (!packageId || !amount || !transactionCode) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json({ success: false, error: 'Amount must be positive' }, { status: 400 });
    }

    // Check if transaction code already exists
    const existingRows = await query(
      'web',
      'SELECT transaction_id FROM billing_transaction_accounts WHERE transaction_code = ?',
      [transactionCode]
    );

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      return NextResponse.json({ success: false, error: 'Transaction code already exists' }, { status: 409 });
    }

    // Generate QR Code URL
    const bankId = '970422'; // MB Bank
    const accountNo = '088888666660';
    const template = 'compact2';
    const description = `TLTH ${username} ${transactionCode.split(' ')[2] || transactionCode}`;
    const accountName = 'THIEN LONG BAT BO';

    const qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(
      description
    )}&accountName=${encodeURIComponent(accountName)}`;

    // Insert transaction into database with expiration time (10 minutes)
    const insertResult = await query(
      'web',
      `INSERT INTO billing_transaction_accounts 
       (user_id, username, package, amount, status, transaction_code, qr_code_url, expires_at, created_at) 
       VALUES (?, ?, ?, ?, 'pending', ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), NOW())`,
      [userId, username, packageId, amount, transactionCode, qrCodeUrl]
    );

    return NextResponse.json({
      success: true,
      data: {
        transactionId: (insertResult as { insertId: number }).insertId,
        transactionCode,
        qrCodeUrl,
        amount,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error('❌ Create payment error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withApiSecurity(handleCreatePayment);
