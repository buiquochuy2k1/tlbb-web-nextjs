import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withApiSecurity } from '@/lib/api-security';
import { verifyAccessToken } from '@/lib/jwt';

interface DeleteArticleRequest {
  ar_id?: number;
  id?: number;
}

interface DeleteArticleResponse {
  success: boolean;
  message?: string;
  error?: string;
}

async function handleDeleteArticle(req: NextRequest) {
  try {
    // Check authentication
    const accessToken = req.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        } as DeleteArticleResponse,
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token',
        } as DeleteArticleResponse,
        { status: 401 }
      );
    }

    // Get article ID from request body
    const body: DeleteArticleRequest = await req.json();
    const articleId = body.ar_id || body.id;

    if (!articleId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article ID is required',
        } as DeleteArticleResponse,
        { status: 400 }
      );
    }

    // Check if article exists and user has permission
    const articleCheck = await query('web', 'SELECT ar_id, ar_by FROM article WHERE ar_id = ?', [articleId]);

    if ((articleCheck as { ar_id: number; ar_by: number }[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
        } as DeleteArticleResponse,
        { status: 404 }
      );
    }

    const article = (articleCheck as { ar_id: number; ar_by: number }[])[0];

    // Check if user is author or admin (assuming role check)
    // You can modify this based on your permission system
    if (article.ar_by !== payload.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permission denied',
        } as DeleteArticleResponse,
        { status: 403 }
      );
    }

    // Get tags for this article to update tag counts
    const articleTags = await query(
      'web',
      `
      SELECT t.tag_id FROM article_tags t
      INNER JOIN article_tag_relations r ON t.tag_id = r.tag_id
      WHERE r.ar_id = ?
    `,
      [articleId]
    );

    // Delete article tag relations
    await query('web', 'DELETE FROM article_tag_relations WHERE ar_id = ?', [articleId]);

    // Update tag counts
    for (const tag of articleTags as { tag_id: number }[]) {
      await query('web', 'UPDATE article_tags SET tag_count = tag_count - 1 WHERE tag_id = ?', [tag.tag_id]);
    }

    // Delete unused tags (count = 0)
    await query('web', 'DELETE FROM article_tags WHERE tag_count <= 0');

    // Delete the article
    await query('web', 'DELETE FROM article WHERE ar_id = ?', [articleId]);

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    } as DeleteArticleResponse);
  } catch (error) {
    console.error('Delete Article API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete article',
      } as DeleteArticleResponse,
      { status: 500 }
    );
  }
}

export const DELETE = withApiSecurity(handleDeleteArticle);
