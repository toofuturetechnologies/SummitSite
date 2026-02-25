'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Send, MessageCircle, ChevronLeft, Plus } from 'lucide-react';

const supabase = createClient();

interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  lastMessageSenderId: string;
  bookingId?: string;
  tripId?: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  profiles: { full_name: string; avatar_url?: string };
}

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push('/auth/login');
          return;
        }

        setUser(user);

        // Load conversations
        const response = await fetch(`/api/messages/conversations?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const loadConversation = async (otherUserId: string) => {
    try {
      setSelectedConversation(otherUserId);
      const response = await fetch(
        `/api/messages/conversation/${otherUserId}?currentUserId=${user.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading conversation');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          recipientId: selectedConversation,
          content: messageText,
        }),
      });

      if (response.ok) {
        setMessageText('');
        // Reload conversation
        await loadConversation(selectedConversation);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <p className="text-white">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 bg-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-8 h-8" />
                Messages
              </h1>
              <p className="text-gray-600 mt-1">Chat with guides and customers</p>
            </div>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-600"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-100 p-4 m-6 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 overflow-y-auto bg-gray-200/20">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                <p>No messages yet</p>
                <p className="text-sm mt-2">Messages with guides or customers will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-summit-700">
                {conversations.map((conv) => (
                  <button
                    key={conv.otherUserId}
                    onClick={() => loadConversation(conv.otherUserId)}
                    className={`w-full p-4 text-left transition ${
                      selectedConversation === conv.otherUserId
                        ? 'bg-gray-200'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-summit-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {conv.otherUserName?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {conv.otherUserName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(conv.lastMessageTime).toLocaleDateString()}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-600">
                    <p>Start the conversation</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_id === user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender_id === user.id
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-gray-200 text-summit-100 rounded-bl-none'
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
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-6 bg-gray-100">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sending}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
