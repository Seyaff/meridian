import { sendMessageApi, SendMessagePayload } from "@/lib/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      sendMessageApi(conversationId, payload),
    onSuccess: (data) => {
      // Optional: Optimistically update or invalidate your message list cache instantly
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });
}
