import { useSocket } from "@/components/providers/socket-provider";
import { Message } from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

function appendMessage(
  pages: Array<{
    result: { messages: Message[]; hasMore: boolean; nextCursor?: string };
  }>,
  message: Message,
) {
  const next = [...pages];
  const first = next[0];
  if (!first) return pages;

  const exists = first.result.messages.some(
    (m: Message) =>
      m.id === message.id ||
      (message.clientId && m.clientId === message.clientId),
  );

  if (exists) return pages;

  next[0] = {
    ...first,
    result: {
      ...first.result,
      messages: [...first.result.messages, message],
    },
  };

  return next;
}

export default function useChatRealtime(
  conversationId: string,
  currentUserId: string,
  onPeerRead: (lastReadAt: string) => void,
) {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const onPeerReadRef = useRef(onPeerRead);
  onPeerReadRef.current = onPeerRead;

  useEffect(() => {
    if (!socket || !conversationId || !currentUserId) return;

    socket.emit("conversation:join", { conversationId });

    const onNewMessage = (payload: { message: Message }) => {
      if (payload.message.conversationId !== conversationId) return;

      queryClient.setQueryData(["messages", conversationId], (old: { pages?: unknown[] } | undefined) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: appendMessage(
            old.pages as Parameters<typeof appendMessage>[0],
            payload.message,
          ),
        };
      });
    };

    const onRead = (payload: {
      conversationId: string;
      userId: string;
      lastReadAt: string | Date;
    }) => {
      if (payload.conversationId !== conversationId) return;
      if (payload.userId === currentUserId) return;
      const ts =
        typeof payload.lastReadAt === "string"
          ? payload.lastReadAt
          : new Date(payload.lastReadAt).toISOString();
      onPeerReadRef.current(ts);
    };

    socket.on("message:new", onNewMessage);
    socket.on("message:read", onRead);

    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.off("message:new", onNewMessage);
      socket.off("message:read", onRead);
    };
  }, [conversationId, currentUserId, queryClient, socket]);
}
