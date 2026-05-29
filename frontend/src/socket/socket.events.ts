import { Message } from "@/types/types";

export type SocketEvents = {
  "message:new": { message: Message };
  "typing:update": { conversationId: string; userIds: string[] };
  "message:read": {
    conversationId: string;
    userId: string;
    lastReadAt: string;
  };
  "presence:update": {
    userId: string;
    isOnline: boolean;
    lastSeenAt?: string;
  };
};

export type SocketEmitEvents = {
  "conversation:join": { conversationId: string };
  "conversation:leave": { conversationId: string };
  "message:send": {
    conversationId: string;
    content?: string;
    type?: Message["type"];
    media?: Message["media"];
    clientId?: string;
  };
  "typing:start": { conversationId: string };
  "typing:stop": { conversationId: string };
  "message:read": { conversationId: string };
};
