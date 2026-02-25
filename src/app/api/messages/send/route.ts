export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials - handle both local dev and Vercel production
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate env vars on startup
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ CRITICAL: Missing Supabase credentials in environment!');
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_KEY:', SUPABASE_KEY ? '✅' : '❌');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { recipientId, content, bookingId, tripId, senderId } = await request.json();

    // Validate inputs
    if (!recipientId || !content || !senderId) {
      const missing = [];
      if (!senderId) missing.push('senderId');
      if (!recipientId) missing.push('recipientId');
      if (!content) missing.push('content');
      
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate string content
    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content must be non-empty string' },
        { status: 400 }
      );
    }

    // Debug: Check if Supabase is initialized
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error('❌ Supabase not configured:', {
        hasUrl: !!SUPABASE_URL,
        hasKey: !!SUPABASE_KEY,
      });
      return NextResponse.json(
        { error: 'Server configuration error: Supabase not initialized' },
        { status: 503 }
      );
    }

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        content: content.trim(),
        booking_id: bookingId || null,
        trip_id: tripId || null,
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Supabase insert error:', {
        code: messageError.code,
        message: messageError.message,
        details: messageError.details,
        hint: messageError.hint,
      });
      
      // More helpful error messages based on error code
      let userMessage = messageError.message || 'Failed to send message';
      if (messageError.code === '23505') {
        userMessage = 'Duplicate message (this message was already sent)';
      } else if (messageError.code === '23502') {
        userMessage = 'Invalid recipient or sender';
      } else if (messageError.code === '42P01') {
        userMessage = 'Messages table not found (database error)';
      }
      
      throw new Error(userMessage);
    }

    if (!message) {
      throw new Error('Message was not created (no data returned)');
    }

    console.log('✅ Message created:', {
      id: message.id,
      from: senderId,
      to: recipientId,
      content: content.substring(0, 50),
    });

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Message send error:', errorMessage);
    
    return NextResponse.json(
      { 
        error: errorMessage || 'Failed to send message',
        status: 'error'
      },
      { status: 500 }
    );
  }
}
