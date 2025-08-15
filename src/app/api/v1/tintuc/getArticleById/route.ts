import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withApiSecurity } from '@/lib/api-security';

interface Article {
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

interface ArticleResponse {
  success: boolean;
  data?: Article;
  error?: string;
}

async function handleGetArticleById(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('id');

    if (!articleId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article ID is required',
        } as ArticleResponse,
        { status: 400 }
      );
    }

    // Get article with related data
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
      WHERE a.ar_id = ?
    `;

    const rows = await query('web', articleQuery, [parseInt(articleId)]);
    const articles = rows as Article[];

    if (articles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
        } as ArticleResponse,
        { status: 404 }
      );
    }

    const article = articles[0];

    // Get tags for the article
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
    } as ArticleResponse);
  } catch (error) {
    console.error('Get Article By ID API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch article',
      } as ArticleResponse,
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(handleGetArticleById);
