"use client"

import { getSingleConversation } from "@/lib/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetConversation = (conversationId: string) => {
  return useQuery({
    queryKey: ["conversation", conversationId],

    queryFn: () => getSingleConversation(conversationId),

    enabled: !!conversationId,
  });
};
