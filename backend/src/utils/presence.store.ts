const onlineUsers = new Map<string, number>();

export const presenceStore = {
  setOnline(userId: string) {
    onlineUsers.set(userId, (onlineUsers.get(userId) ?? 0) + 1);
  },

  setOffline(userId: string) {
    const count = onlineUsers.get(userId) ?? 0;
    if (count <= 1) {
      onlineUsers.delete(userId);
    } else {
      onlineUsers.set(userId, count - 1);
    }
  },

  isOnline(userId: string): boolean {
    return (onlineUsers.get(userId) ?? 0) > 0;
  },

  getOnlineUserIds(): string[] {
    return Array.from(onlineUsers.keys());
  },
};
