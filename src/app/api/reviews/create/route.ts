/**
 * Create Review
 * POST /api/reviews/create
 * 
 * Creates a new review for a trip/guide
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface ReviewRequest {
  bookingId: string;
  guideId: string;
  customerId: string;
  rating: number;
  title: string;
  content: string;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { bookingId, guideId, customerId, rating, title, content, tags }: ReviewRequest = await request.json();

    // Validate inputs
    if (!bookingId || !guideId || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, guideId, customerId' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    if (title.length < 3 || title.length > 100) {
      return NextResponse.json(
        { error: 'Title must be between 3 and 100 characters' },
        { status: 400 }
      );
    }

    if (content.length < 10 || content.length > 2000) {
      return NextResponse.json(
        { error: 'Content must be between 10 and 2000 characters' },
        { status: 400 }
      );
    }

    // Check if review already exists for this booking
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('reviewer_id', customerId)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this booking' },
        { status: 409 }
      );
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        booking_id: bookingId,
        guide_id: guideId,
        reviewer_id: customerId,
        rating,
        title,
        content,
        tags: tags || [],
        verified_booking: true, // Mark as verified since it came from booking
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Review creation error:', reviewError);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    // Update guide rating (aggregate)
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('guide_id', guideId);

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await supabase
        .from('guides')
        .update({
          average_rating: avgRating,
          total_reviews: allReviews.length,
        })
        .eq('id', guideId);
    }

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating,
        title,
        created_at: review.created_at,
      },
    });
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
