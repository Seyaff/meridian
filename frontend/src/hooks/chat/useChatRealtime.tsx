import { useSocket } from "@/components/providers/socket-provider";
import { Conversation, Message } from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

function appendMessage(
  pages: Array<{ messages: Message[]; hasMore: boolean; nextCursor?: string }>,
  message: Message,
) {
  const next = [...pages];
  const first = next[0];
  if (!first) return pages;
  const exists = first.messages.some(
    (m) => m.id === message.id || (message.clientId && m.clientId === message.clientId),
  );
  if (exists) return pages;
  next[0] = { ...first, messages: [...first.messages, message] };
  return next;
}

export function useChatRealtime(
  conversationId: string | null,
  currentUserId: string | undefined,
  onPeerRead?: (lastReadAt: string) => void,
) {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !conversationId || !currentUserId) return;

    socket.emit("conversation:join", { conversationId });

    const onNewMessage = (payload: { message: Message }) => {
      if (payload.message.conversationId !== conversationId) return;
      queryClient.setQueryData(
        ["messages", conversationId],
        (old: { pages: Array<{ messages: Message[]; hasMore: boolean }>; pageParams: unknown[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: appendMessage(old.pages, payload.message),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const onRead = (payload: {
      conversationId: string;
      userId: string;
      lastReadAt: string;
    }) => {
      if (payload.conversationId !== conversationId) return;
      if (payload.userId !== currentUserId) {
        onPeerRead?.(payload.lastReadAt);
      }
      queryClient.setQueryData(
        ["conversations"],
        (old: Conversation[] | undefined) =>
          old?.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c,
          ),
      );
    };

    socket.on("message:new", onNewMessage);
    socket.on("message:read", onRead);

    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.off("message:new", onNewMessage);
      socket.off("message:read", onRead);
    };
  }, [socket, conversationId, currentUserId, queryClient, onPeerRead]);
}