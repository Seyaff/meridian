"use client"

import { createConversation } from "@/lib/api/api"
import { useMutation } from "@tanstack/react-query"

export default function useCreateConversation() {
  return useMutation({
    mutationKey: ["createConversation"],

    mutationFn: (userId: string) =>
      createConversation(userId),
  })
}