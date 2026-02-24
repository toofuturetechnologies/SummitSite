export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUserId = request.nextUrl.searchParams.get('currentUserId');
    const otherUserId = params.userId;

    if (!currentUserId || !otherUserId) {
      return NextResponse.json(
        { error: 'Missing userId parameters' },
        { status: 400 }
      );
    }

    // Get all messages between these two users
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(
        `
        id,
        sender_id,
        content,
        created_at,
        read_at,
        booking_id,
        profiles!messages_sender_id_fkey(full_name, avatar_url)
      `
      )
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    // Mark messages as read (those sent to current user)
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .or(`and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId},read_at.is.null)`);

    return NextResponse.json({
      success: true,
      messages: messages || [],
    });
  } catch (error) {
    console.error('❌ Conversation fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
