import { fetchMessages, sendMessage } from "@/lib/api/api";
import { Message } from "@/types/types";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function useMessages(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) =>
      fetchMessages(conversationId!, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!conversationId,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      content?: string;
      type: Message["type"];
      media?: Message["media"];
      clientId?: string;
    }) => sendMessage(conversationId, payload),
    onSuccess: (message) => {
      // 1. UPDATE ACTIVE CHAT MESSAGES
      queryClient.setQueryData(
        ["messages", conversationId],
        (old: any) => {
          if (!old) return old;
          const pages = [...old.pages];
          const first = pages[0];
          if (!first) return old;
          const exists = first.result.messages.some(
            (m: any) =>
              m.id === message.id ||
              (message.clientId && m.clientId === message.clientId),
          );
          if (exists) return old;
          
          pages[0] = {
            ...first,
            result: {
              ...first.result,
              messages: [...first.result.messages, message],
            },
          };
          return { ...old, pages };
        },
      );

      // 2. UPDATE SIDEBAR ON MESSAGE SENT
      queryClient.setQueryData(["conversations"], (oldData: any) => {
        if (!oldData || !oldData.conversations) return oldData;

        const updatedConversations = oldData.conversations.map((conv: any) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: message,
              updatedAt: message.createdAt,
            };
          }
          return conv;
        });

        return {
          ...oldData,
          conversations: updatedConversations,
        };
      });

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}