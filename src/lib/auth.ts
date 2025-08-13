import crypto from 'crypto';
import { query, Account } from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { signAccessToken, signRefreshToken, generateTokenVersion } from './jwt';
import { getClientIP } from './ip-utils';
import { NextRequest } from 'next/server';

// Hash password using MD5
export function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex');
}

// Verify password
export function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

// Login function with JWT tokens
export async function loginUser(username: string, password: string, request?: NextRequest) {
  const hashedPassword = hashPassword(password);

  const rows = (await query('web', 'SELECT * FROM account WHERE name = ? AND password = ? AND is_lock = 0', [
    username,
    hashedPassword,
  ])) as RowDataPacket[];

  if (rows.length > 0) {
    const user = rows[0] as Account;
    const tokenVersion = generateTokenVersion();

    // Update last login IP, online status, and token version
    await query(
      'web',
      'UPDATE account SET last_ip_login = ?, date_modified = NOW(), token_version = ? WHERE id = ?',
      [getClientIPFromRequest(request), tokenVersion, user.id]
    );

    const accessToken = signAccessToken({ userId: user.id!, username: user.name });
    const refreshToken = signRefreshToken({ userId: user.id!, username: user.name, tokenVersion });

    user.token_version = tokenVersion;

    return { user, accessToken, refreshToken };
  }

  return null;
}

// Register function
export async function registerUser(
  userData: {
    name: string;
    password: string;
    password2?: string;
    showpassword?: string;
    question?: string;
    answer?: string;
    email?: string;
    sodienthoai?: string;
  },
  request?: NextRequest
) {
  // Check if username exists
  const existing = (await query('web', 'SELECT id FROM account WHERE name = ?', [
    userData.name,
  ])) as RowDataPacket[];

  if (existing.length > 0) {
    throw new Error('Username already exists');
  }

  const hashedPassword = hashPassword(userData.password);
  const currentDate = new Date();

  const result = (await query(
    'web',
    `INSERT INTO account (
      name, password, password2, showpassword, question, answer, email, 
      sodienthoai, point, is_online, is_lock, backhoa, score, pin, 
      is_admin, is_refer, code_game, id_type, date_registered, 
      date_modified, created_on, modified_on, last_ip_login
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userData.name,
      hashedPassword,
      userData.password2 || null,
      userData.showpassword || userData.password,
      userData.question || null,
      userData.answer || null,
      userData.email || null,
      userData.sodienthoai || '0',
      0,
      0,
      0,
      0,
      0,
      '123456',
      0,
      0,
      '',
      'IdCard',
      currentDate,
      currentDate,
      currentDate,
      currentDate,
      getClientIPFromRequest(request),
    ]
  )) as ResultSetHeader;

  return result.affectedRows > 0;
}

// Logout function
export async function logoutUser(userId: number) {
  const newTokenVersion = generateTokenVersion();
  const result = (await query(
    'web',
    'UPDATE account SET date_modified = NOW(), token_version = ? WHERE id = ?',
    [newTokenVersion, userId]
  )) as ResultSetHeader;
  return result.affectedRows > 0;
}

// Get user by ID
export async function getUserById(id: number) {
  const rows = (await query('web', 'SELECT * FROM account WHERE id = ?', [id])) as RowDataPacket[];
  return rows.length > 0 ? (rows[0] as Account) : null;
}

// Check username availability
export async function isUsernameAvailable(username: string) {
  const rows = (await query('web', 'SELECT id FROM account WHERE name = ?', [username])) as RowDataPacket[];
  return rows.length === 0;
}

// Validate token version
export async function validateTokenVersion(userId: number, tokenVersion: number) {
  const rows = (await query('web', 'SELECT token_version FROM account WHERE id = ?', [
    userId,
  ])) as RowDataPacket[];
  return rows.length > 0 && rows[0].token_version === tokenVersion;
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string) {
  try {
    const { verifyRefreshToken } = await import('./jwt');
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) return null;

    const isValidVersion = await validateTokenVersion(payload.userId, payload.tokenVersion);
    if (!isValidVersion) return null;

    return signAccessToken({
      userId: payload.userId,
      username: payload.username,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

// Helper: get client IP
function getClientIPFromRequest(request?: NextRequest): string {
  return request ? getClientIP(request) : '127.0.0.1';
}
