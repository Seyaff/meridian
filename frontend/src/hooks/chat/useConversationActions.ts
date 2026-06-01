import {
  deleteConversation,
  updateConversationNickname,
} from "@/lib/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useConversationActions(ref: string) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteConversation(ref),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.removeQueries({ queryKey: ["conversation", ref] });
    },
  });

  const nicknameMutation = useMutation({
    mutationFn: (nickname?: string) => updateConversationNickname(ref, nickname),
    onSuccess: (conversation) => {
      queryClient.setQueryData(["conversation", ref], {
        success: true,
        conversation,
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return { deleteMutation, nicknameMutation };
}
