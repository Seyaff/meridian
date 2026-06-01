import { useCallback, useEffect, useRef } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { useMarkRead } from "@/hooks/chat/useMessages";

const READ_DEBOUNCE_MS = 1500;

export function useMarkConversationRead(
  conversationRef: string | null,
  conversationId?: string,
) {
  const socket = useSocket();
  const { mutate } = useMarkRead(conversationRef);
  const lastMarkedRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutateRef = useRef(mutate);
  const socketRef = useRef(socket);
  mutateRef.current = mutate;
  socketRef.current = socket;

  const flushMarkRead = useCallback(() => {
    if (!conversationRef) return;
    if (lastMarkedRef.current === conversationRef) return;
    lastMarkedRef.current = conversationRef;
    mutateRef.current();
    const id = conversationId ?? conversationRef;
    socketRef.current?.emit("message:read", { conversationId: id });
  }, [conversationRef, conversationId]);

  const scheduleMarkRead = useCallback(
    (immediate = false) => {
      if (!conversationRef) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (immediate) {
        flushMarkRead();
        return;
      }
      timerRef.current = setTimeout(flushMarkRead, READ_DEBOUNCE_MS);
    },
    [conversationRef, flushMarkRead],
  );

  useEffect(() => {
    lastMarkedRef.current = null;
    scheduleMarkRead();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [conversationRef, scheduleMarkRead]);

  return { markReadNow: () => scheduleMarkRead(true) };
}
