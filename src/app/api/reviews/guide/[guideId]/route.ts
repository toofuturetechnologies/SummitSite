/**
 * Get Guide Reviews
 * GET /api/reviews/guide/[guideId]
 * 
 * Fetches all reviews for a specific guide
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(
  request: NextRequest,
  { params }: { params: { guideId: string } }
) {
  try {
    const { guideId } = params;
    const limit = request.nextUrl.searchParams.get('limit') || '10';
    const offset = request.nextUrl.searchParams.get('offset') || '0';

    if (!guideId) {
      return NextResponse.json(
        { error: 'guideId parameter required' },
        { status: 400 }
      );
    }

    // Get reviews with reviewer info
    const { data: reviews, error: reviewsError, count } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        title,
        content,
        created_at,
        reviewer:profiles(id, name, avatar_url),
        verified_booking
      `, { count: 'exact' })
      .eq('guide_id', guideId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (reviewsError) {
      console.error('Reviews fetch error:', reviewsError);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews?.forEach((review: any) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews,
      stats: {
        average_rating: Math.round(avgRating * 10) / 10,
        total_reviews: count,
        rating_distribution: ratingDistribution,
      },
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count,
      },
    });
  } catch (error) {
    console.error('Reviews endpoint error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
