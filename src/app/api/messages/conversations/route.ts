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
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get unique conversations (latest message with each user)
    // We need to find all distinct sender/recipient pairs for this user
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(
        `
        id,
        sender_id,
        recipient_id,
        content,
        created_at,
        read_at,
        booking_id,
        trip_id,
        profiles!messages_sender_id_fkey(full_name, avatar_url),
        profiles!messages_recipient_id_fkey(full_name, avatar_url)
      `
      )
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (messagesError) {
      throw messagesError;
    }

    // Group by conversation (sender + recipient pair)
    const conversations: { [key: string]: any } = {};

    messages?.forEach((msg: any) => {
      const otherUserId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
      const otherProfile =
        msg.sender_id === userId
          ? msg.profiles__messages_recipient_id_fkey
          : msg.profiles__messages_sender_id_fkey;

      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          otherUserId,
          otherUserName: otherProfile?.full_name,
          otherUserAvatar: otherProfile?.avatar_url,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          unreadCount: 0,
          lastMessageSenderId: msg.sender_id,
          bookingId: msg.booking_id,
          tripId: msg.trip_id,
        };
      }

      // Count unread messages from the other user
      if (msg.recipient_id === userId && !msg.read_at && msg.sender_id === otherUserId) {
        conversations[otherUserId].unreadCount += 1;
      }
    });

    const conversationsList = Object.values(conversations).sort(
      (a: any, b: any) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    return NextResponse.json({
      success: true,
      conversations: conversationsList,
    });
  } catch (error) {
    console.error('❌ Conversations fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
