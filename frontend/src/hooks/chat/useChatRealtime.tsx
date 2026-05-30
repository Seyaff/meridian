import { useSocket } from "@/components/providers/socket-provider";
import { Message } from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

function appendMessage(
  pages: Array<{ 
    message: string; 
    success: boolean; 
    result: { messages: Message[]; hasMore: boolean; nextCursor?: string } 
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
      messages: [...first.result.messages, message]
    }
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

  useEffect(() => {
    if (!socket || !conversationId || !currentUserId) return;

    socket.emit("conversation:join", { conversationId });

    const onNewMessage = (payload: { message: Message }) => {
      if (payload.message.conversationId !== conversationId) return;

      // 1. UPDATE THE ACTIVE CONVERSATION'S MESSAGES
      queryClient.setQueryData(
        ["messages", conversationId],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: appendMessage(old.pages, payload.message),
          };
        },
      );

      // 2. INSTANTLY BUMP SIDEBAR CONVERSATION TO THE TOP
      queryClient.setQueryData(["conversations"], (oldData: any) => {
        if (!oldData || !oldData.conversations) return oldData;

        const updatedConversations = oldData.conversations.map((conv: any) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: payload.message, // Injection of the incoming message object
              updatedAt: payload.message.createdAt, // Enforcing modern timestamp
            };
          }
          return conv;
        });

        return {
          ...oldData,
          conversations: updatedConversations,
        };
      });

      // 3. Background sync verification safety valve
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("message:new", onNewMessage);

    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.off("message:new", onNewMessage);
    };
  }, [conversationId, currentUserId, onPeerRead, queryClient, socket]);
}