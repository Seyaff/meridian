"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Mic,
  Sticker,
  SendHorizontal,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { useGetConversation } from "@/hooks/chat/use-getConversation";
import InboxTopbar from "@/components/inbox/topbar";
import EmojiPickerComponent from "@/components/chat/emoji-picker";
import { ConversationMenu } from "@/components/chat/conversation-menu";
import { useAuth } from "@/components/providers/auth-provider";
import { useSocket } from "@/components/providers/socket-provider";
import useChatRealtime from "@/hooks/chat/useChatRealtime";
import { useMarkConversationRead } from "@/hooks/chat/useMarkConversationRead";
import { useMessages, useSendMessage } from "@/hooks/chat/useMessages";
import {
  getConversationAvatar,
  getConversationTitle,
  getOtherParticipantId,
} from "@/lib/chat-util";
import { routes } from "@/lib/routes";
import { Message } from "@/types/types";
import { MessageBubble } from "@/components/chat/message-bubble";
import { usePresence } from "@/hooks/chat/usePresence";
import { formatPresenceLabel } from "@/lib/presence.util";

const MAX_MESSAGE_LENGTH = 4000;

export default function ChatThread({ slug }: { slug: string }) {
  const [draft, setDraft] = useState("");
  const [peerLastReadAt, setPeerLastReadAt] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);

  const socket = useSocket();
  const { user } = useAuth();

  const { data, isLoading: conversationLoading } = useGetConversation(slug);
  const conversation = data?.conversation;
  const conversationId = conversation?.id ?? "";

  const {
    data: messagesData,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(slug || null);

  const { markReadNow } = useMarkConversationRead(slug || null, conversationId);

  const { mutate, mutateAsync, isPending: messageSendPending } =
    useSendMessage(slug);

  const otherUserId =
    conversation && user
      ? getOtherParticipantId(conversation, user.id)
      : undefined;

  const { getPresence } = usePresence(otherUserId ? [otherUserId] : []);

  useChatRealtime(conversationId, user?.id || "", (lastReadAt) => {
    setPeerLastReadAt(lastReadAt);
  });

  const messages = useMemo(() => {
    if (!messagesData?.pages) return [];
    return messagesData.pages
      .slice()
      .reverse()
      .flatMap((page) => page?.result?.messages || []);
  }, [messagesData?.pages]);

  console.log("Messaes" , messages)

  const lastOwnMessageId = useMemo(() => {
    if (!user) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === user.id) return messages[i].id;
    }
    return null;
  }, [messages, user]);

  const peerHasReadLatest = useMemo(() => {
    if (!peerLastReadAt || !lastOwnMessageId) return false;
    const lastOwn = messages.find((m) => m.id === lastOwnMessageId);
    if (!lastOwn) return false;
    return new Date(peerLastReadAt) >= new Date(lastOwn.createdAt);
  }, [peerLastReadAt, lastOwnMessageId, messages]);

  const title =
    conversation && user ? getConversationTitle(conversation, user.id) : "";
  const avatarUrl =
    conversation && user
      ? getConversationAvatar(conversation, user.id)
      : undefined;

  const otherParticipant = useMemo(() => {
    if (!conversation || !user || conversation.type !== "dm") return null;
    return (
      conversation.participants.find(
        (p: { userId: string }) => p.userId !== user.id,
      ) ?? null
    );
  }, [conversation, user]);

  useEffect(() => {
    if (otherParticipant?.lastReadAt) {
      setPeerLastReadAt(otherParticipant.lastReadAt);
    }
  }, [otherParticipant?.lastReadAt, slug]);

  useEffect(() => {
    setInitialScrollDone(false);
  }, [slug]);

  useEffect(() => {
    if (!messages.length || initialScrollDone) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
      setInitialScrollDone(true);
    });
  }, [messages.length, slug, initialScrollDone]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.senderId === user?.id || !conversationId) return;
    markReadNow();
  }, [messages[messages.length - 1]?.id, user?.id, conversationId, markReadNow]);

  const typingLabel = useMemo(() => {
    if (typingUsers.length === 0) return null;
    const names = typingUsers
      .map((id) => {
        const p = conversation?.participants.find(
          (x: { userId: string; name?: string }) => x.userId === id,
        );
        return p?.name ?? "Someone";
      })
      .filter(Boolean);
    if (names.length === 1) return `${names[0]} is typing…`;
    return `${names.join(", ")} are typing…`;
  }, [typingUsers, conversation]);

  const presenceLabel = useMemo(() => {
    if (typingLabel) return typingLabel;
    if (!otherUserId) return "Active";
    const p = getPresence(otherUserId);
    return formatPresenceLabel(p, otherParticipant?.name);
  }, [typingLabel, otherUserId, getPresence, otherParticipant?.name]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    const onTyping = (payload: { conversationId: string; userIds: string[] }) => {
      if (payload.conversationId !== conversationId) return;
      setTypingUsers(payload.userIds);
    };
    socket.on("typing:update", onTyping);
    return () => {
      socket.off("typing:update", onTyping);
    };
  }, [socket, conversationId]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    const root = scrollContainerRef.current;
    const target = loadMoreRef.current;
    if (!root || !target || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          prevScrollHeightRef.current = root.scrollHeight;
          void fetchNextPage();
        }
      },
      { root, threshold: 0.1 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!isFetchingNextPage && prevScrollHeightRef.current > 0) {
      const root = scrollContainerRef.current;
      if (root) {
        const delta = root.scrollHeight - prevScrollHeightRef.current;
        root.scrollTop += delta;
        prevScrollHeightRef.current = 0;
      }
    }
  }, [isFetchingNextPage, messagesData?.pages?.length]);

  const sendPayload = useCallback(
    async (payload: {
      content?: string;
      type: "text" | "image" | "file" | "voice";
      media?: Message["media"];
      clientId?: string;
    }) => {
      if (!conversationId) return;
      const clientId = payload.clientId ?? crypto.randomUUID();

      if (socket?.connected) {
        return new Promise<void>((resolve, reject) => {
          socket.emit(
            "message:send",
            { conversationId, ...payload, clientId },
            (ack: { success: boolean }) => {
              if (ack?.success) {
                setTimeout(() => scrollToBottom("smooth"), 50);
                resolve();
              } else {
                mutate(
                  { ...payload, clientId },
                  {
                    onSuccess: () => {
                      setTimeout(() => scrollToBottom("smooth"), 50);
                      resolve();
                    },
                    onError: () => reject(),
                  },
                );
              }
            },
          );
        });
      }

      await mutateAsync({ ...payload, clientId });
      setTimeout(() => scrollToBottom("smooth"), 50);
    },
    [conversationId, socket, mutate, mutateAsync, scrollToBottom],
  );

  const emitTyping = useCallback(
    (active: boolean) => {
      if (!socket || !conversationId) return;
      socket.emit(active ? "typing:start" : "typing:stop", { conversationId });
    },
    [socket, conversationId],
  );

  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, []);

  const handleDraftChange = (value: string) => {
    if (value.length > MAX_MESSAGE_LENGTH) return;
    setDraft(value);
    emitTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(false), 1500);
  };

  const handleSendText = async () => {
    const content = draft.trim();
    if (!content || !conversationId) return;
    setDraft("");
    emitTyping(false);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    try {
      await sendPayload({ content, type: "text" });
    } catch {
      toast.error("Failed to send message");
      setDraft(content);
    }
  };

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        Please sign in to view messages.
      </div>
    );
  }

  if (conversationLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading conversation…
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muted/30 px-6 text-center">
        <p className="font-serif text-2xl text-foreground">Conversation not found</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          <Link href={routes.chatInbox} className="text-primary underline-offset-4 hover:underline">
            Back to inbox
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-background">
      <InboxTopbar
        avatarUrl={avatarUrl || user.avatarUrl}
        name={title || otherParticipant?.name || "Unknown User"}
        status={presenceLabel}
        username={otherParticipant?.username}
        showBack
        profileHref={
          otherParticipant?.username
            ? routes.userProfile(otherParticipant.username)
            : undefined
        }
        actions={
          <ConversationMenu
            conversationRef={slug}
            currentNickname={conversation.nickname}
            onMarkRead={markReadNow}
          />
        }
      />

      <div
        ref={scrollContainerRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-4"
      >
        {messagesLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">No messages yet. Say hello.</p>
          </div>
        ) : (
          <div className="mx-auto mt-auto flex w-full max-w-5xl flex-col gap-3">
            <div ref={loadMoreRef} className="flex h-6 items-center justify-center">
              {isFetchingNextPage && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {messages.map((message) => {
              const isMe = message.senderId === user.id;
              const showSeen =
                isMe && message.id === lastOwnMessageId && peerHasReadLatest;

              return (
                <MessageBubble
                  key={message.id || message.clientId}
                  isMessagePending={!message.id && messageSendPending}
                  message={message}
                  isMe={isMe}
                  showSeen={showSeen}
                />
              );
            })}

            <div ref={bottomRef} className="h-1 shrink-0" />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t bg-background px-3 py-2 sm:px-4 sm:py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSendText();
          }}
          className="flex items-center gap-2 rounded-full border bg-muted/20 px-3 py-2 focus-within:ring-1 focus-within:ring-primary/30 sm:px-4"
        >
          <EmojiPickerComponent onChange={(emoji) => setDraft((p) => p + emoji)} />
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => handleDraftChange(e.target.value)}
            placeholder={`Message ${title || otherParticipant?.name || "user"}…`}
            className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex shrink-0 items-center gap-1">
            {draft.trim().length > 0 ? (
              <button
                type="submit"
                className="rounded-full p-2 text-primary hover:bg-muted active:scale-95"
              >
                <SendHorizontal className="h-[18px] w-[18px]" />
              </button>
            ) : (
              <>
                <button type="button" onClick={() => toast.info("Voice notes coming soon")} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                  <Mic className="h-[18px] w-[18px]" />
                </button>
                <button type="button" onClick={() => toast.info("Media attachments coming soon")} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                  <ImageIcon className="h-[18px] w-[18px]" />
                </button>
                <button type="button" onClick={() => toast.info("Stickers coming soon")} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                  <Sticker className="h-[18px] w-[18px]" />
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
