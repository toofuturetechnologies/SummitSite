/**
 * Message Panel Component
 * Reusable messaging UI for guide-customer communication
 * 
 * Usage:
 * <MessagePanel 
 *   recipientId="..." 
 *   recipientName="..." 
 *   currentUserId="..."
 *   bookingId="..."
 * />
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at?: string;
}

interface MessagePanelProps {
  recipientId: string;
  recipientName: string;
  currentUserId: string;
  currentUserName?: string;
  bookingId?: string;
  tripId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export default function MessagePanel({
  recipientId,
  recipientName,
  currentUserId,
  currentUserName = 'You',
  bookingId,
  tripId,
  onClose,
  isModal = false,
}: MessagePanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [recipientId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/messages/conversation/${recipientId}`);
      if (!res.ok) throw new Error('Failed to load messages');
      
      const data = await res.json();
      setMessages(data.messages || []);
      setLoading(false);

      // Mark messages as read
      const unreadMessageIds = data.messages
        .filter((m: Message) => m.recipient_id === currentUserId && !m.read_at)
        .map((m: Message) => m.id);

      if (unreadMessageIds.length > 0) {
        await fetch('/api/messages/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageIds: unreadMessageIds }),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          recipientId,
          content: newMessage,
          bookingId: bookingId || null,
          tripId: tripId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setNewMessage('');
      await loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const containerClass = isModal
    ? 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'
    : 'w-full';

  const panelClass = isModal
    ? 'bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl h-96'
    : 'bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 h-96';

  return (
    <div className={containerClass}>
      <div className={panelClass + ' flex flex-col'}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sky-200 dark:border-slate-700">
          <div>
            <h3 className="font-semibold text-sky-900 dark:text-sky-100">
              {recipientName}
            </h3>
            <p className="text-sm text-sky-600 dark:text-sky-400">Guide Communication</p>
          </div>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-sky-100 dark:hover:bg-slate-700 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sky-600 dark:text-sky-400">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sky-600 dark:text-sky-400">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender_id === currentUserId
                      ? 'bg-sky-500 text-white rounded-br-none'
                      : 'bg-sky-100 dark:bg-slate-700 text-sky-900 dark:text-sky-100 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender_id === currentUserId
                      ? 'text-sky-200'
                      : 'text-sky-600 dark:text-sky-400'
                  }`}>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {msg.read_at && msg.sender_id === currentUserId && ' ✓✓'}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm rounded">
            {error}
          </div>
        )}

        {/* Message input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-sky-200 dark:border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1 px-3 py-2 bg-sky-50 dark:bg-slate-700 border border-sky-200 dark:border-slate-600 rounded-lg text-sky-900 dark:text-sky-100 placeholder-sky-600 dark:placeholder-sky-400 focus:outline-none focus:border-sky-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send className="h-4 w-4" />
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
