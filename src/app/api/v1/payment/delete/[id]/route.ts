import { NextRequest, NextResponse } from 'next/server';
import { withApiSecurity } from '@/lib/api-security';
import { query } from '@/lib/db';
import { verifyAccessToken } from '@/lib/jwt';
import { logAPIRequest, logAPIResponse } from '@/lib/logger-utils';

async function handleDeletePayment(request: NextRequest, { params }: { params: { id: string } }) {
  const apiLogger = logAPIRequest(request, '/api/v1/payment/delete');

  try {
    // Verify user authentication
    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) {
      apiLogger.security('Payment deletion attempted without token');
      logAPIResponse(apiLogger, '/api/v1/payment/delete', false, 401, { error: 'No access token' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;
    const transactionCode = decodeURIComponent(params.id); // Decode URL-encoded transaction code

    // Check if transaction exists and belongs to user
    const transactionRows = await query(
      'web',
      'SELECT user_id, status, transaction_code FROM billing_transaction_accounts WHERE transaction_code = ? AND user_id = ?',
      [transactionCode, userId]
    );

    if (!Array.isArray(transactionRows) || transactionRows.length === 0) {
      // Transaction not found - maybe already deleted or expired
      return NextResponse.json({
        success: true,
        message: 'Transaction already deleted or not found',
      });
    }

    const transaction = transactionRows[0] as { user_id: number; status: string; transaction_code: string };

    // Allow deletion of completed transactions for cleanup purposes
    // Only prevent deletion if transaction is being processed
    if (transaction.status === 'processing') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete transaction being processed' },
        { status: 400 }
      );
    }

    // Delete the transaction

    await query(
      'web',
      'DELETE FROM billing_transaction_accounts WHERE transaction_code = ? AND user_id = ?',
      [transactionCode, userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error: unknown) {
    console.error('❌ Delete payment error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const DELETE = withApiSecurity(async (request: NextRequest) => {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop() || '';
  return handleDeletePayment(request, { params: { id } });
});
