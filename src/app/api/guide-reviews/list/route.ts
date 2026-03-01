import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { getCacheHeaders, CACHE_DURATIONS, CACHE_TAGS } from '@/lib/cache';

const supabase = createClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get authenticated user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify guide
    const { data: guide, error: guideError } = await supabase
      .from('guides')
      .select('id')
      .eq('user_id', authData.user.id)
      .single();

    if (guideError || !guide) {
      return NextResponse.json({ error: 'Only guides can access this' }, { status: 403 });
    }

    // Get guide's reviews of customers
    const { data: reviews, error: reviewsError, count } = await supabase
      .from('guide_reviews_of_customers')
      .select(
        `id, 
         rating, 
         comment, 
         behavior_notes, 
         professionalism_rating,
         created_at, 
         updated_at,
         customer_id,
         profiles!customer_id(full_name, email),
         bookings!booking_id(trip_id, trip:trip_id(title))`,
        { count: 'exact' }
      )
      .eq('guide_id', guide.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    return NextResponse.json(
      {
        reviews: reviews || [],
        total: count || 0,
        limit,
        offset,
      },
      {
        headers: getCacheHeaders(CACHE_DURATIONS.MEDIUM, [CACHE_TAGS.REVIEWS]),
      }
    );
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
