"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

import { useGetConversation } from "@/hooks/chat/use-getConversation";
import InboxTopbar from "@/components/inbox/topbar";
import { Image as ImageIcon, Mic, Sticker, SendHorizontal } from "lucide-react";
import EmojiPickerComponent from "@/components/chat/emoji-picker";
import { useAuth } from "@/components/providers/auth-provider";
import { useSocket } from "@/components/providers/socket-provider";
import useChatRealtime from "@/hooks/chat/useChatRealtime";
import { useMessages, useSendMessage } from "@/hooks/chat/useMessages";
import {
  getConversationAvatar,
  getConversationTitle,
  getOtherParticipantId,
} from "@/lib/chat-util";
import { Message } from "@/types/types";
import Link from "next/link";
import { MessageBubble } from "@/components/chat/message-bubble";
import { toast } from "sonner";

const MAX_MESSAGE_LENGTH = 4000;

export default function SingleChatPage() {
  const [draft, setDraft] = useState("");
  const [peerLastReadAt, setPeerLastReadAt] = useState<string | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

 

  const socket = useSocket();
  const params = useParams();

  const conversationId = (params?.id as string) || "";

  const { data, isLoading: conversationLoading } =
    useGetConversation(conversationId);
  const { user } = useAuth();

  const conversation = data?.conversation;

  const {
    data: messagesData,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId || null);

  const {
    mutate,
    mutateAsync,
    isPending: messageSendPending,
    isError: messageError,
  } = useSendMessage(conversationId);

  const otherUserId =
    conversation && user
      ? getOtherParticipantId(conversation, user.id)
      : undefined;

  useChatRealtime(conversationId, user?.id || "", (lastReadAt) => {
    setPeerLastReadAt(lastReadAt);
  });

  const messages = useMemo(() => {
    if (!messagesData?.pages) return [];
    return (
      messagesData.pages
        .slice()
        .reverse()
        .flatMap((page: any) => page?.result?.messages || []) ?? []
    );
  }, [messagesData?.pages]);

  const title =
    conversation && user ? getConversationTitle(conversation, user.id) : "";
  const avatarUrl =
    conversation && user
      ? getConversationAvatar(conversation, user.id)
      : undefined;

  const otherParticipant = useMemo(() => {
    if (!conversation || !user || conversation.type !== "dm") return null;
    return (
      conversation.participants.find((p: any) => p.userId !== user.id) ?? null
    );
  }, [conversation, user]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("instant");
    }
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (otherParticipant?.lastReadAt) {
      setPeerLastReadAt(otherParticipant.lastReadAt);
    }
  }, [otherParticipant?.lastReadAt, conversationId]);

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
            (ack: { success: boolean; message?: string }) => {
              if (ack?.success) {
                scrollToBottom();
                resolve();
              } else {
                mutate(
                  { ...payload, clientId },
                  {
                    onSuccess: () => {
                      scrollToBottom();
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
      scrollToBottom();
    },
    [conversationId, socket, mutate, scrollToBottom],
  );

  const emitTyping = useCallback(
    (active: boolean) => {
      if (!socket || !socket.connected || !conversationId) return;
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

  const handleEmojiSelect = (emoji: string) => {
    setDraft((prev) => prev + emoji);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleMicClick = () => toast.info("Voice notes feature coming soon!");
  const handleImageClick = () =>
    toast.info("Media attachments feature coming soon!");
  const handleStickerClick = () =>
    toast.info("Sticker pack integration coming soon!");

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        User nahi hai bhaiya
      </div>
    );
  }

  if (conversationLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-muted-foreground text-sm">
        Loading conversation...
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muted/30 px-6 text-center">
        <p className="font-serif text-2xl text-foreground">
          Select a conversation
        </p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Pick a chat from the sidebar or{" "}
          <Link
            href="/people"
            className="text-primary underline-offset-4 hover:underline"
          >
            find someone new
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      <InboxTopbar
        avatarUrl={avatarUrl || user.avatarUrl}
        name={title || otherParticipant?.name || "Unknown User"}
        username={otherParticipant?.username}
      />

      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {messagesLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading messages…</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No messages yet. Say hello.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w- flex-col gap-3 justify-end mt-auto">
            {messages.map((message: any) => {
              const isMe = message.senderId === user?.id;
              const isSeen =
                isMe &&
                !!peerLastReadAt &&
                new Date(peerLastReadAt) >= new Date(message.createdAt);
              return (
                <MessageBubble
                  key={message.id || message.clientId}
                  isMessagePending={messageSendPending}
                  message={message}
                  isMe={isMe}
                  isSeen={isSeen}
                />
              );
            })}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t px-4 py-3 bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendText();
          }}
          className="flex items-center gap-2 rounded-full border bg-muted/20 px-4 py-2 focus-within:ring-1 focus-within:ring-primary/30"
        >
          <div className="shrink-0">
            <EmojiPickerComponent onChange={handleEmojiSelect} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => handleDraftChange(e.target.value)}
            placeholder={`Message ${otherParticipant?.name || "user"}...`}
            className="flex-1 bg-transparent px-2 py-1.5 outline-none text-sm placeholder:text-muted-foreground"
          />

          <div className="flex items-center gap-1 shrink-0">
            {draft.trim().length > 0 ? (
              <button
                type="submit"
                className="rounded-full p-2 text-primary hover:bg-muted transition active:scale-95"
              >
                <SendHorizontal className="h-[18px] w-[18px] stroke-[2]" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleMicClick}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition active:scale-95"
                >
                  <Mic className="h-[18px] w-[18px] stroke-[1.9]" />
                </button>

                <button
                  type="button"
                  onClick={handleImageClick}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition active:scale-95"
                >
                  <ImageIcon className="h-[18px] w-[18px] stroke-[1.9]" />
                </button>

                <button
                  type="button"
                  onClick={handleStickerClick}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition active:scale-95"
                >
                  <Sticker className="h-[18px] w-[18px] stroke-[1.9]" />
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
