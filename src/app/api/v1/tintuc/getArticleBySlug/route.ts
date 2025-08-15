import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withApiSecurity } from '@/lib/api-security';
import { Article } from '../getArticles/route';

async function handleGetArticleBySlug(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug is required',
        },
        { status: 400 }
      );
    }

    // Get article by slug
    const articleQuery = `
      SELECT 
        a.*,
        c.cat_name as category_name,
        c.cat_color as category_color,
        c.cat_icon as category_icon,
        u.name as author_name
      FROM article a
      LEFT JOIN article_categories c ON a.ar_type = c.cat_id  
      LEFT JOIN account u ON a.ar_by = u.id
      WHERE a.ar_slug = ? AND a.ar_status = 1
    `;

    const rows = await query('web', articleQuery, [slug]);
    const articles = rows as Article[];

    if (articles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
        },
        { status: 404 }
      );
    }

    const article = articles[0];

    // Get tags for this article
    const tagsQuery = `
      SELECT t.tag_name 
      FROM article_tags t
      INNER JOIN article_tag_relations r ON t.tag_id = r.tag_id
      WHERE r.ar_id = ?
    `;
    const tagRows = await query('web', tagsQuery, [article.ar_id]);
    article.tags = (tagRows as { tag_name: string }[]).map((row) => row.tag_name);

    // Format response
    const formattedArticle = {
      ...article,
      ar_featured: Boolean(article.ar_featured),
      publishDate: new Date(article.ar_time * 1000).toISOString(),
      updatedDate: article.ar_updated_at ? new Date(article.ar_updated_at * 1000).toISOString() : null,
    };

    return NextResponse.json({
      success: true,
      data: formattedArticle,
    });
  } catch (error) {
    console.error('Get Article By Slug API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch article',
      },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(handleGetArticleBySlug);
