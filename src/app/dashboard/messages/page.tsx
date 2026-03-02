/**
 * Guide Messages Dashboard
 * /dashboard/messages
 * 
 * Allows guides to view and respond to messages from customers
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import MessagePanel from '@/components/MessagePanel';

const supabase = createClient();

interface Conversation {
  user_id: string;
  user_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export default function MessagesPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setError('Not authenticated');
        return;
      }

      setUser(authUser);

      // Get all conversations for this user
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${authUser.id},recipient_id.eq.${authUser.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Build conversation list (group by other user)
      const conversationMap: Record<string, Conversation> = {};

      messages?.forEach((msg: any) => {
        const otherId = msg.sender_id === authUser.id ? msg.recipient_id : msg.sender_id;
        
        if (!conversationMap[otherId]) {
          conversationMap[otherId] = {
            user_id: otherId,
            user_name: 'Loading...',
            last_message: msg.content.substring(0, 50),
            last_message_at: msg.created_at,
            unread_count: 0,
          };
        }

        // Count unread
        if (msg.recipient_id === authUser.id && !msg.read_at) {
          conversationMap[otherId].unread_count += 1;
        }
      });

      // Fetch user names
      const userIds = Object.keys(conversationMap);
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        profiles?.forEach((profile: any) => {
          if (conversationMap[profile.id]) {
            conversationMap[profile.id].user_name = profile.name;
          }
        });
      }

      const convList = Object.values(conversationMap)
        .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

      setConversations(convList);
      setLoading(false);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (selectedUserId) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedUserId(null)}
          className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to conversations
        </button>

        <MessagePanel
          recipientId={selectedUserId}
          recipientName={selectedUserName}
          currentUserId={user.id}
          currentUserName="You"
          onClose={() => setSelectedUserId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Messages
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and respond to messages from customers
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-sky-200 border-t-sky-500"></div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-12 text-center">
          <MessageCircle className="h-12 w-12 text-sky-400 mx-auto mb-4 opacity-50" />
          <p className="text-gray-600 dark:text-gray-400">No messages yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Messages from customers will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.user_id}
              onClick={() => {
                setSelectedUserId(conv.user_id);
                setSelectedUserName(conv.user_name);
              }}
              className="w-full p-4 bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-600 transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {conv.user_name}
                </h3>
                {conv.unread_count > 0 && (
                  <span className="bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {conv.unread_count}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                {conv.last_message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {new Date(conv.last_message_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
