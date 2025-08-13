import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { getUserById } from '@/lib/auth';
import { query } from '@/lib/db';
import { withApiSecurity } from '@/lib/api-security';

export interface UserCharacter {
  charname: string;
  level: number;
  yuanbao: number;
  exp: number;
  uipoint: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email?: string;
  is_online: boolean;
  date_registered?: Date;
  last_ip_login?: string;
  characters: UserCharacter[];
}

async function handleGetProfile(request: NextRequest) {
  try {
    // Get token from HTTP-only cookie
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get user info
    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user characters
    const characterRows = await query(
      'tlbbdb',
      `SELECT charname, level, yuanbao, exp, uipoint FROM t_char WHERE accname = ? AND charname NOT LIKE '%DELETE%' ORDER BY level DESC`,
      [user.name]
    );

    const characters: UserCharacter[] = (characterRows as UserCharacter[]).map((row) => ({
      charname: row.charname,
      level: row.level || 1,
      yuanbao: row.yuanbao || 0,
      exp: row.exp || 0,
      uipoint: row.uipoint || 0,
    }));

    // Remove sensitive information and ensure required fields
    const profile: UserProfile = {
      id: user.id!,
      name: user.name,
      email: user.email,
      is_online: user.is_online || false,
      date_registered: user.date_registered,
      last_ip_login: user.last_ip_login,
      characters,
    };

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withApiSecurity(handleGetProfile);
