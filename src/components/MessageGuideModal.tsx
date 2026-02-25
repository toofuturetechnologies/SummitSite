'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X, Send, Loader } from 'lucide-react';
import Link from 'next/link';

// Use anon key for RLS to work with authenticated user
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface MessageGuideModalProps {
  guideId: string;        // guides.id
  guideUserId: string;    // guide's user_id (for recipient_id)
  guideName: string;
  tripId: string;
  tripTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MessageGuideModal({
  guideId,
  guideUserId,
  guideName,
  tripId,
  tripTitle,
  isOpen,
  onClose,
}: MessageGuideModalProps) {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('❌ Auth error:', userError.message);
          setError('Please sign in to message this guide');
          setLoading(false);
          return;
        }

        if (!authUser) {
          console.log('⚠️  No authenticated user');
          setError('Please sign in to message this guide');
          setLoading(false);
          return;
        }

        console.log('✅ User authenticated:', authUser.id);
        setUser(authUser);

        // Load existing conversation
        console.log('📥 Loading messages for conversation:', { guideId, authUserId: authUser.id, tripId });
        
        const { data: conversationMessages, error: messagesError } = await supabase
          .from('messages')
          .select('*, sender:sender_id(full_name)')
          .or(
            `and(sender_id.eq.${authUser.id},recipient_id.eq.${guideId}),and(sender_id.eq.${guideId},recipient_id.eq.${authUser.id})`
          )
          .eq('trip_id', tripId)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('❌ Message fetch error:', messagesError);
        } else {
          console.log('✅ Messages loaded:', conversationMessages?.length || 0);
          setMessages(conversationMessages as any[]);

          // Mark messages as read
          if (conversationMessages && conversationMessages.length > 0) {
            const { error: updateError } = await supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('trip_id', tripId)
              .eq('recipient_id', authUser.id)
              .is('read_at', true);

            if (updateError) {
              console.error('⚠️  Error marking messages as read:', updateError);
            }
          }
        }
      } catch (err) {
        console.error('💥 Modal load error:', err);
        setError(err instanceof Error ? err.message : 'Error loading messages');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, guideId, tripId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user) return;

    try {
      setSending(true);
      setError(null);

      // Validate required fields
      if (!guideId || !user.id) {
        throw new Error('Missing guide or user ID');
      }

      const messageContent = messageText.trim();
      const payload = {
        senderId: user.id,
        recipientId: guideId,
        content: messageContent,
        tripId: tripId,
      };

      console.log('📤 Sending message via Supabase direct:', payload);

      // Send directly via Supabase (no API needed)
      const { data: newMessage, error: dbError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: guideUserId,  // Use guide's user_id, not guide_id
          content: messageContent,
          trip_id: tripId || null,
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database Error:', dbError);
        
        // Better error messages
        if (dbError.code === '23502') {
          throw new Error('Invalid recipient. Make sure the guide exists.');
        } else if (dbError.code === '23505') {
          throw new Error('This message was already sent.');
        } else if (dbError.message?.includes('RLS')) {
          throw new Error('Permission denied. You may need to sign in again.');
        } else {
          throw new Error(dbError.message || 'Failed to send message');
        }
      }

      if (!newMessage) {
        throw new Error('Message was not saved (no data returned)');
      }

      console.log('✅ Message sent successfully:', newMessage.id);

      // Add message to local state
      setMessages([
        ...messages,
        {
          id: newMessage.id,
          sender_id: user.id,
          content: messageContent,
          created_at: newMessage.created_at,
          read_at: null,
          sender: {
            full_name: user.user_metadata?.full_name || 'You',
          },
        },
      ]);

      setMessageText('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      console.error('💥 Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-summit-900 rounded-lg w-full max-w-md h-96 flex flex-col border border-summit-700 shadow-xl">
        {/* Header */}
        <div className="border-b border-summit-700 p-4 flex items-center justify-between bg-summit-800/50">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">{guideName}</h2>
            <p className="text-xs text-summit-400">{tripTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-summit-400 hover:text-summit-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="w-6 h-6 text-summit-400 animate-spin" />
            </div>
          ) : error && error.includes('Please sign in') ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-summit-300 text-sm text-center">{error}</p>
              <Link
                href={`/auth/login?returnTo=${encodeURIComponent(
                  `/trips/${tripId}#message-${guideId}`
                )}`}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm transition"
              >
                Sign In to Chat
              </Link>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-summit-400 text-sm">Start a conversation...</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.sender_id === user?.id
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-summit-700 text-summit-100 rounded-bl-none'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && !error.includes('Please sign in') && (
          <div className="px-4 py-2 bg-red-900/50 border-t border-red-700/50">
            <p className="text-red-100 text-xs">{error}</p>
          </div>
        )}

        {/* Input Area */}
        {!error?.includes('Please sign in') && user && (
          <form
            onSubmit={handleSendMessage}
            className="border-t border-summit-700 p-3 bg-summit-800/50 flex gap-2"
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1 bg-summit-900 border border-summit-600 text-white px-3 py-2 rounded-lg focus:border-summit-500 focus:outline-none text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded-lg transition flex items-center justify-center"
            >
              {sending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
