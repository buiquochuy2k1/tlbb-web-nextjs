import { NextRequest, NextResponse } from 'next/server';

// Internal API key for server-to-server communication (server-only)
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'tlbb-internal-key-2050';

// Client-side API key (can be public, less secure but functional)
const CLIENT_API_KEY = process.env.NEXT_PUBLIC_CLIENT_API_KEY || 'tlbb-client-key-2050';

// Allowed origins for API access
const getAllowedOrigins = () => {
  const origins = ['http://localhost:3000', 'https://localhost:3000'];

  // Add custom domain if specified
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  return origins;
};

const ALLOWED_ORIGINS = getAllowedOrigins();

/**
 * Middleware to protect internal APIs from external access
 */
export function withApiSecurity(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Check 1: Verify API key (accept both internal and client keys)
      const apiKey = req.headers.get('x-api-key');
      const isValidApiKey = apiKey && (apiKey === INTERNAL_API_KEY || apiKey === CLIENT_API_KEY);

      if (!isValidApiKey) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized access',
          },
          { status: 401 }
        );
      }

      // Check 2: Verify origin/referer (more lenient for development)
      const origin = req.headers.get('origin');
      const referer = req.headers.get('referer');

      // In development, be more lenient
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (isDevelopment) {
        // Allow localhost origins in development
        const isLocalhost = origin?.includes('localhost') || referer?.includes('localhost');
        if (!isLocalhost && origin && referer) {
          const isValidOrigin = ALLOWED_ORIGINS.some(
            (allowedOrigin) => origin === allowedOrigin || origin.startsWith(allowedOrigin)
          );
          const isValidReferer = ALLOWED_ORIGINS.some((allowedOrigin) => referer.startsWith(allowedOrigin));

          if (!isValidOrigin && !isValidReferer) {
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid origin',
              },
              { status: 403 }
            );
          }
        }
      } else {
        // Production - stricter validation
        const isValidOrigin =
          origin &&
          ALLOWED_ORIGINS.some(
            (allowedOrigin) => origin === allowedOrigin || origin.startsWith(allowedOrigin)
          );
        const isValidReferer =
          referer && ALLOWED_ORIGINS.some((allowedOrigin) => referer.startsWith(allowedOrigin));

        if (!isValidOrigin && !isValidReferer) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid origin',
            },
            { status: 403 }
          );
        }
      }

      // Check 3: Rate limiting (simple implementation)
      const userAgent = req.headers.get('user-agent') || '';
      const isBot = /bot|crawler|spider|scraper/i.test(userAgent);

      if (isBot) {
        return NextResponse.json(
          {
            success: false,
            error: 'Access denied',
          },
          { status: 403 }
        );
      }

      // All checks passed, proceed to handler
      return await handler(req);
    } catch (error) {
      console.error('API Security Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Client-side function to create secure headers for API calls
 */
export function createSecureHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-api-key': CLIENT_API_KEY, // Use client API key for frontend
    'x-requested-with': 'XMLHttpRequest',
  };
}

/**
 * Secure fetch wrapper for internal API calls
 */
export async function secureFetch(url: string, options: RequestInit = {}) {
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      ...createSecureHeaders(),
      ...options.headers,
    },
  };

  return fetch(url, secureOptions);
}

// Rate limiting storage (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

/**
 * Advanced security for auth APIs with anti-spam protection
 */
export function withAuthSecurity(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Check 1: API Key (accept both internal and client keys)
      const apiKey = req.headers.get('x-api-key');
      const isValidApiKey = apiKey && (apiKey === INTERNAL_API_KEY || apiKey === CLIENT_API_KEY);

      if (!isValidApiKey) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized access',
          },
          { status: 401 }
        );
      }

      // Check 2: Origin/Referer validation
      const origin = req.headers.get('origin');
      const referer = req.headers.get('referer');

      const isValidOrigin =
        origin &&
        ALLOWED_ORIGINS.some((allowedOrigin) => origin === allowedOrigin || origin.startsWith(allowedOrigin));

      const isValidReferer =
        referer && ALLOWED_ORIGINS.some((allowedOrigin) => referer.startsWith(allowedOrigin));

      if (!isValidOrigin && !isValidReferer) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid origin',
          },
          { status: 403 }
        );
      }

      // Check 3: Enhanced Bot Detection
      const userAgent = req.headers.get('user-agent') || '';
      const isBot = /bot|crawler|spider|scraper|curl|wget|postman|insomnia/i.test(userAgent);

      if (isBot) {
        return NextResponse.json(
          {
            success: false,
            error: 'Access denied',
          },
          { status: 403 }
        );
      }

      // Check 4: Rate Limiting by IP
      const clientIP = getClientIPForRateLimit(req);
      const now = Date.now();
      const windowMs = 15 * 60 * 1000; // 15 minutes
      const maxRequests = 5; // Max 5 requests per 15 minutes per IP

      const rateLimitKey = `auth_${clientIP}`;
      const rateLimitData = rateLimitMap.get(rateLimitKey);

      if (rateLimitData) {
        if (now - rateLimitData.lastReset > windowMs) {
          // Reset window
          rateLimitMap.set(rateLimitKey, { count: 1, lastReset: now });
        } else {
          if (rateLimitData.count >= maxRequests) {
            return NextResponse.json(
              {
                success: false,
                error: 'Too many requests. Please try again later.',
              },
              { status: 429 }
            );
          }
          rateLimitData.count++;
        }
      } else {
        rateLimitMap.set(rateLimitKey, { count: 1, lastReset: now });
      }

      // Check 5: Request size validation
      const contentLength = req.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 10000) {
        // Max 10KB request
        return NextResponse.json(
          {
            success: false,
            error: 'Request too large',
          },
          { status: 413 }
        );
      }

      // Check 6: Timing Attack Protection (add small delay)
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50));

      // All checks passed
      return await handler(req);
    } catch (error) {
      console.error('Auth API Security Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Get client IP for rate limiting
 */
function getClientIPForRateLimit(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfIP = req.headers.get('cf-connecting-ip');

  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  if (cfIP) return cfIP;

  return 'unknown';
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimit() {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;

  for (const [key, data] of rateLimitMap.entries()) {
    if (now - data.lastReset > windowMs) {
      rateLimitMap.delete(key);
    }
  }
}

// Auto cleanup every 30 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimit, 30 * 60 * 1000);
}
