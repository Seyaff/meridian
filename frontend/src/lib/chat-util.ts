import { Conversation } from "@/types/types";

export function getOtherParticipantId(
  conversation: Conversation,
  currentUserId: string,
): string | undefined {
  if (conversation.type !== "dm") return undefined;
  return conversation.participants.find((p) => p.userId !== currentUserId)?.userId;
}

export function getConversationTitle(
  conversation: Conversation,
  currentUserId: string,
): string {
  if (conversation.nickname?.trim()) {
    return conversation.nickname.trim();
  }
  if (conversation.type === "group" && conversation.name) {
    return conversation.name;
  }
  const other = conversation.participants.find((p) => p.userId !== currentUserId);
  return other?.name ?? other?.username ?? "Conversation";
}

export function getConversationAvatar(
  conversation: Conversation,
  currentUserId: string,
): string | undefined {
  if (conversation.type === "group") {
    return conversation.avatarUrl;
  }
  const other = conversation.participants.find((p) => p.userId !== currentUserId);
  return other?.avatarUrl;
}


export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}