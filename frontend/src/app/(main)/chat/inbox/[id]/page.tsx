"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";

import { useGetConversation } from "@/hooks/chat/use-getConversation";

import InboxTopbar from "@/components/inbox/topbar";

import {
  Image as ImageIcon,
  Mic,
  Sticker,
  SendHorizontal,
} from "lucide-react";

import EmojiPickerComponent from "@/components/chat/emoji-picker";
import { useAuth } from "@/components/providers/auth-provider";
import { useSocket } from "@/components/providers/socket-provider";

export default function SingleChatPage() {
  const socket = useSocket()
  const params = useParams();
  const conversationId = params?.id as string;

  const { data, isLoading } = useGetConversation(conversationId);
  const {user} = useAuth()

  const conversation = data?.conversation;

  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUserId = user?.id
  const otherParticipant = useMemo(() => {
    if (!conversation?.participants) return null;

    return conversation.participants.find(
      (participant: any) => participant.userId !== currentUserId
    );
  }, [conversation]);

  
useEffect(() => {
  if (!socket || !conversationId) return;

  socket.emit("conversation:join", conversationId);

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("message:new", (data) => {
    console.log("listened");
    console.log(data);
  });

  return () => {
    socket.off("connect");
    socket.off("message:new");

    socket.emit("conversation:leave", conversationId);
  };
}, [socket, conversationId]);

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    console.log("Sending:", message);

    setMessage("");
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="">Loading conversation...</p>
      </div>
    );
  }


  return (
    <div className="w-full h-screen flex flex-col">
      
      {/* TOPBAR */}
      <InboxTopbar
        avatarUrl={user?.avatarUrl}
        name={otherParticipant?.name || "Unknown User"}
        username={otherParticipant?.username}
      />

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Messages map here */}
      </div>

      {/* INPUT BAR */}
      <div className="border-t  px-4 py-3">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 rounded-full border b px-4 py-2"
        >
          {/* Emoji */}
          <div className="shrink-0">
            <EmojiPickerComponent onChange={handleEmojiSelect} />
          </div>

          {/* INPUT */}
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${
              otherParticipant?.name || "user"
            }...`}
            className="flex-1 bg-transparent px-2 py-1.5 outline-none"
          />

          {/* ACTIONS */}
          <div className="flex items-center gap-1 shrink-">
            
            <button
              type="button"
              className="rounded-full p-2 transition active:scale-95"
            >
              <Mic className="h-[18px] w-[18px] stroke-[1.9]" />
            </button>

            <button
              type="button"
              className="rounded-full p-2 transition  active:scale-95"
            >
              <ImageIcon className="h-[18px] w-[18px] stroke-[1.9]" />
            </button>

            <button
              type="button"
              className="rounded-full p-2 transition  active:scale-95"
            >
              <Sticker className="h-[18px] w-[18px] stroke-[1.9]" />
            </button>

            {/* SEND BUTTON */}
            {message.trim() && (
              <button
                type="submit"
                className="ml-1 rounded-full  transition hover:scale-105 active:scale-95"
              >
                <SendHorizontal className="h-4 w-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}