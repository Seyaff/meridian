
import { formatMessageTime } from "@/lib/chat-util";
import { resolveMediaUrl } from "@/lib/media.util";
import { Message } from "@/types/types";
import { Download, FileText, Mic } from "lucide-react";
import { useState } from "react";

type Props = {
  message: Message;
  isMe: boolean;
  showSeen?: boolean;
  isMessagePending: boolean;
};

export function MessageBubble({
  message,
  isMe,
  showSeen,
  isMessagePending,
}: Props) {
  const time = formatMessageTime(message.createdAt);
  

  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isMe
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border bg-card text-card-foreground"
        }`}
      >
        {message.type === "image" && message.media && (
          <a
            href={resolveMediaUrl(message.media.url)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={resolveMediaUrl(message.media.url)}
              alt={message.media.filename}
              className="mb-2 max-h-64 rounded-lg object-cover"
            />
          </a>
        )}

        {message.type === "voice" && message.media && (
          <div className="mb-2 flex items-center gap-2">
            <Mic size={16} className="shrink-0 opacity-80" />
            <audio
              controls
              src={resolveMediaUrl(message.media.url)}
              className="max-w-full"
            />
          </div>
        )}

        {message.type === "file" && message.media && (
          <a
            href={resolveMediaUrl(message.media.url)}
            target="_blank"
            rel="noopener noreferrer"
            className={`mb-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              isMe ? "border-primary-foreground/20" : "border-border"
            }`}
          >
            <FileText size={18} />
            <span className="truncate">{message.media.filename}</span>
            <Download size={14} className="shrink-0" />
          </a>
        )}

        {message.content &&
          (message.type === "text" || message.content !== message.media?.filename) && (
            <p className="text-sm leading-relaxed">{message.content}
            {isMessagePending && <p>sending ...</p>}
            </p>
          )}

        <p
          className={`mt-1.5 text-right text-xs ${
            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {time}
        </p>
      </div>

      {isMe && showSeen && (
        <p className="mt-1 text-xs text-muted-foreground">Seen just now</p>
      )}
    </div>
  );
}
