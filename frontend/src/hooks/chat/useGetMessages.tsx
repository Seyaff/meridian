import { listMessagesApi, ListMessagesQuery } from "@/lib/api/api";
import { useQuery } from "@tanstack/react-query";

export function useGetMessages(conversationId: string, query?: ListMessagesQuery) {
  return useQuery({
    queryKey: ["messages", conversationId, query],
    queryFn: () => listMessagesApi(conversationId, query),
    enabled: !!conversationId, // Only fetch if we have an active ID
    staleTime: 1000 * 60 * 5,   // 5 minutes caching safety configuration
  });
}