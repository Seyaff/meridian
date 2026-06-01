import { useSocket } from "@/components/providers/socket-provider";
import { fetchPresence } from "@/lib/api/api";
import { UserPresence } from "@/types/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function usePresence(userIds: string[]) {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const key = userIds.slice().sort().join(",");

  const query = useQuery({
    queryKey: ["presence", key],
    queryFn: () => fetchPresence(userIds),
    enabled: userIds.length > 0,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!socket) return;

    const onPresence = (payload: {
      userId: string;
      isOnline: boolean;
      lastSeenAt?: string;
    }) => {
      queryClient.setQueryData(["presence", key], (old: UserPresence[] | undefined) => {
        const list = old ?? [];
        const idx = list.findIndex((p) => p.userId === payload.userId);
        const next: UserPresence = {
          userId: payload.userId,
          isOnline: payload.isOnline,
          lastSeenAt: payload.lastSeenAt ?? list[idx]?.lastSeenAt,
        };
        if (idx >= 0) {
          const copy = [...list];
          copy[idx] = next;
          return copy;
        }
        return [...list, next];
      });
    };

    socket.on("presence:update", onPresence);
    return () => {
      socket.off("presence:update", onPresence);
    };
  }, [socket, queryClient, key]);

  const getPresence = (userId: string) =>
    query.data?.find((p :any) => p.userId === userId);

  return { presence: query.data ?? [], getPresence, isLoading: query.isLoading };
}