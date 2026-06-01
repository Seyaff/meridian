const TYPING_TTL_MS = 3000;

type TypingEntry = { userId: string; expiresAt: number };

const typingByConversation = new Map<string, Map<string, TypingEntry>>();

function cleanupExpired(conversationId: string) {
  const room = typingByConversation.get(conversationId);
  if (!room) return;
  const now = Date.now();
  for (const [userId, entry] of room.entries()) {
    if (entry.expiresAt <= now) room.delete(userId);
  }
  if (room.size === 0) typingByConversation.delete(conversationId);
}

export const typingStore = {
  setTyping(conversationId: string, userId: string): string[] {
    let room = typingByConversation.get(conversationId);
    if (!room) {
      room = new Map();
      typingByConversation.set(conversationId, room);
    }
    room.set(userId, { userId, expiresAt: Date.now() + TYPING_TTL_MS });
    cleanupExpired(conversationId);
    return this.getTypingUserIds(conversationId);
  },

  clearTyping(conversationId: string, userId: string): string[] {
    typingByConversation.get(conversationId)?.delete(userId);
    cleanupExpired(conversationId);
    return this.getTypingUserIds(conversationId);
  },

  getTypingUserIds(conversationId: string): string[] {
    cleanupExpired(conversationId);
    const room = typingByConversation.get(conversationId);
    if (!room) return [];
    return Array.from(room.keys());
  },
};
