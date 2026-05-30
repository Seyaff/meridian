"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react"; // 👈 Imported useMemo for sorting performance

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
} from "@/components/ui/sidebar";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";

import { useAuth } from "../providers/auth-provider";
import { useGetConversations } from "@/hooks/chat/use-getConversations";

export default function InboxSidebar() {
  const { user } = useAuth();
  const { data, isPending } = useGetConversations();

  const params = useParams();
  
  // 💡 Note: In your SingleChatPage, you read params?.id. 
  // Make sure this matches the dynamic route folder name (e.g., [id] vs [conversationId])
  const activeId = (params?.id || params?.conversationId) as string;

  // 1. Process and sort conversations so the newest updates float to the top
  const sortedConversations = useMemo(() => {
    const rawConversations = data?.conversations || [];
    
    return [...rawConversations].sort((a: any, b: any) => {
      // Use last message timestamp if available; fall back to the conversation creation time
      const timeA = new Date(a.lastMessage?.createdAt || a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.lastMessage?.createdAt || b.updatedAt || b.createdAt).getTime();
      return timeB - timeA; // Descending order (newest first)
    });
  }, [data?.conversations]);

  if (isPending) {
    return <div className="p-4 text-sm text-muted-foreground">Loading ...</div>;
  }

  return (
    <Sidebar
      collapsible="none"
      className="w-64 border-r border-border/40 bg-zinc-50/40 dark:bg-zinc-950/10 shrink-0 h-screen hidden md:flex"
    >
      <SidebarHeader className="h-14 border-b border-border/40 px-4 flex items-center">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          Messages
        </h2>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup className="px-0">
          <SidebarMenu className="gap-1">
            {sortedConversations.map((chat: any) => {
              const isActive = activeId === chat.id;

              const opposingParticipant = chat.participants?.find(
                (p: any) => p.userId !== user?.id 
              );

              const chatName = chat.type === "dm" ? opposingParticipant?.name : chat.name;
              
              // 2. Updated preview parser to check for '.content' based on your payload schema
              const chatPreview = chat.lastMessage?.content || "No messages yet";
              
              const chatAvatar = opposingParticipant?.avatarUrl; 

              return (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className="h-auto p-0 data-[active=true]:bg-sidebar-accent rounded-lg overflow-hidden"
                  >
                    <Link
                      href={`/chat/inbox/${chat.id}`}
                      className="w-full flex items-start gap-3 px-3 py-2.5"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={chatAvatar}
                          alt={chatName || "User"}
                        />
                        <AvatarFallback>
                          {chatName?.slice(0, 2).toUpperCase() || "DM"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium text-sm text-foreground truncate">
                          {chatName}
                        </span>

                        <span className="text-xs text-muted-foreground truncate">
                          {chatPreview}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}