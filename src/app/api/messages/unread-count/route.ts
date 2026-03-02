/**
 * Get Unread Message Count
 * GET /api/messages/unread-count?userId=...
 * 
 * Returns count of unread messages for a user
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      );
    }

    // Count unread messages
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .is('read_at', null);

    if (error) {
      console.error('Failed to get unread count:', error);
      return NextResponse.json(
        { error: 'Failed to get unread count' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      unread_count: count || 0,
      user_id: userId,
    });
  } catch (error) {
    console.error('Unread count error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
