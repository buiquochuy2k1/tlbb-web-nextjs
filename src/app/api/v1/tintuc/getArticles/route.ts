import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withApiSecurity } from '@/lib/api-security';

export interface Article {
  ar_id: number;
  ar_title: string;
  ar_img: string;
  ar_des: string;
  ar_content: string;
  ar_slug: string;
  ar_type: number;
  ar_time: number;
  ar_by: number;
  ar_views: number;
  ar_featured: boolean;
  ar_status: number;
  ar_meta_keywords?: string;
  ar_meta_description?: string;
  ar_updated_at?: number;
  ar_order: number;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
  author_name?: string;
  tags?: string[];
}

export interface ArticleResponse {
  success: boolean;
  data?: Article[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

async function handleGetArticles(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') || '';
    const status = searchParams.get('status') || '1';

    // Build WHERE clause
    const whereConditions = [`a.ar_status = ?`];
    const queryParams: (string | number)[] = [parseInt(status)];

    if (category && category !== 'all') {
      whereConditions.push(`c.cat_slug = ?`);
      queryParams.push(category);
    }

    if (search) {
      whereConditions.push(`(a.ar_title LIKE ? OR a.ar_des LIKE ?)`);
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (featured && featured === 'true') {
      whereConditions.push(`a.ar_featured = 1`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM article a
      LEFT JOIN article_categories c ON a.ar_type = c.cat_id
      WHERE ${whereClause}
    `;

    const countResult = await query('web', countQuery, queryParams);
    const total = (countResult as { total: number }[])[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Get articles with pagination
    const articlesQuery = `
      SELECT 
        a.*,
        c.cat_name as category_name,
        c.cat_color as category_color,
        c.cat_icon as category_icon,
        u.name as author_name
      FROM article a
      LEFT JOIN article_categories c ON a.ar_type = c.cat_id  
      LEFT JOIN account u ON a.ar_by = u.id
      WHERE ${whereClause}
      ORDER BY 
        CASE WHEN a.ar_featured = 1 THEN 0 ELSE 1 END,
        a.ar_order ASC,
        a.ar_time DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);
    const rows = await query('web', articlesQuery, queryParams);
    const articles = rows as Article[];

    // Get tags for each article
    for (const article of articles) {
      const tagsQuery = `
        SELECT t.tag_name 
        FROM article_tags t
        INNER JOIN article_tag_relations r ON t.tag_id = r.tag_id
        WHERE r.ar_id = ?
      `;
      const tagRows = await query('web', tagsQuery, [article.ar_id]);
      article.tags = (tagRows as { tag_name: string }[]).map((row) => row.tag_name);
    }

    // Format response
    const formattedArticles = articles.map((article) => ({
      ...article,
      ar_featured: Boolean(article.ar_featured),
      publishDate: new Date(article.ar_time * 1000).toISOString(),
      updatedDate: article.ar_updated_at ? new Date(article.ar_updated_at * 1000).toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    } as ArticleResponse);
  } catch (error) {
    console.error('Articles API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch articles',
      } as ArticleResponse,
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(handleGetArticles);
