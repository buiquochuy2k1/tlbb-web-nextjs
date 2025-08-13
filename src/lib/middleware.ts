import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './jwt';
import type { JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// Middleware to verify JWT token from cookies
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get token from HTTP-only cookie
      const token = req.cookies.get('access_token')?.value;

      if (!token) {
        return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 });
      }

      // Verify token
      const payload = verifyAccessToken(token);
      if (!payload) {
        return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
      }

      // Add user info to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = payload;

      return await handler(authenticatedReq);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
    }
  };
}

// Optional auth middleware (doesn't require token)
export function withOptionalAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const token = req.cookies.get('access_token')?.value;

      if (token) {
        const payload = verifyAccessToken(token);
        if (payload) {
          const authenticatedReq = req as AuthenticatedRequest;
          authenticatedReq.user = payload;
        }
      }

      return await handler(req as AuthenticatedRequest);
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      return await handler(req as AuthenticatedRequest);
    }
  };
}

// Helper function to create secure HTTP-only cookies
export function createTokenCookies(accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';

  return [
    {
      name: 'access_token',
      value: accessToken,
      options: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict' as const,
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      },
    },
    {
      name: 'refresh_token',
      value: refreshToken,
      options: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict' as const,
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      },
    },
  ];
}

// Helper function to clear auth cookies
export function clearAuthCookies() {
  return [
    {
      name: 'access_token',
      value: '',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 0,
        path: '/',
      },
    },
    {
      name: 'refresh_token',
      value: '',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 0,
        path: '/',
      },
    },
  ];
}
