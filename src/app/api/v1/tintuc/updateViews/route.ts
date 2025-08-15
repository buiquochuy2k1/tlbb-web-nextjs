import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withApiSecurity } from '@/lib/api-security';

async function handleUpdateViews(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article ID is required',
        },
        { status: 400 }
      );
    }

    // Update view count
    await query('web', 'UPDATE article SET ar_views = ar_views + 1 WHERE ar_id = ?', [parseInt(articleId)]);

    // Get updated view count
    const result = await query('web', 'SELECT ar_views FROM article WHERE ar_id = ?', [parseInt(articleId)]);

    const views = (result as { ar_views: number }[])[0]?.ar_views || 0;

    return NextResponse.json({
      success: true,
      data: { views },
    });
  } catch (error) {
    console.error('Update Views API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update views',
      },
      { status: 500 }
    );
  }
}

export const PUT = withApiSecurity(handleUpdateViews);
