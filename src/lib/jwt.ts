import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production';

export interface JWTPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: number;
  username: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

// Sign access token (expires in 15 minutes)
export function signAccessToken(payload: { userId: number; username: string }): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'tlbb-app',
    audience: 'tlbb-users',
  });
}

// Sign refresh token (expires in 7 days)
export function signRefreshToken(payload: {
  userId: number;
  username: string;
  tokenVersion: number;
}): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    issuer: 'tlbb-app',
    audience: 'tlbb-users',
  });
}

// Verify access token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'tlbb-app',
      audience: 'tlbb-users',
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Access token verification failed:', error);
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'tlbb-app',
      audience: 'tlbb-users',
    }) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

// Generate token version (for refresh token invalidation)
export function generateTokenVersion(): number {
  return Math.floor(Date.now() / 1000);
}
