"use client"

import { getSingleConversation } from "@/lib/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetConversation = (ref: string) => {
  return useQuery({
    queryKey: ["conversation", ref],
    queryFn: () => getSingleConversation(ref),
    enabled: !!ref,
  });
};
