"use client";

import InboxSidebar from "@/components/sidebar/inbox-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "60rem",
          "--sidebar-width-mobile": "20rem",
        } as React.CSSProperties
      }
    >
      {/* Secondary Custom-Width Sidebar */}
      <InboxSidebar />

      {/* Active Message Pane Viewport */}
      <main className="flex-1 bg-background relative flex flex-col min-w-0">
        {children}
      </main>
    </SidebarProvider>
  );
}
