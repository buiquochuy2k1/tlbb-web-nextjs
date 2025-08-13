import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withApiSecurity } from '@/lib/api-security';

export interface RankingPlayer {
  rank: number;
  charname: string;
  level: number;
}

async function handleGetRankings(req: NextRequest) {
  try {
    const rows = await query(
      'tlbbdb',
      `SELECT charname, level FROM t_char WHERE charname NOT LIKE '%DELETE%' ORDER BY level DESC LIMIT 50`
    );

    // Add rank numbers to the results
    const rankings: RankingPlayer[] = (rows as RankingPlayer[]).map((row, index) => ({
      rank: index + 1,
      charname: row.charname,
      level: row.level || 0,
    }));

    return NextResponse.json({
      success: true,
      data: rankings,
    });
  } catch (error) {
    console.error('Rankings API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch rankings' }, { status: 500 });
  }
}

export const GET = withApiSecurity(handleGetRankings);
