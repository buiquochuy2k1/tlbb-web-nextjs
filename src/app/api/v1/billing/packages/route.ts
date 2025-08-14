import { NextRequest, NextResponse } from 'next/server';
import { withApiSecurity } from '@/lib/api-security';
import { query } from '@/lib/db';

interface BillingPackage {
  id: number;
  package_code: string;
  package_name: string;
  silver_amount: number;
  bonus_silver: number;
  price_vnd: number;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  description: string | null;
}

async function GET(request: NextRequest) {
  try {
    // Get all active packages ordered by sort_order
    const packages = (await query(
      'web',
      `SELECT 
        id,
        package_code,
        package_name,
        silver_amount,
        bonus_silver,
        price_vnd,
        is_popular,
        is_active,
        sort_order,
        description
      FROM billing_package 
      WHERE is_active = 1 
      ORDER BY sort_order ASC, id ASC`
    )) as BillingPackage[];

    // Transform to frontend format
    const transformedPackages = packages.map((pkg) => ({
      id: pkg.package_code,
      silver: pkg.silver_amount,
      price: pkg.price_vnd,
      bonus: pkg.bonus_silver,
      popular: pkg.is_popular,
      packages: [pkg.package_code], // Keep compatibility with existing frontend
      name: pkg.package_name,
      description: pkg.description,
      sortOrder: pkg.sort_order,
    }));

    return NextResponse.json({
      success: true,
      data: transformedPackages,
      total: transformedPackages.length,
    });
  } catch (error) {
    console.error('❌ Get billing packages error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

// Apply API security and export
export const GET_HANDLER = withApiSecurity(GET);
export { GET_HANDLER as GET };
