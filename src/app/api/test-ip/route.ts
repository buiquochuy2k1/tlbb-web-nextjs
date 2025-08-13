import { NextRequest, NextResponse } from 'next/server';
import { getClientIP, isPrivateIP, isValidIPv4 } from '@/lib/ip-utils';

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const isPrivate = isPrivateIP(clientIP);

    // Get all relevant headers for debugging
    const headers = {
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
      'x-real-ip': request.headers.get('x-real-ip'),
      'x-client-ip': request.headers.get('x-client-ip'),
      'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
      'x-vercel-forwarded-for': request.headers.get('x-vercel-forwarded-for'),
      'user-agent': request.headers.get('user-agent'),
      host: request.headers.get('host'),
    };

    return NextResponse.json({
      success: true,
      data: {
        detectedIP: clientIP,
        isIPv4: isValidIPv4(clientIP),
        isPrivateIP: isPrivate,
        ipType: isPrivate ? 'Private IPv4' : 'Public IPv4',
        headers: headers,
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('IP test API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
