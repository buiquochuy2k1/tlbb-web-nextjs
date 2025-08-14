import { NextRequest, NextResponse } from 'next/server';
import { getValidApiKeys, addApiKey, removeApiKey } from '@/lib/api-keys';
import { logAPIRequest, logAPIResponse } from '@/lib/logger-utils';
import { verifyAccessToken } from '@/lib/jwt';

// Admin user IDs who can manage API keys
const ADMIN_USER_IDS = [1, 2, 3]; // Add your admin user IDs here

export async function GET(request: NextRequest) {
  const apiLogger = logAPIRequest(request, '/api/v1/admin/api-keys');
  
  try {
    // Verify admin authentication
    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) {
      apiLogger.security('Admin API accessed without token');
      logAPIResponse(apiLogger, '/api/v1/admin/api-keys', false, 401, { error: 'Unauthorized' });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload || !ADMIN_USER_IDS.includes(payload.userId)) {
      apiLogger.security('Non-admin user attempted to access API keys management', { userId: payload?.userId });
      logAPIResponse(apiLogger, '/api/v1/admin/api-keys', false, 403, { error: 'Forbidden' });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKeys = getValidApiKeys();
    
    apiLogger.info('ADMIN', 'API keys list retrieved', { userId: payload.userId, keyCount: apiKeys.length });
    logAPIResponse(apiLogger, '/api/v1/admin/api-keys', true, 200, { keyCount: apiKeys.length });

    return NextResponse.json({
      success: true,
      data: {
        apiKeys: apiKeys.map(key => key.substring(0, 8) + '...'), // Only show first 8 chars for security
        count: apiKeys.length
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    apiLogger.error('ADMIN', 'Failed to get API keys', { error: errorMessage });
    logAPIResponse(apiLogger, '/api/v1/admin/api-keys', false, 500, { error: errorMessage });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const apiLogger = logAPIRequest(request, '/api/v1/admin/api-keys');
  
  try {
    // Verify admin authentication
    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) {
      apiLogger.security('Admin API accessed without token');
      logAPIResponse(apiLogger, '/api/v1/admin/api-keys', false, 401, { error: 'Unauthorized' });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload || !ADMIN_USER_IDS.includes(payload.userId)) {
      apiLogger.security('Non-admin user attempted to add API key', { userId: payload?.userId });
      logAPIResponse(apiLogger, '/api/v1/admin/api-keys', false, 403, { error: 'Forbidden' });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      apiLogger.warn('ADMIN', 'Invalid API key format provided', { userId: payload.userId });
      logAPIResponse(apiLogger, '/api/v1/admin/api-keys', false, 400, { error: 'Invalid API key' });
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
    }

    const success = addApiKey(apiKey);
    
    if (success) {
      apiLogger.success('ADMIN', 'API key added successfully', { userId: payload.userId });
      logAPIResponse(apiLogger, '/api/v1/admin/api-keys', true, 200, { action: 'add' });
      
      return NextResponse.json({
        success: true,
        message: 'API key added successfully'
      });
    } else {
      apiLogger.warn('ADMIN', 'API key already exists', { userId: payload.userId });
      logAPIResponse(apiLogger, '/api/v1/admin/api-keys', false, 409, { error: 'API key already exists' });
      
      return NextResponse.json({ error: 'API key already exists' }, { status: 409 });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    apiLogger.error('ADMIN', 'Failed to add API key', { error: errorMessage });
    logAPIResponse(apiLogger, '/api/v1/admin/api-keys', false, 500, { error: errorMessage });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const apiLogger = logAPIRequest(request, '/api/v1/admin/api-keys');
  
  try {
    // Verify admin authentication
    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) {
      apiLogger.security('Admin API accessed without token');
      logAPIResponse(apiLogger, '/api/v1/admin/api-keys', false, 401, { error: 'Unauthorized' });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload || !ADMIN_USER_IDS.includes(payload.userId)) {
      apiLogger.security('Non-admin user attempted to remove API key', { userId: payload?.userId });
      logAPIResponse(apiLogger, '/api/v1/admin/api-keys', false, 403, { error: 'Forbidden' });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      apiLogger.warn('ADMIN', 'Invalid API key format provided for deletion', { userId: payload.userId });
      logAPIResponse(apiLogger, '/api/v1/admin/api-keys', false, 400, { error: 'Invalid API key' });
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
    }

    const success = removeApiKey(apiKey);
    
    if (success) {
      apiLogger.success('ADMIN', 'API key removed successfully', { userId: payload.userId });
      logAPIResponse(apiLogger, '/api/v1/admin/api-keys', true, 200, { action: 'remove' });
      
      return NextResponse.json({
        success: true,
        message: 'API key removed successfully'
      });
    } else {
      apiLogger.warn('ADMIN', 'API key not found for deletion', { userId: payload.userId });
      logAPIResponse(apiLogger, '/api/v1/admin/api-keys', false, 404, { error: 'API key not found' });
      
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    apiLogger.error('ADMIN', 'Failed to remove API key', { error: errorMessage });
    logAPIResponse(apiLogger, '/api/v1/admin/api-keys', false, 500, { error: errorMessage });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
