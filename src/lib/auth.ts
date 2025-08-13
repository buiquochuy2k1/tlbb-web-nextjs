import crypto from 'crypto';
import { getDbConnection, Account } from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { signAccessToken, signRefreshToken, generateTokenVersion } from './jwt';

// Hash password using MD5 (to match your existing data)
export function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex');
}

// Verify password
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const hash = hashPassword(password);
  return hash === hashedPassword;
}

// Login function with JWT tokens
export async function loginUser(
  username: string,
  password: string
): Promise<{
  user: Account;
  accessToken: string;
  refreshToken: string;
} | null> {
  try {
    const connection = await getDbConnection();
    const hashedPassword = hashPassword(password);

    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM account WHERE name = ? AND password = ? AND is_lock = 0',
      [username, hashedPassword]
    );

    if (rows.length > 0) {
      const user = rows[0] as Account;
      const tokenVersion = generateTokenVersion();

      // Update last login IP, online status, and token version
      // This will invalidate all previous tokens by updating token_version
      await connection.execute(
        'UPDATE account SET last_ip_login = ?, date_modified = NOW(), token_version = ? WHERE id = ?',
        [getClientIP(), tokenVersion, user.id]
      );

      // Generate JWT tokens
      const accessToken = signAccessToken({
        userId: user.id!,
        username: user.name,
      });

      const refreshToken = signRefreshToken({
        userId: user.id!,
        username: user.name,
        tokenVersion,
      });

      // Update user object with new token version
      user.token_version = tokenVersion;

      return {
        user,
        accessToken,
        refreshToken,
      };
    }

    return null;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Login failed');
  }
}

// Register function
export async function registerUser(userData: {
  name: string;
  password: string;
  password2?: string;
  showpassword?: string;
  question?: string;
  answer?: string;
  email?: string;
  sodienthoai?: string;
}): Promise<boolean> {
  try {
    const connection = await getDbConnection();

    // Check if username already exists
    const [existingUsers] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM account WHERE name = ?',
      [userData.name]
    );

    if (existingUsers.length > 0) {
      throw new Error('Username already exists');
    }

    const hashedPassword = hashPassword(userData.password);
    const currentDate = new Date();

    // Insert new user with default values
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO account (
        name, password, password2, showpassword, question, answer, email, 
        sodienthoai, point, is_online, is_lock, backhoa, score, pin, 
        is_admin, is_refer, code_game, id_type, date_registered, 
        date_modified, created_on, modified_on
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.name,
        hashedPassword,
        userData.password2 || null,
        userData.showpassword || userData.password,
        userData.question || null,
        userData.answer || null,
        userData.email || null,
        userData.sodienthoai || '0',
        0, // point
        0, // is_online
        0, // is_lock
        0, // backhoa
        0, // score
        '123456', // pin
        0, // is_admin
        0, // is_refer
        '', // code_game
        'IdCard', // id_type
        currentDate, // date_registered
        currentDate, // date_modified
        currentDate, // created_on
        currentDate, // modified_on
      ]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(error instanceof Error ? error.message : 'Registration failed');
  }
}

// Logout function - invalidate tokens
export async function logoutUser(userId: number): Promise<boolean> {
  try {
    const connection = await getDbConnection();
    const newTokenVersion = generateTokenVersion();

    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE account SET date_modified = NOW(), token_version = ? WHERE id = ?',
      [newTokenVersion, userId]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

// Get user by ID
export async function getUserById(id: number): Promise<Account | null> {
  try {
    const connection = await getDbConnection();

    const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM account WHERE id = ?', [id]);

    if (rows.length > 0) {
      return rows[0] as Account;
    }

    return null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Helper function to get client IP (you'll need to implement this based on your setup)
function getClientIP(): string {
  // This is a placeholder - you'll need to get the actual client IP
  return '127.0.0.1';
}

// Check if username is available
export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const connection = await getDbConnection();

    const [rows] = await connection.execute<RowDataPacket[]>('SELECT id FROM account WHERE name = ?', [
      username,
    ]);

    return rows.length === 0;
  } catch (error) {
    console.error('Username check error:', error);
    return false;
  }
}

// Validate token version (for refresh token security)
export async function validateTokenVersion(userId: number, tokenVersion: number): Promise<boolean> {
  try {
    const connection = await getDbConnection();

    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT token_version FROM account WHERE id = ?',
      [userId]
    );

    if (rows.length > 0) {
      const currentTokenVersion = rows[0].token_version;
      return currentTokenVersion === tokenVersion;
    }

    return false;
  } catch (error) {
    console.error('Token version validation error:', error);
    return false;
  }
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const { verifyRefreshToken } = await import('./jwt');
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return null;
    }

    // Validate token version
    const isValidVersion = await validateTokenVersion(payload.userId, payload.tokenVersion);
    if (!isValidVersion) {
      return null;
    }

    // Generate new access token
    const newAccessToken = signAccessToken({
      userId: payload.userId,
      username: payload.username,
    });

    return newAccessToken;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}
