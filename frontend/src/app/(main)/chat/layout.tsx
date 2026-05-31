"use client";

import ChatSidebar from "@/components/chat/chat-sidebar";
import { SocketProvider } from "@/components/providers/socket-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
    
      <ChatSidebar />

      
      <div className="flex flex-1 flex-row min-h-screen w-full relative">
        <SocketProvider>{children}</SocketProvider>
      </div>
    </SidebarProvider>
  );
}
