/**
 * Messaging Utilities
 * Helper functions for message formatting and management
 */

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  booking_id?: string;
  trip_id?: string;
}

export interface Conversation {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_guide: boolean;
}

/**
 * Format message timestamp
 * Shows "Today 3:45 PM" or "Yesterday" or "Mar 2"
 */
export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diff = today.getTime() - messageDate.getTime();
  const days = diff / (1000 * 60 * 60 * 24);

  if (days === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Group messages by date
 */
export function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
  const grouped: Record<string, Message[]> = {};

  messages.forEach((msg) => {
    const date = new Date(msg.created_at);
    const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(msg);
  });

  return grouped;
}

/**
 * Get preview text from message
 * Truncates long messages for preview
 */
export function getMessagePreview(content: string, maxLength = 50): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

/**
 * Check if user is typing based on message timestamps
 * (Can be extended for real-time typing indicators)
 */
export function getUserTypingStatus(lastMessageTime: string): boolean {
  const timeDiff = Date.now() - new Date(lastMessageTime).getTime();
  // Consider typing if last activity was within 5 seconds
  return timeDiff < 5000;
}

/**
 * Format unread badge
 * Shows "1", "9+", etc.
 */
export function formatUnreadCount(count: number): string {
  if (count === 0) return '';
  if (count > 9) return '9+';
  return count.toString();
}

/**
 * Build conversation summary from messages
 */
export function buildConversationSummary(
  userId: string,
  userName: string,
  messages: Message[],
  isGuide: boolean
): Conversation {
  const lastMessage = messages[messages.length - 1];
  const unreadCount = messages.filter(
    (m) => m.recipient_id === userId && !m.read_at
  ).length;

  return {
    user_id: userId,
    user_name: userName,
    last_message: getMessagePreview(lastMessage?.content || 'No messages yet'),
    last_message_at: lastMessage?.created_at || new Date().toISOString(),
    unread_count,
    is_guide: isGuide,
  };
}

/**
 * Validate message content
 */
export function validateMessageContent(content: string): {
  valid: boolean;
  error?: string;
} {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Message must be a non-empty string' };
  }

  if (content.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (content.length > 5000) {
    return { valid: false, error: 'Message is too long (max 5000 characters)' };
  }

  return { valid: true };
}

/**
 * Extract @ mentions from message
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex);
  return matches ? matches.map((m) => m.substring(1)) : [];
}

/**
 * Check if message contains sensitive keywords
 * (For potential content moderation)
 */
export function hasSensitiveContent(content: string): boolean {
  const sensitiveWords = [
    'payment outside',
    'off the app',
    'contact me directly',
  ];

  const lowerContent = content.toLowerCase();
  return sensitiveWords.some((word) => lowerContent.includes(word));
}
