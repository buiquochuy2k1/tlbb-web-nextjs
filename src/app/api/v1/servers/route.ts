import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { withApiSecurity } from '@/lib/api-security';

interface Server {
  id: number;
  name: string;
  status: string;
}

async function handleGetServers(req: NextRequest) {
  try {
    const rows = await query('web', `SELECT id, name, status FROM server ORDER BY id ASC`);

    const servers: Server[] = (rows as Server[]).map((row) => ({
      id: row.id || 0,
      name: row.name,
      status: row.status || 'offline',
    }));

    return NextResponse.json({
      success: true,
      data: servers,
    });
  } catch (error) {
    console.error('Servers API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch servers',
      },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(handleGetServers);
