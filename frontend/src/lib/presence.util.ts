import { UserPresence } from "@/types/types";

export function formatPresenceLabel(
  presence: UserPresence | undefined,
  name?: string,
): string {
  if (!presence) return "Offline";
  if (presence.isOnline) return "Online";
  if (presence.lastSeenAt) {
    const date = new Date(presence.lastSeenAt);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 1) return "Last seen just now";
    if (diffMin < 60) return `Last seen ${diffMin}m ago`;
    if (diffMin < 1440) return `Last seen ${Math.floor(diffMin / 60)}h ago`;
    return `Last seen ${date.toLocaleDateString()}`;
  }
  return name ? `${name} is offline` : "Offline";
}
