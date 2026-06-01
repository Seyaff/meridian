import { useSocket } from "@/components/providers/socket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export type InboxUpdatePayload = {
  conversationId: string;
  lastMessage?: {
    messageId: string;
    senderId: string;
    content: string;
    type: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
};

function reorderConversations<T extends { id: string }>(
  conversations: T[],
  conversationId: string,
  patch: Partial<T>,
): T[] {
  const idx = conversations.findIndex((c) => c.id === conversationId);
  if (idx === -1) return conversations;

  const merged = { ...conversations[idx], ...patch };
  const rest = conversations.filter((c) => c.id !== conversationId);
  return [merged, ...rest];
}

export function useInboxRealtime(_activeConversationId?: string) {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const onInboxUpdate = (payload: InboxUpdatePayload) => {
      queryClient.setQueryData(
        ["conversations"],
        (old: { conversations?: Array<Record<string, unknown>> } | undefined) => {
          if (!old?.conversations) return old;
          return {
            ...old,
            conversations: reorderConversations(
              old.conversations as Array<{ id: string } & Record<string, unknown>>,
              payload.conversationId,
              {
                lastMessage: payload.lastMessage,
                unreadCount: payload.unreadCount,
                updatedAt: payload.updatedAt,
              },
            ),
          };
        },
      );
    };

    socket.on("inbox:update", onInboxUpdate);
    return () => {
      socket.off("inbox:update", onInboxUpdate);
    };
  }, [socket, queryClient]);
}
