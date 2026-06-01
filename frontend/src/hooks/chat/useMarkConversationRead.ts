import { useCallback, useEffect, useRef } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { useMarkRead } from "@/hooks/chat/useMessages";

const READ_DEBOUNCE_MS = 1500;

export function useMarkConversationRead(
  conversationRef: string | null, // This is your slug
  conversationId?: string,        // This is your raw database ObjectId string
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
    // 🧠 CRITICAL FIX: Ensure we have BOTH the slug and the underlying database ID 
    // before emitting, otherwise the socket server will map to an invalid room channel.
    if (!conversationRef || !conversationId) return;
    if (lastMarkedRef.current === conversationRef) return;
    
    lastMarkedRef.current = conversationRef;
    mutateRef.current(); // Hits HTTP endpoint to update DB record
    
    // Always use the real DB conversationId for socket communication
    socketRef.current?.emit("message:read", { conversationId });
  }, [conversationRef, conversationId]);

  const scheduleMarkRead = useCallback(
    (immediate = false) => {
      if (!conversationRef || !conversationId) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (immediate) {
        flushMarkRead();
        return;
      }
      timerRef.current = setTimeout(flushMarkRead, READ_DEBOUNCE_MS);
    },
    [conversationRef, conversationId, flushMarkRead],
  );

  useEffect(() => {
    lastMarkedRef.current = null;
    scheduleMarkRead();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [conversationRef, conversationId, scheduleMarkRead]); // Included conversationId dependency tracking

  return { markReadNow: () => scheduleMarkRead(true) };
}