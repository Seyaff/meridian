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
  slug: string,
  currentUserId: string,
  onPeerRead: (lastReadAt: string) => void,
) {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const onPeerReadRef = useRef(onPeerRead);
  onPeerReadRef.current = onPeerRead;

  useEffect(() => {
    if (!socket || !conversationId || !slug || !currentUserId) return;

    // Join room channel via standard conversation ID
    socket.emit("conversation:join", { conversationId });

    // Handle real-time incoming messages
    const onNewMessage = (payload: { message: Message }) => {
      if (payload.message.conversationId !== conversationId) return;

      queryClient.setQueryData(["messages", slug], (old: { pages?: unknown[] } | undefined) => {
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

    // Handle real-time seen/read events
    const onRead = (payload: {
      conversationId: string;
      userId: string;
      lastReadAt: string | Date;
    }) => {

        console.log("READ EVENT RECEIVED", payload);

      if (payload.conversationId !== conversationId) return;
      
      const ts =
        typeof payload.lastReadAt === "string"
          ? payload.lastReadAt
          : new Date(payload.lastReadAt).toISOString();

      // Update the local state hook component variable if it's from a peer
      if (payload.userId !== currentUserId) {
        onPeerReadRef.current(ts);
      }

      // 🔥 FIX: Dynamically updates the conversation cache array mapping.
      // This forces components using useGetConversation(slug) to reflect the status instantly.
      queryClient.setQueryData(["conversation", slug], (old: any) => {
        if (!old || !old.conversation) return old;
        
        return {
          ...old,
          conversation: {
            ...old.conversation,
            participants: old.conversation.participants.map((p: any) => {
              if (p.userId === payload.userId) {
                return { ...p, lastReadAt: ts };
              }
              return p;
            }),
          },
        };
      });
    };

    socket.on("message:new", onNewMessage);
    socket.on("message:read", onRead);

    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.off("message:new", onNewMessage);
      socket.off("message:read", onRead);
    };
  }, [conversationId, slug, currentUserId, queryClient, socket]);
}