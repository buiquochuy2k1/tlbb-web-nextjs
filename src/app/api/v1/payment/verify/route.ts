import { NextRequest, NextResponse } from 'next/server';
import { withApiSecurity } from '@/lib/api-security';
import { query } from '@/lib/db';
import { verifyAccessToken } from '@/lib/jwt';
import { logAPIRequest, logAPIResponse } from '@/lib/logger-utils';

interface MBBankTransaction {
  postDate: string;
  transactionDate: string;
  accountNumber: string;
  creditAmount: string;
  debitAmount: string;
  transactionCurrency: string;
  transactionDesc: string;
  balanceAvailable: string;
  refNo: string;
  toAccountName: string;
  toBank: string;
  toAccountNumber: string;
  type: string;
}

interface VerifyPaymentRequest {
  transactionCode: string;
}

async function handleVerifyPayment(request: NextRequest) {
  const apiLogger = logAPIRequest(request, '/api/v1/payment/verify');

  try {
    // Verify user authentication
    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) {
      apiLogger.security('Payment verification attempted without token');
      logAPIResponse(apiLogger, '/api/v1/payment/verify', false, 401, { error: 'No access token' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;
    const body = await request.json();
    const { transactionCode }: VerifyPaymentRequest = body;

    if (!transactionCode) {
      return NextResponse.json({ success: false, error: 'Transaction code is required' }, { status: 400 });
    }

    // Get transaction from our database
    const transactionRows = await query(
      'web',
      'SELECT * FROM billing_transaction_accounts WHERE transaction_code = ? AND user_id = ? AND status = "pending"',
      [transactionCode, userId]
    );

    if (!Array.isArray(transactionRows) || transactionRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found or already processed' },
        { status: 404 }
      );
    }

    const transaction = transactionRows[0] as {
      user_id: number;
      username: string;
      package: string;
      amount: string;
      status: string;
      transaction_code: string;
      created_at: string;
    };

    console.log('🔍 Verifying transaction:', {
      transactionCode,
      amount: transaction.amount,
      userId,
    });

    // Call MB Bank API to get transaction history
    const mbBankApiUrl = process.env.MB_BANK_API_URL;

    if (!mbBankApiUrl) {
      apiLogger.error('PAYMENT', 'MB Bank API URL is not set');
      logAPIResponse(apiLogger, '/api/v1/payment/verify', false, 500, {
        error: 'MB Bank API URL is not set',
      });
      return NextResponse.json({ success: false, error: 'MB Bank API URL is not set' }, { status: 500 });
    }

    try {
      const mbResponse = await fetch(mbBankApiUrl);
      if (!mbResponse.ok) {
        throw new Error(`MB Bank API error: ${mbResponse.status}`);
      }

      const mbTransactions: MBBankTransaction[] = await mbResponse.json();
      console.log('📊 MB Bank transactions received:', mbTransactions.length);

      // Extract transaction code from our format: "TLTH username 167469704"
      const codeMatch = transactionCode.match(/TLTH\s+\w+\s+(\d+)/);
      const searchCode = codeMatch ? codeMatch[1] : transactionCode;

      console.log('🔍 Searching for code:', searchCode, 'in transaction descriptions');

      // Find matching transaction in MB Bank data
      const matchingTransaction = mbTransactions.find((mbTx) => {
        // Check if transaction description contains our code
        const descContainsCode = mbTx.transactionDesc.includes(searchCode);
        // Check if amount matches (convert string to number for comparison)
        const amountMatches = parseFloat(mbTx.creditAmount) === parseFloat(transaction.amount);

        console.log('🔍 Checking MB transaction:', {
          desc: mbTx.transactionDesc,
          creditAmount: mbTx.creditAmount,
          descContainsCode,
          amountMatches,
        });

        return descContainsCode && amountMatches && parseFloat(mbTx.creditAmount) > 0;
      });

      if (!matchingTransaction) {
        return NextResponse.json({
          success: false,
          error: 'Payment not found in bank records',
          debug: {
            searchCode,
            expectedAmount: transaction.amount,
            mbTransactionsCount: mbTransactions.length,
          },
        });
      }

      // Payment verified! Update transaction status
      await query(
        'web',
        'UPDATE billing_transaction_accounts SET status = "completed", verified_at = NOW(), bank_transaction_id = ? WHERE transaction_code = ? AND user_id = ?',
        [matchingTransaction.refNo, transactionCode, userId]
      );

      // Get package info from database
      const packageRows = (await query(
        'web',
        'SELECT silver_amount, bonus_silver, package_name FROM billing_package WHERE package_code = ? AND is_active = 1',
        [transaction.package]
      )) as Array<{
        silver_amount: number;
        bonus_silver: number;
        package_name: string;
      }>;

      // Get package info or fallback to amount-based calculation
      const packageInfo =
        packageRows.length > 0
          ? {
              silver: packageRows[0].silver_amount,
              bonus: packageRows[0].bonus_silver,
              name: packageRows[0].package_name,
            }
          : {
              silver: Math.floor(parseInt(transaction.amount) / 100), // 100 VND = 1 silver as fallback
              bonus: 0,
              name: transaction.package,
            };

      const silverToAdd = packageInfo.silver + packageInfo.bonus; // Include bonus silver

      // Add silver to user account (using point field to store silver)
      await query('web', 'UPDATE account SET point = point + ? WHERE id = ?', [silverToAdd, userId]);

      apiLogger.payment('Silver added to user account', {
        userId,
        package: transaction.package,
        silverAdded: silverToAdd,
        baseSilver: packageInfo.silver,
        bonusSilver: packageInfo.bonus,
        transactionAmount: transaction.amount,
        transactionCode,
      });

      const responseData = {
        transactionCode,
        amount: matchingTransaction.creditAmount,
        bankRefNo: matchingTransaction.refNo,
        package: transaction.package,
        silverAdded: silverToAdd,
        baseSilver: packageInfo.silver,
        bonusSilver: packageInfo.bonus,
        verifiedAt: new Date().toISOString(),
      };

      apiLogger.success('PAYMENT', 'Payment verified successfully', {
        transactionCode,
        bankRefNo: matchingTransaction.refNo,
        silverAdded: silverToAdd,
      });

      logAPIResponse(apiLogger, '/api/v1/payment/verify', true, 200, responseData);

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        data: responseData,
      });
    } catch (mbError) {
      apiLogger.error('PAYMENT', 'MB Bank API error during verification', { error: mbError });
      logAPIResponse(apiLogger, '/api/v1/payment/verify', false, 500, { error: 'MB Bank API error' });

      return NextResponse.json(
        {
          success: false,
          error: 'Unable to verify payment with bank. Please try again later.',
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    apiLogger.error('PAYMENT', 'Payment verification failed', { error });
    logAPIResponse(apiLogger, '/api/v1/payment/verify', false, 500, { error: 'Internal server error' });

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withApiSecurity(handleVerifyPayment);
