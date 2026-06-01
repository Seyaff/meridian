"use client";

import { Home, Search, Send } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useGetConversations } from "@/hooks/chat/use-getConversations";

const navMainItems = [
  { label: "Home", icon: Home, href: "/chat" },
  { label: "Search", icon: Search, href: "/search" },
  { label: "Messages", icon: Send, href: "/chat/inbox" },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/chat/inbox") {
    return pathname === href || pathname.startsWith("/chat/inbox/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavMain({ expanded }: { expanded: boolean }) {
  const pathname = usePathname();
  const { data } = useGetConversations();

  const unreadConversations =
    data?.conversations?.filter((c: { unreadCount: number }) => c.unreadCount > 0)
      .length ?? 0;

  const badgeLabel =
    unreadConversations > 4 ? "4+" : String(unreadConversations);

  return (
    <nav className="flex flex-1 flex-col justify-center gap-1 p-2">
      {navMainItems.map((item) => {
        const Icon = item.icon;
        const isActive = isNavActive(pathname, item.href);
        const isMessages = item.label === "Messages";

        return (
          <Link
            key={item.href}
            href={item.href}
            title={!expanded ? item.label : undefined}
            className={cn(
              "relative flex h-10 items-center rounded-lg transition-colors duration-200",
              expanded ? "gap-3 px-3" : "justify-center px-0",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <div className="relative shrink-0">
              <Icon className="size-5" />
              {isMessages && unreadConversations > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
                  {badgeLabel}
                </span>
              )}
            </div>

            <span
              className={cn(
                "overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300",
                expanded ? "w-auto opacity-100" : "w-0 opacity-0",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
