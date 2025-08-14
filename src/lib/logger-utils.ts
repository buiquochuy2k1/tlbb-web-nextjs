import { NextRequest } from 'next/server';
import { logger } from './logger';
import { verifyAccessToken } from './jwt';
import { getClientIP } from './ip-utils';

/**
 * Extract user ID from request (if authenticated)
 */
export function getUserIdFromRequest(request: NextRequest): number | undefined {
  try {
    const token = request.cookies.get('access_token')?.value;
    if (!token) return undefined;

    const payload = verifyAccessToken(token);
    return payload?.userId;
  } catch {
    return undefined;
  }
}

/**
 * Get client IP from request
 */
export function getClientIPFromRequest(request: NextRequest): string | undefined {
  try {
    return getClientIP(request);
  } catch {
    return undefined;
  }
}

/**
 * Create a logger context for API routes
 */
export function createAPILogger(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  const clientIP = getClientIPFromRequest(request);

  return {
    debug: (category: string, message: string, data?: unknown) =>
      logger.debug(category, message, data, userId, clientIP),

    info: (category: string, message: string, data?: unknown) =>
      logger.info(category, message, data, userId, clientIP),

    warn: (category: string, message: string, data?: unknown) =>
      logger.warn(category, message, data, userId, clientIP),

    error: (category: string, message: string, data?: unknown) =>
      logger.error(category, message, data, userId, clientIP),

    success: (category: string, message: string, data?: unknown) =>
      logger.success(category, message, data, userId, clientIP),

    // Specific methods
    auth: (message: string, data?: unknown) => logger.auth(message, data, userId, clientIP),

    payment: (message: string, data?: unknown) => logger.payment(message, data, userId, clientIP),

    api: (message: string, data?: unknown) => logger.api(message, data, userId, clientIP),

    security: (message: string, data?: unknown) => logger.security(message, data, userId, clientIP),

    database: (message: string, data?: unknown) => logger.database(message, data, userId, clientIP),
  };
}

/**
 * Log API request start
 */
export function logAPIRequest(request: NextRequest, endpoint: string) {
  const apiLogger = createAPILogger(request);
  apiLogger.api(`${request.method} ${endpoint} - Request started`, {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
  });
  return apiLogger;
}

/**
 * Log API response
 */
export function logAPIResponse(
  apiLogger: ReturnType<typeof createAPILogger>,
  endpoint: string,
  success: boolean,
  statusCode: number,
  data?: unknown
) {
  const message = `${endpoint} - ${success ? 'Success' : 'Failed'} (${statusCode})`;

  if (success) {
    apiLogger.success('API', message, data);
  } else {
    apiLogger.error('API', message, data);
  }
}

/**
 * Simple logger for non-API contexts
 */
export function createSimpleLogger(userId?: number, ip?: string) {
  return {
    debug: (category: string, message: string, data?: unknown) =>
      logger.debug(category, message, data, userId, ip),

    info: (category: string, message: string, data?: unknown) =>
      logger.info(category, message, data, userId, ip),

    warn: (category: string, message: string, data?: unknown) =>
      logger.warn(category, message, data, userId, ip),

    error: (category: string, message: string, data?: unknown) =>
      logger.error(category, message, data, userId, ip),

    success: (category: string, message: string, data?: unknown) =>
      logger.success(category, message, data, userId, ip),

    auth: (message: string, data?: unknown) => logger.auth(message, data, userId, ip),

    payment: (message: string, data?: unknown) => logger.payment(message, data, userId, ip),

    security: (message: string, data?: unknown) => logger.security(message, data, userId, ip),
  };
}
