import { NextRequest, NextResponse } from 'next/server';
import { logAPIRequest, logAPIResponse } from '@/lib/logger-utils';

// Webhook URLs from environment variables
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function GET(request: NextRequest) {
  const apiLogger = logAPIRequest(request, '/api/v1/webhook-status');

  try {
    const status = {
      discord: {
        configured: !!DISCORD_WEBHOOK_URL,
        url: DISCORD_WEBHOOK_URL ? DISCORD_WEBHOOK_URL.substring(0, 50) + '...' : null,
        status: 'unknown',
      },
      telegram: {
        configured: !!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
        botToken: TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.substring(0, 10) + '...' : null,
        chatId: TELEGRAM_CHAT_ID || null,
        status: 'unknown',
      },
      timestamp: new Date().toISOString(),
    };

    // Test Discord webhook if configured
    if (DISCORD_WEBHOOK_URL) {
      try {
        const testResponse = await fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            embeds: [
              {
                title: 'Webhook Status Test',
                description: 'Testing webhook connectivity',
                color: 0x0099ff,
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });

        status.discord.status = testResponse.ok ? 'connected' : 'error';
      } catch (error) {
        status.discord.status = 'error';
      }
    }

    // Test Telegram bot if configured
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`;
        const testResponse = await fetch(telegramApiUrl);

        if (testResponse.ok) {
          const botInfo = await testResponse.json();
          status.telegram.status = botInfo.ok ? 'connected' : 'error';
        } else {
          status.telegram.status = 'error';
        }
      } catch (error) {
        status.telegram.status = 'error';
      }
    }

    apiLogger.info('WEBHOOK', 'Webhook status checked', status);
    logAPIResponse(apiLogger, '/api/v1/webhook-status', true, 200, status);

    return NextResponse.json({
      success: true,
      message: 'Webhook status retrieved',
      data: status,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    apiLogger.error('WEBHOOK', 'Failed to check webhook status', { error: errorMessage });
    logAPIResponse(apiLogger, '/api/v1/webhook-status', false, 500, { error: errorMessage });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
