import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withApiSecurity } from '@/lib/api-security';
import { verifyAccessToken } from '@/lib/jwt';

interface CreateArticleRequest {
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

async function handleCreateArticle(req: NextRequest) {
  try {
    // Check authentication
    const accessToken = req.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token',
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CreateArticleRequest = await req.json();
    const {
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
    if (!ar_title || !ar_des || !ar_content || !ar_slug || !ar_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSlug = await query('web', 'SELECT ar_id FROM article WHERE ar_slug = ?', [ar_slug]);

    if ((existingSlug as { ar_id: number }[]).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug already exists',
        },
        { status: 409 }
      );
    }

    // Create article
    const currentTime = Math.floor(Date.now() / 1000);
    const insertQuery = `
      INSERT INTO article (
        ar_title, ar_img, ar_des, ar_content, ar_slug, ar_type, 
        ar_time, ar_by, ar_views, ar_featured, 
        ar_status, ar_meta_keywords, ar_meta_description, 
        ar_updated_at, ar_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
      ar_title,
      ar_img,
      ar_des,
      ar_content,
      ar_slug,
      ar_type,
      currentTime,
      payload.userId,
      ar_featured ? 1 : 0,
      ar_status,
      ar_meta_keywords,
      ar_meta_description,
      currentTime,
      ar_order,
    ];

    const result = await query('web', insertQuery, insertParams);
    const articleId = (result as { insertId: number }).insertId;

    // Add tags if provided
    if (tags.length > 0) {
      for (const tagName of tags) {
        // Get or create tag
        const tagResult = await query('web', 'SELECT tag_id FROM article_tags WHERE tag_name = ?', [tagName]);

        let tagId;
        if ((tagResult as { tag_id: number }[]).length === 0) {
          // Create new tag
          const tagSlug = tagName
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
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
        await query('web', 'INSERT INTO article_tag_relations (ar_id, tag_id) VALUES (?, ?)', [
          articleId,
          tagId,
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ar_id: articleId,
        message: 'Article created successfully',
      },
    });
  } catch (error) {
    console.error('Create Article API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create article',
      },
      { status: 500 }
    );
  }
}

export const POST = withApiSecurity(handleCreateArticle);
