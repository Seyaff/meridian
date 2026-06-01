"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "../providers/auth-provider";
import { useGetConversations } from "@/hooks/chat/use-getConversations";

function formatUnreadBadge(count: number) {
  if (count <= 0) return null;
  return count > 4 ? "4+" : String(count);
}

type Props = {
  className?: string;
};

export default function InboxSidebar({ className }: Props) {
  const { user } = useAuth();
  const { data, isPending } = useGetConversations();
  const params = useParams();
  const activeId = (params?.id || params?.conversationId) as string;

  const sortedConversations = useMemo(() => {
    const raw = data?.conversations || [];
    return [...raw].sort((a, b) => {
      const timeA = new Date(
        a.lastMessage?.createdAt || a.updatedAt || a.createdAt,
      ).getTime();
      const timeB = new Date(
        b.lastMessage?.createdAt || b.updatedAt || b.createdAt,
      ).getTime();
      return timeB - timeA;
    });
  }, [data?.conversations]);

  return (
    <aside
      className={cn(
        "h-screen w-full max-w-sm shrink-0 flex-col border-r border-border/40 bg-zinc-50/40 dark:bg-zinc-950/10 md:w-72",
        className,
      )}
    >
      <div className="flex h-14 shrink-0 items-center border-b border-border/40 px-4">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          Messages
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isPending ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : sortedConversations.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No conversations yet</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {sortedConversations.map((chat) => {
              const isActive = activeId === chat.id;
              const opposing = chat.participants?.find(
                (p: { userId: string }) => p.userId !== user?.id,
              );
              const chatName =
                chat.type === "dm" ? opposing?.name : chat.name;
              const chatPreview =
                chat.lastMessage?.content || "No messages yet";
              const chatAvatar = opposing?.avatarUrl;
              const unread = chat.unreadCount ?? 0;
              const hasUnread = unread > 0;
              const badge = formatUnreadBadge(unread);
              const isIncoming =
                hasUnread &&
                chat.lastMessage?.senderId &&
                chat.lastMessage.senderId !== user?.id;

              return (
                <li key={chat.id}>
                  <Link
                    href={`/chat/inbox/${chat.id}`}
                    className={cn(
                      "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      isActive
                        ? "bg-sidebar-accent"
                        : "hover:bg-sidebar-accent/60",
                    )}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={chatAvatar} alt={chatName || "User"} />
                      <AvatarFallback>
                        {chatName?.slice(0, 2).toUpperCase() || "DM"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm",
                            hasUnread
                              ? "font-bold text-foreground"
                              : "font-medium text-foreground",
                          )}
                        >
                          {chatName}
                        </span>
                        {badge && (
                          <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                            {badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "truncate text-xs",
                          isIncoming
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {chatPreview}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
