export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { recipientId, content, bookingId, tripId, senderId } = await request.json();

    if (!recipientId || !content || !senderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        content,
        booking_id: bookingId || null,
        trip_id: tripId || null,
      })
      .select()
      .single();

    if (messageError) {
      throw messageError;
    }

    console.log('✅ Message created:', message.id);

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        created_at: message.created_at,
        sender_id: message.sender_id,
      },
    });
  } catch (error) {
    console.error('❌ Message send error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}
