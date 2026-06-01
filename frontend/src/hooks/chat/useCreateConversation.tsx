"use client";

import { createConversation } from "@/lib/api/api";
import { routes } from "@/lib/routes";
import { useMutation } from "@tanstack/react-query";

export default function useCreateConversation() {
  return useMutation({
    mutationKey: ["createConversation"],
    mutationFn: (userId: string) => createConversation(userId),
  });
}

export function conversationThreadPath(conversation: { slug: string }) {
  return routes.chatThread(conversation.slug);
}