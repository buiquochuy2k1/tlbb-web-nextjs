import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withApiSecurity } from '@/lib/api-security';

export interface Tag {
  tag_id: number;
  tag_name: string;
  tag_slug: string;
  tag_count: number;
}

async function handleGetTags(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    let whereClause = 'WHERE tag_count > 0';
    const queryParams: (string | number)[] = [];

    if (search) {
      whereClause += ' AND tag_name LIKE ?';
      queryParams.push(`%${search}%`);
    }

    const tagsQuery = `
      SELECT * FROM article_tags 
      ${whereClause}
      ORDER BY tag_count DESC, tag_name ASC
      LIMIT ?
    `;

    queryParams.push(limit);
    const rows = await query('web', tagsQuery, queryParams);
    const tags = rows as Tag[];

    return NextResponse.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error('Tags API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tags',
      },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(handleGetTags);
