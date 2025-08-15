import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withApiSecurity } from '@/lib/api-security';

export interface Category {
  cat_id: number;
  cat_name: string;
  cat_slug: string;
  cat_color: string;
  cat_icon: string;
  cat_order: number;
  cat_status: number;
  article_count?: number;
}

async function handleGetCategories(req: NextRequest) {
  try {
    // Get categories with article count
    const categoriesQuery = `
      SELECT 
        c.*,
        COUNT(a.ar_id) as article_count
      FROM article_categories c
      LEFT JOIN article a ON c.cat_id = a.ar_type AND a.ar_status = 1
      WHERE c.cat_status = 1
      GROUP BY c.cat_id
      ORDER BY c.cat_order ASC, c.cat_name ASC
    `;

    const rows = await query('web', categoriesQuery);
    const categories = rows as Category[];

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(handleGetCategories);
