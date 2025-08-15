import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withApiSecurity } from '@/lib/api-security';
import { verifyAccessToken } from '@/lib/jwt';

interface UpdateArticleRequest {
  ar_id: number;
  ar_title: string;
  ar_img: string;
  ar_des: string;
  ar_content: string;
  ar_slug: string;
  ar_type: number;
  ar_featured?: boolean;
  ar_status?: number;
  ar_meta_keywords?: string;
  ar_meta_description?: string;
  ar_order?: number;
  tags?: string[];
}

interface UpdateArticleResponse {
  success: boolean;
  data?: {
    ar_id: number;
    message: string;
  };
  error?: string;
}

async function handleUpdateArticle(req: NextRequest) {
  try {
    // Check authentication
    const accessToken = req.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        } as UpdateArticleResponse,
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token',
        } as UpdateArticleResponse,
        { status: 401 }
      );
    }

    // Parse request body
    const body: UpdateArticleRequest = await req.json();
    const {
      ar_id,
      ar_title,
      ar_img,
      ar_des,
      ar_content,
      ar_slug,
      ar_type,
      ar_featured = false,
      ar_status = 1,
      ar_meta_keywords = '',
      ar_meta_description = '',
      ar_order = 0,
      tags = [],
    } = body;

    // Validation
    if (!ar_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article ID is required',
        } as UpdateArticleResponse,
        { status: 400 }
      );
    }

    if (!ar_title || !ar_des || !ar_content || !ar_slug || !ar_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        } as UpdateArticleResponse,
        { status: 400 }
      );
    }

    // Check if article exists and user has permission
    const articleCheck = await query('web', 'SELECT ar_id, ar_by FROM article WHERE ar_id = ?', [ar_id]);

    if ((articleCheck as { ar_id: number }[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
        } as UpdateArticleResponse,
        { status: 404 }
      );
    }

    const article = (articleCheck as { ar_id: number; ar_by: number }[])[0];

    // Check permission (only article author can edit, or admin role if implemented)
    if (article.ar_by !== payload.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permission denied - You can only edit your own articles',
        } as UpdateArticleResponse,
        { status: 403 }
      );
    }

    // Check if slug already exists (exclude current article)
    const existingSlug = await query('web', 'SELECT ar_id FROM article WHERE ar_slug = ? AND ar_id != ?', [
      ar_slug,
      ar_id,
    ]);

    if ((existingSlug as { ar_id: number }[]).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug already exists',
        } as UpdateArticleResponse,
        { status: 409 }
      );
    }

    // Update article
    const currentTime = Math.floor(Date.now() / 1000);
    const updateQuery = `
      UPDATE article SET
        ar_title = ?, ar_img = ?, ar_des = ?, ar_content = ?, ar_slug = ?, 
        ar_type = ?, ar_featured = ?, ar_status = ?, ar_meta_keywords = ?, 
        ar_meta_description = ?, ar_order = ?, ar_updated_at = ?
      WHERE ar_id = ?
    `;

    const updateParams = [
      ar_title,
      ar_img,
      ar_des,
      ar_content,
      ar_slug,
      ar_type,
      ar_featured ? 1 : 0,
      ar_status,
      ar_meta_keywords,
      ar_meta_description,
      ar_order,
      currentTime,
      ar_id,
    ];

    await query('web', updateQuery, updateParams);

    // Handle tags - First remove all existing tag relationships
    await query('web', 'DELETE FROM article_tag_relations WHERE ar_id = ?', [ar_id]);

    // Update tag counts (decrement for removed tags)
    const oldTagsResult = await query(
      'web',
      `
      SELECT t.tag_id 
      FROM article_tags t
      INNER JOIN article_tag_relations r ON t.tag_id = r.tag_id
      WHERE r.ar_id = ?
    `,
      [ar_id]
    );

    for (const oldTag of oldTagsResult as { tag_id: number }[]) {
      await query('web', 'UPDATE article_tags SET tag_count = GREATEST(tag_count - 1, 0) WHERE tag_id = ?', [
        oldTag.tag_id,
      ]);
    }

    // Add new tags
    if (tags.length > 0) {
      for (const tagName of tags) {
        // Get or create tag
        const tagResult = await query('web', 'SELECT tag_id FROM article_tags WHERE tag_name = ?', [tagName]);

        let tagId;
        if ((tagResult as { tag_id: number }[]).length === 0) {
          // Create new tag
          const tagSlug = tagName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens
            .trim();

          const newTag = await query(
            'web',
            'INSERT INTO article_tags (tag_name, tag_slug, tag_count) VALUES (?, ?, 1)',
            [tagName, tagSlug]
          );
          tagId = (newTag as { insertId: number }).insertId;
        } else {
          tagId = (tagResult as { tag_id: number }[])[0].tag_id;
          // Increment tag count
          await query('web', 'UPDATE article_tags SET tag_count = tag_count + 1 WHERE tag_id = ?', [tagId]);
        }

        // Link article to tag
        await query('web', 'INSERT INTO article_tag_relations (ar_id, tag_id) VALUES (?, ?)', [ar_id, tagId]);
      }
    }

    // Clean up unused tags (tag_count = 0)
    await query('web', 'DELETE FROM article_tags WHERE tag_count = 0');

    return NextResponse.json({
      success: true,
      data: {
        ar_id: ar_id,
        message: 'Article updated successfully',
      },
    } as UpdateArticleResponse);
  } catch (error) {
    console.error('Update Article API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update article',
      } as UpdateArticleResponse,
      { status: 500 }
    );
  }
}

export const PUT = withApiSecurity(handleUpdateArticle);
export const PATCH = withApiSecurity(handleUpdateArticle);
