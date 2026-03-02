/**
 * Mark Messages as Read
 * POST /api/messages/mark-read
 * 
 * Marks one or more messages as read by the recipient
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { messageIds } = await request.json();

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'messageIds array required' },
        { status: 400 }
      );
    }

    // Mark all messages as read
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', messageIds)
      .is('read_at', null); // Only mark unread messages

    if (error) {
      console.error('Failed to mark messages as read:', error);
      return NextResponse.json(
        { error: 'Failed to mark messages as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      marked_count: messageIds.length,
    });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
