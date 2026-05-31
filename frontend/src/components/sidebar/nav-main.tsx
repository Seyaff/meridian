"use client";

import { Home, Search, Send } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import { useGetConversations } from "@/hooks/chat/use-getConversations";

const navMainItems = [
  { label: "Home", icon: Home, href: "/chat" },
  { label: "Search", icon: Search, href: "/search" },
  { label: "Messages", icon: Send, href: "/chat/inbox" },
];

export default function NavMain() {
  const pathname = usePathname();
  const { open } = useSidebar();

  const { data } = useGetConversations();

  const unreadConversations =
    data?.conversations?.filter((c: any) => c.unreadCount > 0).length ?? 0;

  return (
    <SidebarGroup className="p-2 transition-all duration-300 flex flex-1 items-center justify-center">
      <SidebarMenu className="gap-1">
        {navMainItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const messageIcon = item.label === "Messages";

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.label}
                className="h-10 w-full transition-all duration-300"
              >
                <Link
                  href={item.href}
                  className={`flex items-center w-full h-full transition-all duration-300 ${
                    open ? "justify-start px-3 gap-3" : "justify-center px-0"
                  }`}
                >
                  <div className="relative">
                    <Icon className="size-4 shrink-0" />

                    {messageIcon && unreadConversations > 0 && (
                      <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[16px] h-[16px] rounded-full bg-red-600 text-white text-[10px]">
                        {unreadConversations}
                      </span>
                    )}
                  </div>

                  {open && (
                    <span className="font-medium text-sm text-foreground tracking-wide whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
